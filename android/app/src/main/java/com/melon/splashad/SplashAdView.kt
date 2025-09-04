package com.melon.splashad

import android.app.Activity
import android.content.Context
import android.graphics.Rect
import android.util.DisplayMetrics
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.bytedance.sdk.openadsdk.TTAdNative
import com.bytedance.sdk.openadsdk.TTAdSdk
import com.bytedance.sdk.openadsdk.AdSlot
import com.bytedance.sdk.openadsdk.CSJAdError
import com.bytedance.sdk.openadsdk.CSJSplashAd
import com.melon.R
import com.bytedance.sdk.openadsdk.TTAdLoadType

/**
 * 穿山甲开屏广告自定义View（V4700+新接口）
 */
class SplashAdView(context: Context) : FrameLayout(context) {
    // 日志TAG（固定为TTAdSdk，与穿山甲SDK日志统一）
    private val TAG = "TTAdSdk"

    // 广告容器（从布局文件加载）
//    private val mSplashContainer: FrameLayout by lazy {
//        Log.d(TAG, "SplashAdView: 开始加载广告容器布局（splash_ad_container.xml）")
//        val container = LayoutInflater.from(context).inflate(R.layout.splash_ad_container, this, true)
//            .findViewById(R.id.splash_ad_container)
//        Log.d(TAG, "SplashAdView: 广告容器布局加载完成，容器实例：$container")
//        container
//    }

//    private val mSplashContainer: FrameLayout by lazy {
//        LayoutInflater.from(context).inflate(R.layout.splash_ad_container, this, true)
//            .findViewById(R.id.splash_ad_container)
//    }

    // 直接初始化，不使用lazy，确保尽早加入视图树
    private val mSplashContainer: FrameLayout

    // 穿山甲广告原生对象
    private var mTTAdNative: TTAdNative? = null

    // 开屏广告实例
    private var mCsjSplashAd: CSJSplashAd? = null

    // 广告加载超时时间（建议>3500ms，文档要求）
    private var mTimeout: Int = 4000

    // 标记是否强制跳转到主界面（处理Activity生命周期）
    private var mForceGoMain: Boolean = false

    // RN回调接口（传递广告事件到RN）
    private var mAdCallback: AdCallback? = null

    // 存储有效的Activity上下文
    private val mActivity: Activity?

    // 初始化：获取有效Activity上下文 + 创建TTAdNative实例
    init {
        Log.d(TAG, "SplashAdView: 进入初始化方法（init），传入的上下文类型：${context.javaClass.name}")

        // 1. 加载布局并附加到当前视图（this）
        val rootView = LayoutInflater.from(context).inflate(R.layout.splash_ad_container, this, true)
        // 2. 获取容器实例
        mSplashContainer = rootView.findViewById(R.id.splash_ad_container)
        // 3. 初始设置：让容器默认撑满父布局（当前SplashAdView）
        mSplashContainer.layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT
        )

//        Log.i(TAG, "mSplashContainer宽-----" + mSplashContainer.width)
//        Log.i(TAG, "mSplashContainer高-----" + mSplashContainer.height)

        // 1. 递归获取真实Activity
        mActivity = getValidActivity(context)
        // 2. 校验Activity是否有效
        if (mActivity == null) {
            Log.e(TAG, "SplashAdView: 初始化失败！无法从上下文获取有效Activity，传入的上下文：$context")
            throw IllegalArgumentException("SplashAdView context must be Activity!")
        }
        Log.d(TAG, "SplashAdView: 成功获取有效Activity，Activity名称：${mActivity.javaClass.simpleName}，Activity实例：$mActivity")

        // 3. 使用有效Activity创建TTAdNative
        try {
            Log.d(TAG, "SplashAdView: 开始创建TTAdNative实例（穿山甲广告原生对象）")
            mTTAdNative = TTAdSdk.getAdManager().createAdNative(mActivity)
            if (mTTAdNative == null) {
                Log.e(TAG, "SplashAdView: TTAdNative实例创建失败！返回null（可能穿山甲SDK未初始化）")
            } else {
                Log.d(TAG, "SplashAdView: TTAdNative实例创建成功，实例：$mTTAdNative")
            }
        } catch (e: Exception) {
            Log.e(TAG, "SplashAdView: 创建TTAdNative时抛出异常", e)
            throw e
        }

        Log.d(TAG, "SplashAdView: 初始化完成，当前状态：mActivity=$mActivity, mTTAdNative=$mTTAdNative")
    }

    /**
     * 递归获取真实Activity
     */
    private fun getValidActivity(context: Context?): Activity? {
        Log.d(TAG, "getValidActivity: 开始处理上下文，当前上下文：$context，类型：${context?.javaClass?.name}")
        if (context == null) {
            Log.w(TAG, "getValidActivity: 上下文为null，返回null")
            return null
        }
        // 直接是Activity：返回
        if (context is Activity) {
            Log.d(TAG, "getValidActivity: 上下文直接是Activity，返回：${context.javaClass.simpleName}")
            return context
        }
        // 是Context包装类：递归获取baseContext
        if (context is android.view.ContextThemeWrapper) {
            Log.d(TAG, "getValidActivity: 上下文是ContextThemeWrapper，递归处理baseContext")
            return getValidActivity(context.baseContext)
        }
        // 其他情况：返回null
        Log.w(TAG, "getValidActivity: 无法识别的上下文类型，返回null")
        return null
    }

    /**
     * 设置广告回调
     */
    fun setAdCallback(callback: AdCallback) {
        Log.d(TAG, "setAdCallback: 设置广告回调，回调实例：$callback")
        this.mAdCallback = callback
    }

    /**
     * 加载开屏广告
     */
    fun loadSplashAd(adCodeId: String, timeout: Int) {
        Log.d(TAG, "loadSplashAd: 进入加载广告方法，参数：adCodeId=$adCodeId，timeout=$timeout ms")
        this.mTimeout = timeout

        // 校验Activity和TTAdNative是否有效
        val activity = mActivity ?: run {
            Log.e(TAG, "loadSplashAd: 加载广告失败！mActivity为null")
            return
        }
        val ttAdNative = mTTAdNative ?: run {
            Log.e(TAG, "loadSplashAd: 加载广告失败！mTTAdNative为null（穿山甲SDK未初始化或创建失败）")
            return
        }

        // 1. 计算屏幕尺寸
        Log.d(TAG, "loadSplashAd: 开始计算屏幕尺寸（确保广告宽=屏幕宽，高≥75%屏幕高）")
        val displayMetrics = DisplayMetrics()
        activity.windowManager.defaultDisplay.getMetrics(displayMetrics)
        val screenWidth = displayMetrics.widthPixels  // 屏幕宽（px）
        val screenHeight = displayMetrics.heightPixels  // 屏幕高（px）
        val adHeight = (screenHeight * 0.75).toInt()  // 广告高≥75%屏幕高（px）
        Log.d(TAG, "loadSplashAd: 屏幕尺寸计算完成，screenWidth=$screenWidth px，screenHeight=$screenHeight px，广告高度=$adHeight px（≥75%屏幕高）")

        // 2. 构建广告请求参数AdSlot
        Log.d(TAG, "loadSplashAd: 开始构建AdSlot（广告请求参数）")
        val adSlot = AdSlot.Builder()
            .setCodeId(adCodeId)
            .setImageAcceptedSize(screenWidth, screenHeight)  // 非模板渲染（px）
            .setExpressViewAcceptedSize(screenWidth.toFloat(), screenHeight.toFloat())  // 模板渲染（dp）
            .setAdLoadType(TTAdLoadType.PRELOAD)  // 实时加载
            .build()
        Log.d(TAG, "loadSplashAd: AdSlot构建完成，adSlot=$adSlot，请求的广告尺寸：宽=$screenWidth px，高=$adHeight px")

        // 3. 调用穿山甲接口加载广告
        Log.d(TAG, "loadSplashAd: 开始调用穿山甲loadSplashAd接口，超时时间=$mTimeout ms")
        ttAdNative.loadSplashAd(
            adSlot,
            object : TTAdNative.CSJSplashAdListener {
                override fun onSplashLoadSuccess(ad: CSJSplashAd) {
                    Log.d(TAG, "onSplashLoadSuccess: 广告物料/素材加载成功！CSJSplashAd实例：$ad")
                    mCsjSplashAd = ad
                    mAdCallback?.onLoadSuccess()
                }

                override fun onSplashLoadFail(error: CSJAdError) {
                    val errorMsg = "加载失败：${error.code} - ${error.msg}"
                    Log.e(TAG, "onSplashLoadFail: $errorMsg，错误码说明：${getErrorCodeDesc(error.code)}")
                    mAdCallback?.onError(errorMsg)
                    goToMain()
                }

                override fun onSplashRenderSuccess(ad: CSJSplashAd) {
                    Log.d(TAG, "onSplashRenderSuccess: 广告渲染成功！开始渲染广告视图，CSJSplashAd实例：$ad")
                    Log.d(TAG, "onSplashRenderSuccess: 广告渲染成功！容器尺寸：${mSplashContainer.width}x${mSplashContainer.height}")
                    Log.d(TAG, "onSplashRenderSuccess: 容器可见性：${if (mSplashContainer.visibility == VISIBLE) "VISIBLE" else "GONE/INVISIBLE"}")
                    Log.d(TAG, "onSplashRenderSuccess: 容器是否在屏幕内：${isViewInScreen(mSplashContainer)}") // 新增工具方法
                    mCsjSplashAd = ad
                    // 渲染广告
                    try {
                        mSplashContainer.removeAllViews()
                        ad.showSplashView(mSplashContainer)

                        // 2. 延迟200ms，确保SDK完成视图添加（关键：给SDK留足内部处理时间）
                        postDelayed({
                            if (mSplashContainer.childCount == 0) {
                                Log.e(TAG, "广告视图未添加到容器")
                                return@postDelayed
                            }

                            // 获取SDK添加的广告视图（TsView/SurfaceView）
                            val adView = mSplashContainer.getChildAt(0)
                            val containerWidth = mSplashContainer.width
                            val containerHeight = mSplashContainer.height

                            // 打印修复前状态（确认问题）
                            Log.d(TAG, "修复前 - 广告视图尺寸：${adView.width}x${adView.height}")
                            Log.d(TAG, "修复前 - 广告视图测量尺寸：${adView.measuredWidth}x${adView.measuredHeight}")

                            // 3. 第一步：强制测量（给广告视图设置“必须按容器尺寸测量”的规则）
                            val widthMeasureSpec = View.MeasureSpec.makeMeasureSpec(
                                containerWidth,  // 目标宽度=容器宽度
                                View.MeasureSpec.EXACTLY  // 强制使用精确尺寸，不允许SDK修改
                            )
                            val heightMeasureSpec = View.MeasureSpec.makeMeasureSpec(
                                containerHeight, // 目标高度=容器高度
                                View.MeasureSpec.EXACTLY
                            )
                            adView.measure(widthMeasureSpec, heightMeasureSpec)
                            Log.d(TAG, "强制测量后 - 广告视图测量尺寸：${adView.measuredWidth}x${adView.measuredHeight}")

                            // 4. 第二步：强制布局（确定广告视图在容器中的位置：全屏）
                            adView.layout(
                                0,          // 左坐标（容器左上角）
                                0,          // 上坐标
                                containerWidth,  // 右坐标（左+宽=全屏）
                                containerHeight  // 下坐标（上+高=全屏）
                            )
                            Log.d(TAG, "强制布局后 - 广告视图实际尺寸：${adView.width}x${adView.height}")

                            // 5. 第三步：验证最终状态（确保尺寸和位置生效）
                            val rect = Rect()
                            adView.getGlobalVisibleRect(rect)
                            Log.d(TAG, "最终状态 - 广告视图屏幕位置：${rect.left},${rect.top} - ${rect.right},${rect.bottom}")
                            Log.d(TAG, "最终状态 - 广告视图可见区域：${rect.width()}x${rect.height()}")

                            // 6. 兜底：若仍失败，直接设置视图最小尺寸（绕过SDK限制）
                            if (adView.width == 0 || adView.height == 0) {
                                Log.w(TAG, "广告视图尺寸仍为0，启用兜底方案：设置最小尺寸")
                                adView.minimumWidth = containerWidth
                                adView.minimumHeight = containerHeight
                                adView.requestLayout() // 再次触发布局

                                // 延迟50ms后验证兜底结果
                                postDelayed({
                                    Log.d(TAG, "兜底后 - 广告视图尺寸：${adView.width}x${adView.height}")
                                }, 50)
                            }

                        }, 0) // 延迟200ms：关键！确保SDK完成内部视图初始化，再执行强制操作


//                        mSplashContainer.removeAllViews() // 移除旧视图
//                        mSplashContainer.addView(ad.splashView)
                        Log.d(TAG, "onSplashRenderSuccess: 调用showSplashView成功，广告视图已添加到容器")
                    } catch (e: Exception) {
                        Log.e(TAG, "onSplashRenderSuccess: 调用showSplashView渲染广告时抛出异常", e)
                        mAdCallback?.onError("广告渲染时异常：${e.message}")
                        goToMain()
                        return
                    }
                    // 设置交互回调
                    setSplashInteractionListener(ad)
                    mAdCallback?.onRenderSuccess()
                    Log.d(TAG, "onSplashRenderSuccess: 广告渲染流程完成，等待用户交互")
                }

                // 新增工具方法：判断View是否在屏幕内
                private fun isViewInScreen(view: View): Boolean {
                    if (view.visibility != VISIBLE) return false
                    val rect = Rect()
                    val isInScreen = view.getGlobalVisibleRect(rect)
                    // 可见区域占比：若可见区域小于50%，视为未显示
                    val visibleRatio = (rect.width() * rect.height()).toFloat() / (view.width * view.height)
                    Log.d(TAG, "isViewInScreen: 可见区域占比：${visibleRatio * 100}%")
                    return isInScreen && visibleRatio > 0.5f
                }

                override fun onSplashRenderFail(ad: CSJSplashAd?, error: CSJAdError) {
                    val errorMsg = "渲染失败：${error.code} - ${error.msg}"
                    Log.e(TAG, "onSplashRenderFail: $errorMsg，错误码说明：${getErrorCodeDesc(error.code)}，CSJSplashAd实例：$ad")
                    mAdCallback?.onError(errorMsg)
                    goToMain()
                }
            },
            mTimeout
        )
    }

    /**
     * 设置开屏广告交互回调
     */
    private fun setSplashInteractionListener(ad: CSJSplashAd) {
        Log.d(TAG, "setSplashInteractionListener: 为广告设置交互回调，CSJSplashAd实例：$ad")
        ad.setSplashAdListener(object : CSJSplashAd.SplashAdListener {
            override fun onSplashAdShow(ad: CSJSplashAd) {
                Log.d(TAG, "onSplashAdShow: 广告已展示！CSJSplashAd实例：$ad")
                mAdCallback?.onAdShow()
            }

            override fun onSplashAdClick(ad: CSJSplashAd) {
                Log.d(TAG, "onSplashAdClick: 广告被点击！CSJSplashAd实例：$ad")
                mAdCallback?.onAdClick()
            }

            override fun onSplashAdClose(ad: CSJSplashAd, closeType: Int) {
                Log.d(TAG, "onSplashAdClose: 广告关闭！closeType=$closeType（0=倒计时结束，1=点击跳过），CSJSplashAd实例：$ad")
                mAdCallback?.onAdClose()
                goToMain()
            }
        })
    }

    /**
     * 跳转到主界面
     */
    private fun goToMain() {
        Log.d(TAG, "goToMain: 进入跳主界面逻辑，当前mForceGoMain=$mForceGoMain，mActivity=$mActivity")
        val activity = mActivity ?: return

        if (!activity.isFinishing) {
            Log.d(TAG, "goToMain: 移除广告容器中的所有视图（避免内存泄漏）")
            mSplashContainer.removeAllViews()
            Log.d(TAG, "goToMain: 释放CSJSplashAd实例（置为null）")
            mCsjSplashAd = null
            mForceGoMain = true
            Log.d(TAG, "goToMain: 跳主界面逻辑完成，mForceGoMain已设为true")
        } else {
            Log.w(TAG, "goToMain: 跳主界面失败！Activity已销毁（isFinishing=true），无法操作视图")
        }
    }

    /**
     * 处理Activity的onResume生命周期
     */
    fun onResume() {
        Log.d(TAG, "onResume: 进入onResume方法，当前mForceGoMain=$mForceGoMain")
        if (mForceGoMain) {
            Log.d(TAG, "onResume: mForceGoMain为true，通知RN强制跳主界面")
            mAdCallback?.onForceGoMain()
        }
    }

    /**
     * 处理Activity的onStop生命周期
     */
    fun onStop() {
        Log.d(TAG, "onStop: 进入onStop方法，将mForceGoMain设为true")
        mForceGoMain = true
    }

    /**
     * 释放资源
     */
    fun destroy() {
        Log.d(TAG, "destroy: 进入destroy方法，释放广告相关资源")
        Log.d(TAG, "destroy: 移除广告容器视图")
        mSplashContainer.removeAllViews()
        Log.d(TAG, "destroy: 释放CSJSplashAd实例")
        mCsjSplashAd = null
        Log.d(TAG, "destroy: 释放TTAdNative实例")
        mTTAdNative = null
        Log.d(TAG, "destroy: 释放AdCallback实例")
        mAdCallback = null
        Log.d(TAG, "destroy: 资源释放完成")
    }

    /**
     * 辅助方法：解析穿山甲错误码含义（便于日志排查）
     */
    private fun getErrorCodeDesc(code: Int): String {
        return when (code) {
            1 -> "物料加载失败"
            2 -> "素材加载失败"
            3 -> "渲染失败/渲染超时"
            23 -> "加载超时（建议增大timeout参数，当前设置：${mTimeout}ms）"
            1001 -> "参数错误（如adCodeId无效）"
            1004 -> "广告位无合适广告"
            else -> "未知错误（code=$code，需参考穿山甲错误码文档）"
        }
    }

    /**
     * 广告回调接口
     */
    interface AdCallback {
        fun onLoadSuccess()
        fun onRenderSuccess()
        fun onAdShow()
        fun onAdClick()
        fun onAdClose()
        fun onError(errorMsg: String)
        fun onForceGoMain()
    }
}