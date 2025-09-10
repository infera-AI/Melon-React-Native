package com.melon.utils

import android.app.Activity
import android.content.Context
import android.os.Bundle
import android.util.Log
import com.bytedance.sdk.openadsdk.AdSlot
import com.bytedance.sdk.openadsdk.TTAdConstant
import com.bytedance.sdk.openadsdk.TTAdLoadType
import com.bytedance.sdk.openadsdk.TTAdManager
import com.bytedance.sdk.openadsdk.TTAdNative
import com.bytedance.sdk.openadsdk.TTAdSdk
import com.bytedance.sdk.openadsdk.TTAppDownloadListener
import com.bytedance.sdk.openadsdk.TTRewardVideoAd
import com.melon.MainApplication

/**
 * 穿山甲激励广告工具类（最终修复版）
 */
class PangleRewardAdUtil private constructor() {
    companion object {
        private const val TAG = "TTAdSdk"
        @Volatile
        private var instance: PangleRewardAdUtil? = null

        fun getInstance(): PangleRewardAdUtil {
            return instance ?: synchronized(this) {
                instance ?: PangleRewardAdUtil().also { instance = it }
            }
        }
    }

    // 广告核心对象
    private var ttAdNative: TTAdNative? = null
    var rewardVideoAd: TTRewardVideoAd? = null

    // 监听接口
    private var adListener: RewardAdListener? = null
    private var downloadListener: TTAppDownloadListener? = null
    private var playAgainListener: PlayAgainListener? = null

    // 配置参数
    private var codeId: String = ""
    private var mediaExtra: String? = null
    private var rewardAmount: Int = 100
    private var rewardName: String = "金币"
    private var isAdvancedRewardEnabled: Boolean = false
    private var nextPlayAgainCount: Int = 1


    /**
     * 初始化广告基础配置
     */
    fun init(codeId: String) {
        this.codeId = codeId
        // 修复点1：TTAdSdk.isSdkReady() 是方法而非属性
        if (TTAdSdk.isSdkReady()) {
            val adManager: TTAdManager = TTAdSdk.getAdManager()
            val appContext = MainApplication.instance.applicationContext
            this.ttAdNative = adManager.createAdNative(appContext)
            Log.i(TAG, "TTAdNative 初始化成功")
        } else {
            Log.e(TAG, "SDK未初始化完成，无法创建TTAdNative")
        }
    }

    // 配置设置方法
    fun setRewardInfo(rewardName: String, rewardAmount: Int) {
        this.rewardName = rewardName
        this.rewardAmount = rewardAmount
        Log.i(TAG, "设置奖励信息：$rewardName x $rewardAmount")
    }

    fun setMediaExtra(mediaExtra: String) {
        this.mediaExtra = mediaExtra
    }

    fun enableAdvancedReward(enable: Boolean) {
        this.isAdvancedRewardEnabled = enable
        Log.i(TAG, "进阶奖励功能：${if (enable) "已启用" else "已禁用"}")
    }

    // 监听设置方法
    fun setRewardAdListener(listener: RewardAdListener) {
        this.adListener = listener
    }

    fun setDownloadListener(listener: TTAppDownloadListener) {
        this.downloadListener = listener
    }

    fun setPlayAgainListener(listener: PlayAgainListener) {
        this.playAgainListener = listener
    }

    /**
     * 加载激励广告（修复了参数类型错误）
     */
    // 修复点2：参数类型改为TTAdLoadType枚举
    fun loadAd(loadType: TTAdLoadType) {
        // 1. 校验前置条件
        when {
            // 修复点1：TTAdSdk.isSdkReady() 是方法而非属性
            !TTAdSdk.isSdkReady() -> {
                notifyAdLoadFailed(-1, "SDK未初始化完成")
                return
            }
            ttAdNative == null -> {
                notifyAdLoadFailed(-2, "TTAdNative未初始化（请先调用init()）")
                return
            }
            !codeId.matches(Regex("^9\\d{8}$")) -> {
                notifyAdLoadFailed(-3, "广告位ID无效（需9开头9位数字）")
                return
            }
        }

        // 2. 构建广告请求参数
        val adSlotBuilder = AdSlot.Builder()
            .setCodeId(codeId)
            // 修复点2：直接使用TTAdLoadType枚举类型
            .setAdLoadType(loadType)
//            .setRewardName(rewardName)
//            .setRewardAmount(rewardAmount)
//            .setMediaExtra(mediaExtra)
//            .setSupportDeepLink(true)
            // 修复点3：使用正确的方向常量
            .setOrientation(TTAdConstant.VERTICAL) // 竖屏
            // .setOrientation(TTAdConstant.HORIZONTAL) // 横屏
//            .build()
        // 3. 可选：添加奖励参数（V≥5.2.0.4生效，用于「广告中显示奖励内容」，优先级高于平台配置）
        if (rewardName.isNotEmpty() && rewardAmount > 0) {
            adSlotBuilder.setRewardName(rewardName) // 奖励名称（如“金币”）
            adSlotBuilder.setRewardAmount(rewardAmount) // 奖励数量（如100）
        }

        // 4. 可选：添加用户透传信息（文档：仅支持单个JSON对象，不嵌套）
        mediaExtra?.takeIf { it.isNotEmpty() }?.let {
            adSlotBuilder.setMediaExtra(it) // 例："{\"user_id\":\"123456\",\"scene\":\"get_coin\"}"
        }

        val adSlot = adSlotBuilder.build()
        Log.i(TAG, "AdSlot构建完成：codeId=$codeId，加载类型=${if (loadType == TTAdLoadType.LOAD) "实时" else "预加载"}")

        // 5. 发起广告请求
        ttAdNative?.loadRewardVideoAd(adSlot, object : TTAdNative.RewardVideoAdListener {
            override fun onError(code: Int, message: String?) {
                Log.e(TAG, "广告加载失败：code=$code，msg=${message ?: "无信息"}")
                notifyAdLoadFailed(code, message ?: "无错误信息")
            }

            override fun onRewardVideoAdLoad(ad: TTRewardVideoAd) {
                Log.i(TAG, "广告基础信息加载成功（可立即展示）")
                rewardVideoAd = ad
                setAdInteractionListener(ad)
                setAdDownloadListener(ad)
                adListener?.onAdLoaded()
            }

            override fun onRewardVideoCached() {
                Log.w(TAG, "onRewardVideoCached 已废弃，请使用 onRewardVideoCached(TTRewardVideoAd ad)")
            }

            override fun onRewardVideoCached(ad: TTRewardVideoAd) {
                Log.i(TAG, "广告素材缓存完成（最佳展示时机）")
                rewardVideoAd = ad
                setAdInteractionListener(ad)
                setAdDownloadListener(ad)
                adListener?.onAdCached()
            }
        })
    }

    /**
     * 展示激励广告
     */
    fun showAd(activity: Activity): Boolean {
        // 文档：检查Activity状态（必须活跃）
        if (activity.isFinishing || activity.isDestroyed) {
            Log.e(TAG, "展示失败（文档：Activity无效）：已销毁/正在销毁")
            adListener?.onAdShowFailed("Activity无效")
            return false
        }

        val ad = rewardVideoAd ?: run {
            Log.e(TAG, "展示失败（文档：广告未加载）：TTRewardVideoAd对象为空")
            adListener?.onAdShowFailed("广告未加载")
            return false
        }

        // 文档：检查广告是否过期
//        if (System.currentTimeMillis() > ad.expirationTimestamp) {
//            Log.e(TAG, "展示失败（文档：广告过期）：过期时间=${ad.expirationTimestamp}")
//            adListener?.onAdShowFailed("广告已过期")
//            releaseAd()
//            return false
//        }

        // 文档：展示广告（必须传入Activity）
        ad.showRewardVideoAd(activity)
        Log.i(TAG, "广告开始展示（文档：showRewardVideoAd(activity)）")
        return true
    }

    /**
     * 释放广告资源M
     */
    fun releaseAd() {
        if (rewardVideoAd != null) {
            rewardVideoAd = null // 文档未提但需释放，避免内存泄漏
            Log.i(TAG, "广告资源已释放（避免内存泄漏）")
        }
        nextPlayAgainCount = 1
    }

    // 内部辅助方法
    private fun setAdInteractionListener(ad: TTRewardVideoAd) {
        ad.setRewardAdInteractionListener(object : TTRewardVideoAd.RewardAdInteractionListener {
            // 文档：广告展示回调（每个广告仅一次）
            override fun onAdShow() {
                Log.i(TAG, "广告展示（文档：onAdShow）")
                adListener?.onAdShown()
            }

            // 文档：广告点击回调
            override fun onAdVideoBarClick() {
                Log.i(TAG, "广告点击（文档：onAdVideoBarClick）")
                adListener?.onAdClicked()
            }

            // 文档：广告关闭回调
            override fun onAdClose() {
                Log.i(TAG, "广告关闭（文档：onAdClose）")
                adListener?.onAdClosed()
                releaseAd() // 关闭后释放资源（文档未提但需避免内存泄漏）
            }

            // 文档：视频完整播放完成（未跳过）
            override fun onVideoComplete() {
                Log.i(TAG, "视频播放完成（文档：onVideoComplete）")
                adListener?.onVideoCompleted()
            }

            // 文档：视频播放出错
            override fun onVideoError() {
                Log.e(TAG, "视频播放出错（文档：onVideoError）")
                adListener?.onVideoError()
                releaseAd()
            }

            // 文档：已废弃，无需处理
            override fun onRewardVerify(
                rewardVerify: Boolean,
                rewardAmount: Int,
                rewardName: String?,
                errorCode: Int,
                errorMsg: String?
            ) {
                Log.w(TAG, "文档：onRewardVerify（旧接口）已废弃，使用onRewardArrived")
            }

            // 文档：核心奖励回调（必须在此处理奖励发放）
            override fun onRewardArrived(
                isRewardValid: Boolean,
                rewardType: Int,
                extraInfo: Bundle?
            ) {
                val rewardModel = RewardBundleModel(extraInfo ?: Bundle())
                // 文档：从extraInfo解析奖励信息（错误码、名称、数量）
                val errorCode = rewardModel.getServerErrorCode()
                val errorMsg = rewardModel.getServerErrorMsg()
                val rewardName = rewardModel.getRewardName()
                val rewardAmount = rewardModel.getRewardAmount()

                Log.i(TAG, "奖励回调（文档：onRewardArrived）：" +
                        "\n是否有效=$isRewardValid" +
                        "\n奖励类型=${if (rewardType == 0) "基础奖励（文档：rewardType=0）" else "进阶奖励（文档：rewardType=$rewardType）"}" +
                        "\n奖励名称=$rewardName" +
                        "\n奖励数量=$rewardAmount" +
                        "\n错误码=$errorCode（文档：reward_extra_key_error_code）" +
                        "\n错误信息=$errorMsg（文档：reward_extra_key_error_msg）")

                // 文档：奖励发放逻辑（严格按isRewardValid判断）
                adListener?.onRewardArrived(isRewardValid, rewardType, rewardModel)

                // 文档：进阶奖励处理（rewardType>0，需SDK≥4600+白名单+视频>35s）
                if (isAdvancedRewardEnabled && isRewardValid && rewardType > 0) {
                    val proposePercent = rewardModel.getRewardPropose() // 文档：进阶奖励建议百分比
                    Log.i(TAG, "进阶奖励（文档：rewardType>0）：建议发放比例=$proposePercent%")
                    adListener?.onAdvancedReward(rewardModel, rewardType)
                }

                // 文档：奖励无效时，需处理错误（从extraInfo取错误码）
                if (!isRewardValid) {
                    Log.e(TAG, "奖励无效（文档：isRewardValid=false）：code=$errorCode，msg=$errorMsg")
                }
            }

            // 文档：用户跳过视频
            override fun onSkippedVideo() {
                Log.i(TAG, "用户跳过视频（文档：onSkippedVideo，无奖励）")
                adListener?.onVideoSkipped()
            }
        })

        // 再看一个功能（文档高级功能，可选）
        setPlayAgainConfig(ad)
    }

    private fun setPlayAgainConfig(ad: TTRewardVideoAd) {
        val listener = playAgainListener ?: return

        ad.setRewardPlayAgainInteractionListener(object : TTRewardVideoAd.RewardAdInteractionListener {
            override fun onAdShow() {
                val currentCount = nextPlayAgainCount
                Log.i(TAG, "第$currentCount 次再看广告展示")
                listener.onPlayAgainShown(currentCount)
            }

            override fun onAdVideoBarClick() {
                Log.i(TAG, "第$nextPlayAgainCount 次再看广告点击")
                listener.onPlayAgainClicked(nextPlayAgainCount)
            }

            override fun onAdClose() {}

            override fun onVideoComplete() {
                Log.i(TAG, "第$nextPlayAgainCount 次再看视频播放完成")
                listener.onPlayAgainVideoCompleted(nextPlayAgainCount)
            }

            override fun onVideoError() {
                Log.e(TAG, "第$nextPlayAgainCount 次再看视频播放出错")
                listener.onPlayAgainVideoError(nextPlayAgainCount)
            }

            override fun onRewardVerify(
                rewardVerify: Boolean,
                rewardAmount: Int,
                rewardName: String?,
                errorCode: Int,
                errorMsg: String?
            ) {
                Log.w(TAG, "再看广告 onRewardVerify 已废弃")
            }

            override fun onRewardArrived(
                isRewardValid: Boolean,
                rewardType: Int,
                extraInfo: Bundle?
            ) {
                val rewardModel = RewardBundleModel(extraInfo ?: Bundle())
                listener.onPlayAgainRewardArrived(nextPlayAgainCount, isRewardValid, rewardModel)
            }

            override fun onSkippedVideo() {
                Log.i(TAG, "第$nextPlayAgainCount 次再看视频被跳过")
                listener.onPlayAgainVideoSkipped(nextPlayAgainCount)
            }
        })

        ad.setRewardPlayAgainController(object : TTRewardVideoAd.RewardAdPlayAgainController {
            override fun getPlayAgainCondition(
                nextPlayAgainCount: Int,
                callback: TTRewardVideoAd.RewardAdPlayAgainController.Callback
            ) {
                val allowPlayAgain = listener.allowPlayAgain(nextPlayAgainCount)
                val conditionBundle = Bundle().apply {
                    putBoolean("KEY_PLAY_AGAIN_ALLOW", allowPlayAgain)
                    putString("KEY_PLAY_AGAIN_REWARD_NAME", rewardName)
                    putString("KEY_PLAY_AGAIN_REWARD_AMOUNT", "$rewardAmount 个")
                }

                this@PangleRewardAdUtil.nextPlayAgainCount = nextPlayAgainCount
                callback.onConditionReturn(conditionBundle)
            }
        })
    }

    private fun setAdDownloadListener(ad: TTRewardVideoAd) {
        val listener = downloadListener ?: return
        ad.setDownloadListener(object : TTAppDownloadListener {
            override fun onIdle() {
                Log.i(TAG, "下载状态：空闲")
                listener.onIdle()
            }

            override fun onDownloadActive(
                totalBytes: Long,
                currBytes: Long,
                fileName: String?,
                appName: String?
            ) {
                Log.i(TAG, "下载中：总大小=$totalBytes，已下载=$currBytes，应用名=$appName")
                listener.onDownloadActive(totalBytes, currBytes, fileName, appName)
            }

            override fun onDownloadPaused(
                totalBytes: Long,
                currBytes: Long,
                fileName: String?,
                appName: String?
            ) {
                Log.i(TAG, "下载暂停：总大小=$totalBytes，已下载=$currBytes")
                listener.onDownloadPaused(totalBytes, currBytes, fileName, appName)
            }

            override fun onDownloadFailed(
                totalBytes: Long,
                currBytes: Long,
                fileName: String?,
                appName: String?
            ) {
                Log.e(TAG, "下载失败：总大小=$totalBytes，已下载=$currBytes")
                listener.onDownloadFailed(totalBytes, currBytes, fileName, appName)
            }

            override fun onDownloadFinished(
                totalBytes: Long,
                fileName: String?,
                appName: String?
            ) {
                Log.i(TAG, "下载完成：总大小=$totalBytes，应用名=$appName")
                listener.onDownloadFinished(totalBytes, fileName, appName)
            }

            override fun onInstalled(fileName: String?, appName: String?) {
                Log.i(TAG, "应用已安装：应用名=$appName")
                listener.onInstalled(fileName, appName)
            }
        })
    }

    private fun notifyAdLoadFailed(code: Int, msg: String) {
        adListener?.onAdLoadFailed(code, msg)
    }

    // 对外监听接口
    interface RewardAdListener {
        fun onAdLoaded()
        fun onAdCached()
        fun onAdLoadFailed(code: Int, msg: String)
        fun onAdShown()
        fun onAdShowFailed(msg: String)
        fun onAdClicked()
        fun onAdClosed()
        fun onVideoCompleted()
        fun onVideoError()
        fun onVideoSkipped()
        fun onRewardArrived(
            isRewardValid: Boolean,
            rewardType: Int,
            rewardModel: RewardBundleModel
        )
        fun onAdvancedReward(rewardModel: RewardBundleModel, rewardType: Int) {}
    }

    interface PlayAgainListener {
        fun allowPlayAgain(nextPlayAgainCount: Int): Boolean
        fun onPlayAgainShown(playAgainCount: Int)
        fun onPlayAgainClicked(playAgainCount: Int)
        fun onPlayAgainVideoCompleted(playAgainCount: Int)
        fun onPlayAgainVideoError(playAgainCount: Int)
        fun onPlayAgainVideoSkipped(playAgainCount: Int)
        fun onPlayAgainRewardArrived(
            playAgainCount: Int,
            isRewardValid: Boolean,
            rewardModel: RewardBundleModel
        )
    }
}