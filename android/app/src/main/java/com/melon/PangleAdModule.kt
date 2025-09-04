package com.melon

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.bytedance.sdk.openadsdk.TTAdLoadType
import com.bytedance.sdk.openadsdk.TTAdSdk
import com.melon.utils.PangleRewardAdUtil
import com.melon.utils.RewardBundleModel

// 广告事件名（与RN端完全一致，不可修改）
private const val EVENT_AD_INIT_SUCCESS = "PangleAd_onInitSuccess"
private const val EVENT_AD_INIT_FAILED = "PangleAd_onInitFailed"
private const val EVENT_AD_LOADED = "PangleAd_onAdLoaded"
private const val EVENT_AD_LOAD_FAILED = "PangleAd_onAdLoadFailed"
private const val EVENT_AD_SHOWN = "PangleAd_onAdShown"
private const val EVENT_AD_SHOW_FAILED = "PangleAd_onAdShowFailed"
private const val EVENT_AD_CLICKED = "PangleAd_onAdClicked"
private const val EVENT_AD_CLOSED = "PangleAd_onAdClosed"
private const val EVENT_VIDEO_COMPLETED = "PangleAd_onVideoCompleted"
private const val EVENT_VIDEO_ERROR = "PangleAd_onVideoError"
private const val EVENT_VIDEO_SKIPPED = "PangleAd_onVideoSkipped"
private const val EVENT_REWARD_ARRIVED = "PangleAd_onRewardArrived"
private const val EVENT_ADVANCED_REWARD = "PangleAd_onAdvancedReward"

class PangleAdModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    // 广告核心工具类（单例，与MainActivity共用）
    private val rewardAdUtil = PangleRewardAdUtil.getInstance()
    // 流程控制变量
    private var isAdInited = false // 广告是否初始化完成
    private var isAdLoading = false // 广告是否正在加载
    private var lastLoadTime = 0L // 上次加载时间（防频繁请求）
    private val MIN_LOAD_INTERVAL = 30 * 1000L // 最小加载间隔（30秒）

    // RN调用时的Module名称（RN端通过 NativeModules.PangleAd 访问）
    override fun getName(): String = "PangleAd"

    /**
     * 1. 初始化广告（RN端调用，对应原MainActivity的initAdUtil()）
     * @param adCodeId 广告位ID（必传，9开头9位数字）
     * @param options 可选参数（奖励名称、奖励数量、是否启用进阶奖励）
     * @param promise 回调初始化结果给RN
     */
    @ReactMethod
    fun initAd(
        adCodeId: String,
        options: ReadableMap?, // RN传递的可选参数（奖励、进阶奖励）
        promise: Promise
    ) {
        // 前置校验：SDK是否已初始化（依赖MainApplication的TTAdSdk.init()）
        if (!TTAdSdk.isSdkReady()) {
            val errorMsg = "穿山甲SDK未初始化，请先启动App"
            promise.reject("ERROR_SDK_NOT_READY", errorMsg)
            sendEvent(EVENT_AD_INIT_FAILED, createWritableMap("msg" to errorMsg))
            return
        }

        // 前置校验：避免重复初始化
        if (isAdInited) {
            val successMsg = "广告已初始化，无需重复调用"
            promise.resolve(successMsg)
            sendEvent(EVENT_AD_INIT_SUCCESS, createWritableMap("msg" to successMsg))
            return
        }

        try {
            // 必执行：初始化广告位ID（核心逻辑）
            rewardAdUtil.init(adCodeId)
            Log.i("PangleAd", "广告位ID初始化完成：$adCodeId")

            // 可选执行：若RN传了奖励参数，设置奖励信息
            if (options != null) {
                // 解析RN传递的奖励名称（可选）
                val rewardName = if (options.hasKey("rewardName") && !options.isNull("rewardName")) {
                    options.getString("rewardName") ?: ""
                } else {
                    ""
                }

                // 解析RN传递的奖励数量（可选）
                val rewardAmount = if (options.hasKey("rewardAmount") && !options.isNull("rewardAmount")) {
                    options.getInt("rewardAmount")
                } else {
                    0
                }

                // 解析RN传递的进阶奖励开关（可选，默认false）
                val enableAdvancedReward = if (options.hasKey("enableAdvancedReward") && !options.isNull("enableAdvancedReward")) {
                    options.getBoolean("enableAdvancedReward")
                } else {
                    false
                }

                // 仅当奖励名称和数量都有效时，才设置奖励信息
                if (rewardName.isNotEmpty() && rewardAmount > 0) {
                    rewardAdUtil.setRewardInfo(rewardName, rewardAmount)
                }

                // 若启用进阶奖励，执行对应逻辑
                if (enableAdvancedReward) {
                    rewardAdUtil.enableAdvancedReward(true)
                }
            }

            // 初始化成功：更新状态+回调RN
            isAdInited = true
            val successMsg = "广告初始化成功（广告位ID：$adCodeId）"
            promise.resolve(successMsg)
            sendEvent(EVENT_AD_INIT_SUCCESS, createWritableMap("msg" to successMsg))

        } catch (e: Exception) {
            val errorMsg = "广告初始化失败：${e.message ?: "未知错误"}"
            promise.reject("ERROR_AD_INIT", errorMsg)
            sendEvent(EVENT_AD_INIT_FAILED, createWritableMap("msg" to errorMsg))
        }
    }

    /**
     * 2. 加载广告（RN端调用，对应原MainActivity的autoLoadRewardAd()）
     * 注意：必须先调用initAd初始化成功
     */
    @ReactMethod
    fun autoLoadRewardAd(ignore: String, promise: Promise) {
        // 前置校验：是否已初始化
        if (!isAdInited) {
            val errorMsg = "请先调用initAd初始化广告"
            promise.reject("ERROR_AD_NOT_INIT", errorMsg)
            sendEvent(EVENT_AD_LOAD_FAILED, createWritableMap("code" to -100, "msg" to errorMsg))
            return
        }

        // 前置校验：SDK是否就绪
        if (!TTAdSdk.isSdkReady()) {
            val errorMsg = "穿山甲SDK未就绪，无法加载广告"
            promise.reject("ERROR_SDK_NOT_READY", errorMsg)
            sendEvent(EVENT_AD_LOAD_FAILED, createWritableMap("code" to -101, "msg" to errorMsg))
            return
        }

        // 前置校验：防重复加载+间隔控制
        val currentTime = System.currentTimeMillis()
        when {
            isAdLoading -> {
                val errorMsg = "广告正在加载中，请勿重复请求"
                promise.reject("ERROR_AD_LOADING", errorMsg)
                sendEvent(EVENT_AD_LOAD_FAILED, createWritableMap("code" to -2, "msg" to errorMsg))
            }
            rewardAdUtil.rewardVideoAd != null -> {
                val successMsg = "已有广告缓存，可直接调用showAd展示"
                promise.resolve(successMsg)
                sendEvent(EVENT_AD_LOADED, createWritableMap("msg" to successMsg))
            }
//            currentTime - lastLoadTime < MIN_LOAD_INTERVAL -> {
//                val remainTime = (MIN_LOAD_INTERVAL - (currentTime - lastLoadTime)) / 1000
//                val errorMsg = "请求间隔过短，请${remainTime}秒后再试"
//                promise.reject("ERROR_INTERVAL_SHORT", errorMsg)
//                sendEvent(EVENT_AD_LOAD_FAILED, createWritableMap("code" to -3, "msg" to errorMsg))
//            }
            else -> {
                // 开始加载广告
                isAdLoading = true
                lastLoadTime = currentTime
                promise.resolve("开始加载广告（实时加载模式）")
                Log.i("PangleAd", "开始加载广告，上次加载时间：$lastLoadTime")

                // 设置广告回调（同步到RN）
                setAdListener()
                // 调用工具类加载广告（实时加载模式，TTAdLoadType.LOAD）
                rewardAdUtil.loadAd(TTAdLoadType.LOAD)
            }
        }
    }

    /**
     * 3. 展示广告（RN端调用，无需传参，原生自动获取Activity）
     */
    @ReactMethod
    fun showAd(ignore: String, promise: Promise) {
        // 前置校验：是否已初始化
        if (!isAdInited) {
            val errorMsg = "请先调用initAd初始化广告"
            promise.reject("ERROR_AD_NOT_INIT", errorMsg)
            sendEvent(EVENT_AD_SHOW_FAILED, createWritableMap("msg" to errorMsg))
            return
        }

        // 前置校验：是否有广告缓存
        if (rewardAdUtil.rewardVideoAd == null) {
            val errorMsg = "无广告缓存，请先调用autoLoadRewardAd加载"
            promise.reject("ERROR_NO_AD_CACHE", errorMsg)
            sendEvent(EVENT_AD_SHOW_FAILED, createWritableMap("msg" to errorMsg))
            return
        }

        // 核心：自动获取当前活跃的MainActivity（无需RN传递）
        val currentActivity = reactApplicationContext.currentActivity as? MainActivity ?: run {
            val errorMsg = "未获取到MainActivity，无法展示广告"
            promise.reject("ERROR_NO_ACTIVITY", errorMsg)
            sendEvent(EVENT_AD_SHOW_FAILED, createWritableMap("msg" to errorMsg))
            return
        }

        // 校验Activity状态（是否已销毁/正在销毁）
        if (currentActivity.isFinishing || currentActivity.isDestroyed) {
            val errorMsg = "MainActivity已销毁，无法展示广告"
            promise.reject("ERROR_ACTIVITY_DESTROYED", errorMsg)
            sendEvent(EVENT_AD_SHOW_FAILED, createWritableMap("msg" to errorMsg))
            return
        }

        // 调用PangleRewardAdUtil的showAd，传入自动获取的Activity
        try {
            val isShowSuccess = rewardAdUtil.showAd(currentActivity)
            if (isShowSuccess) {
                val successMsg = "广告开始展示"
                promise.resolve(successMsg)
                sendEvent(EVENT_AD_SHOWN, createWritableMap("msg" to successMsg))
            } else {
                val errorMsg = "广告展示失败（Activity状态异常）"
                promise.reject("ERROR_AD_SHOW_FAILED", errorMsg)
                sendEvent(EVENT_AD_SHOW_FAILED, createWritableMap("msg" to errorMsg))
            }
        } catch (e: Exception) {
            val errorMsg = "广告展示失败：${e.message ?: "未知错误"}"
            promise.reject("ERROR_AD_SHOW_EXCEPTION", errorMsg)
            sendEvent(EVENT_AD_SHOW_FAILED, createWritableMap("msg" to errorMsg))
        }
    }

    /**
     * 4. 释放广告资源（RN端页面卸载时调用，避免内存泄漏）
     */
    @ReactMethod
    fun releaseAd(ignore: String, promise: Promise) {
        rewardAdUtil.releaseAd()
        // 重置状态，下次使用需重新初始化
        isAdInited = false
        isAdLoading = false
        lastLoadTime = 0L

        val successMsg = "广告资源已释放，初始化状态已重置"
        promise.resolve(successMsg)
        sendEvent(EVENT_AD_CLOSED, createWritableMap("msg" to successMsg))
    }

    /**
     * 设置广告全生命周期回调（同步到RN）
     */
    private fun setAdListener() {
        rewardAdUtil.setRewardAdListener(object : PangleRewardAdUtil.RewardAdListener {
            // 广告基础信息加载成功（可立即展示）
            override fun onAdLoaded() {
                isAdLoading = false
                sendEvent(EVENT_AD_LOADED, createWritableMap("msg" to "广告基础信息加载成功"))
            }

            // 广告素材缓存完成（最佳展示时机）
            override fun onAdCached() {
                isAdLoading = false
                sendEvent(EVENT_AD_LOADED, createWritableMap("msg" to "广告素材缓存完成，可展示"))
            }

            // 广告加载失败
            override fun onAdLoadFailed(code: Int, msg: String) {
                isAdLoading = false
                sendEvent(EVENT_AD_LOAD_FAILED, createWritableMap("code" to code, "msg" to msg))
            }

            // 广告开始展示
            override fun onAdShown() {
                sendEvent(EVENT_AD_SHOWN, createWritableMap("msg" to "广告开始展示"))
            }

            // 广告展示失败
            override fun onAdShowFailed(msg: String) {
                sendEvent(EVENT_AD_SHOW_FAILED, createWritableMap("msg" to msg))
            }

            // 广告被点击
            override fun onAdClicked() {
                sendEvent(EVENT_AD_CLICKED, createWritableMap("msg" to "广告被点击"))
            }

            // 广告关闭
            override fun onAdClosed() {
                sendEvent(EVENT_AD_CLOSED, createWritableMap("msg" to "广告已关闭"))
            }

            // 视频播放完成（未跳过，可发放奖励）
            override fun onVideoCompleted() {
                sendEvent(EVENT_VIDEO_COMPLETED, createWritableMap("msg" to "视频播放完成，等待奖励"))
            }

            // 视频播放出错
            override fun onVideoError() {
                sendEvent(EVENT_VIDEO_ERROR, createWritableMap("msg" to "视频播放出错"))
            }

            // 用户跳过视频（不发放奖励）
            override fun onVideoSkipped() {
                sendEvent(EVENT_VIDEO_SKIPPED, createWritableMap("msg" to "用户跳过视频，无奖励"))
            }

            // 核心：奖励发放回调（RN最关心）
            override fun onRewardArrived(
                isRewardValid: Boolean,
                rewardType: Int,
                rewardModel: RewardBundleModel
            ) {
                val rewardData = createWritableMap(
                    "isRewardValid" to isRewardValid,
                    "rewardName" to rewardModel.getRewardName(),
                    "rewardAmount" to rewardModel.getRewardAmount(),
                    "serverErrorCode" to rewardModel.getServerErrorCode(),
                    "serverErrorMsg" to rewardModel.getServerErrorMsg()
                )
                sendEvent(EVENT_REWARD_ARRIVED, rewardData)
            }

            // 进阶奖励回调（可选，需启用进阶奖励）
            override fun onAdvancedReward(rewardModel: RewardBundleModel, rewardType: Int) {
                val advancedData = createWritableMap(
                    "rewardPropose" to rewardModel.getRewardPropose(),
                    "rewardType" to rewardType,
                    "rewardName" to rewardModel.getRewardName(),
                    "rewardAmount" to rewardModel.getRewardAmount()
                )
                sendEvent(EVENT_ADVANCED_REWARD, advancedData)
            }
        })
    }

    /**
     * 辅助方法：快速创建WritableMap（避免重复代码）
     * @param pairs 键值对（支持String/Int/Boolean等类型）
     */
    private fun createWritableMap(vararg pairs: Pair<String, Any>): WritableMap {
        return Arguments.createMap().apply {
            pairs.forEach { (key, value) ->
                when (value) {
                    is String -> putString(key, value)
                    is Int -> putInt(key, value)
                    is Boolean -> putBoolean(key, value)
                    is Long -> putLong(key, value)
                    is Float -> putDouble(key, value.toDouble())
                    is Double -> putDouble(key, value)
                    else -> putString(key, value.toString()) // 其他类型转字符串
                }
            }
        }
    }

    /**
     * 发送事件到RN（通过DeviceEventEmitter）
     */
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}