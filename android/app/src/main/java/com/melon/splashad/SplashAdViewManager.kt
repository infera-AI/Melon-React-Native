package com.melon.splashad

import android.app.Activity
import android.util.Log
import com.bytedance.sdk.openadsdk.CSJAdError
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.melon.BuildConfig  // 新增：引入BuildConfig区分开发/生产环境

/**
 * 穿山甲开屏广告ViewManager（RN原生UI组件桥接类）
 * 功能：1. 创建SplashAdView实例 2. 暴露方法给RN 3. 传递广告事件到RN
 */
class SplashAdViewManager(
    private val reactContext: ReactApplicationContext
) : SimpleViewManager<SplashAdView>() {

    // 日志TAG（与SplashAdView保持一致）
    private val TAG = "TTAdSdk"

    // 组件名称：RN端通过此名称引用原生组件（必须与RN端requireNativeComponent一致）
    override fun getName(): String = "CSJSplashAdView"

    // 新增：重复注册防护 - 实例计数器和注册状态标记（在原有companion object中添加）
    private companion object {
        const val COMMAND_LOAD_AD = 1
        const val COMMAND_ON_RESUME = 2
        const val COMMAND_ON_STOP = 3
        const val COMMAND_DESTROY = 4

        // 新增：重复注册防护核心变量
        private var instanceCount = 0  // 跟踪当前组件实例数量
        private var isRegistered = false  // 标记组件是否已完成首次注册
    }

    // 1. 创建原生View实例（SplashAdView）
    override fun createViewInstance(reactContext: ThemedReactContext): SplashAdView {
        Log.d(TAG, "SplashAdViewManager: createViewInstance 被调用（开始创建SplashAdView）")

        // 新增：重复注册防护逻辑（仅开发环境生效，不影响生产）
        instanceCount++
        if (BuildConfig.DEBUG && isRegistered) {
            Log.w(TAG, "SplashAdViewManager: CSJSplashAdView已注册（实例数：$instanceCount），跳过重复初始化")
            // 直接创建基础实例（复用原有Activity获取和回调设置逻辑）
            val currentActivity: Activity? = this.reactContext.currentActivity
            if (currentActivity == null) {
                val errorMsg = "创建SplashAdView失败：当前无活跃的Activity"
                Log.e(TAG, "SplashAdViewManager: $errorMsg")
                throw IllegalStateException(errorMsg)
            }
            val splashAdView = SplashAdView(currentActivity)
            // 复用原有广告回调设置逻辑（完全复制原代码，无修改）
            splashAdView.setAdCallback(object : SplashAdView.AdCallback {
                override fun onLoadSuccess() {
                    Log.d(TAG, "SplashAdViewManager: 收到广告加载成功事件，转发到RN")
                    sendEvent("onSplashAdLoadSuccess", null)
                }

                override fun onRenderSuccess() {
                    Log.d(TAG, "SplashAdViewManager: 收到广告渲染成功事件，转发到RN")
                    sendEvent("onSplashAdRenderSuccess", null)
                }

                override fun onAdShow() {
                    Log.d(TAG, "SplashAdViewManager: 收到广告展示事件，转发到RN")
                    sendEvent("onSplashAdShow", null)
                }

                override fun onAdClick() {
                    Log.d(TAG, "SplashAdViewManager: 收到广告点击事件，转发到RN")
                    sendEvent("onSplashAdClick", null)
                }

                override fun onAdClose() {
                    Log.d(TAG, "SplashAdViewManager: 收到广告关闭事件，转发到RN")
                    sendEvent("onSplashAdClose", null)
                }

                override fun onError(errorMsg: String) {
                    Log.e(TAG, "SplashAdViewManager: 收到广告错误事件，转发到RN，错误信息：$errorMsg")
                    val params = Arguments.createMap().apply {
                        putString("errorMsg", errorMsg)
                    }
                    sendEvent("onSplashAdError", params)
                }

                override fun onForceGoMain() {
                    Log.d(TAG, "SplashAdViewManager: 收到强制跳主界面事件，转发到RN")
                    sendEvent("onSplashAdForceGoMain", null)
                }
            })
            return splashAdView
        }
        // 首次注册：标记为已注册
        isRegistered = true
        Log.d(TAG, "SplashAdViewManager: CSJSplashAdView首次注册（实例数：$instanceCount）")

        // 原有逻辑：获取当前活跃的Activity
        val currentActivity: Activity? = this.reactContext.currentActivity
        if (currentActivity == null) {
            val errorMsg = "创建SplashAdView失败：当前无活跃的Activity"
            Log.e(TAG, "SplashAdViewManager: $errorMsg")
            throw IllegalStateException(errorMsg)
        }
        Log.d(TAG, "SplashAdViewManager: 获取到当前Activity：${currentActivity.javaClass.simpleName}")

        // 创建SplashAdView实例
        val splashAdView = SplashAdView(currentActivity)
        Log.d(TAG, "SplashAdViewManager: SplashAdView实例创建成功：$splashAdView")

        // 设置广告回调（传递事件到RN）- 原有逻辑无修改
        splashAdView.setAdCallback(object : SplashAdView.AdCallback {
            override fun onLoadSuccess() {
                Log.d(TAG, "SplashAdViewManager: 收到广告加载成功事件，转发到RN")
                sendEvent("onSplashAdLoadSuccess", null)
            }

            override fun onRenderSuccess() {
                Log.d(TAG, "SplashAdViewManager: 收到广告渲染成功事件，转发到RN")
                sendEvent("onSplashAdRenderSuccess", null)
            }

            override fun onAdShow() {
                Log.d(TAG, "SplashAdViewManager: 收到广告展示事件，转发到RN")
                sendEvent("onSplashAdShow", null)
            }

            override fun onAdClick() {
                Log.d(TAG, "SplashAdViewManager: 收到广告点击事件，转发到RN")
                sendEvent("onSplashAdClick", null)
            }

            override fun onAdClose() {
                Log.d(TAG, "SplashAdViewManager: 收到广告关闭事件，转发到RN")
                sendEvent("onSplashAdClose", null)
            }

            override fun onError(errorMsg: String) {
                Log.e(TAG, "SplashAdViewManager: 收到广告错误事件，转发到RN，错误信息：$errorMsg")
                val params = Arguments.createMap().apply {
                    putString("errorMsg", errorMsg)
                }
                sendEvent("onSplashAdError", params)
            }

            override fun onForceGoMain() {
                Log.d(TAG, "SplashAdViewManager: 收到强制跳主界面事件，转发到RN")
                sendEvent("onSplashAdForceGoMain", null)
            }
        })
        return splashAdView
    }

    // 新增：重复注册防护 - 视图销毁时重置状态（仅开发环境）
    override fun onDropViewInstance(view: SplashAdView) {
        super.onDropViewInstance(view)
        instanceCount--
        Log.d(TAG, "SplashAdViewManager: 实例销毁，剩余实例数：$instanceCount")
        // 所有实例销毁后，重置注册状态（下次创建可重新执行首次注册流程）
        if (BuildConfig.DEBUG && instanceCount <= 0) {
            isRegistered = false
            Log.d(TAG, "SplashAdViewManager: 所有实例已销毁，重置注册状态")
        }
    }

    // 原有：注册方法与命令ID的映射关系（无修改）
    override fun getCommandsMap(): MutableMap<String, Int> {
        val commands = mutableMapOf(
            "loadAd" to COMMAND_LOAD_AD,
            "onResume" to COMMAND_ON_RESUME,
            "onStop" to COMMAND_ON_STOP,
            "destroy" to COMMAND_DESTROY
        )
        Log.d(TAG, "SplashAdViewManager: 已注册方法命令映射: $commands")
        return commands
    }

    // 原有：处理RN发送的命令（无修改）
    override fun receiveCommand(
        view: SplashAdView,
        commandId: Int,
        args: ReadableArray?
    ) {
        super.receiveCommand(view, commandId, args)
        Log.d(TAG, "SplashAdViewManager: 收到RN命令，commandId=$commandId，args=$args")

        when (commandId) {
            COMMAND_LOAD_AD -> {
                if (args != null && args.size() >= 2) {
                    val adCodeId = args.getString(0) ?: ""
                    val timeout = args.getInt(1)
                    loadAd(view, adCodeId, timeout)
                } else {
                    Log.e(TAG, "SplashAdViewManager: loadAd参数不足，需要2个参数")
                }
            }
            COMMAND_ON_RESUME -> onResume(view)
            COMMAND_ON_STOP -> onStop(view)
            COMMAND_DESTROY -> destroy(view)
            else -> Log.w(TAG, "SplashAdViewManager: 未知命令ID=$commandId")
        }
    }

    // 2. 暴露方法给RN：加载开屏广告（核心方法）- 原有逻辑无修改
    @ReactMethod
    fun loadAd(view: SplashAdView, adCodeId: String, timeout: Int) {
        Log.d(TAG, "SplashAdViewManager: 收到RN调用 loadAd 方法！")
        Log.d(TAG, "SplashAdViewManager: loadAd 参数：adCodeId=$adCodeId，timeout=$timeout ms，目标View实例=$view")

        try {
            view.loadSplashAd(adCodeId, timeout)
            Log.d(TAG, "SplashAdViewManager: 已调用 view.loadSplashAd，广告加载流程启动")
        } catch (e: Exception) {
            Log.e(TAG, "SplashAdViewManager: 调用 view.loadSplashAd 时发生异常", e)
        }
    }

    // 3. 暴露方法给RN：处理Activity的onResume生命周期 - 原有逻辑无修改
    @ReactMethod
    fun onResume(view: SplashAdView) {
        Log.d(TAG, "SplashAdViewManager: 收到RN调用 onResume 方法")
        view.onResume()
    }

    // 4. 暴露方法给RN：处理Activity的onStop生命周期 - 原有逻辑无修改
    @ReactMethod
    fun onStop(view: SplashAdView) {
        Log.d(TAG, "SplashAdViewManager: 收到RN调用 onStop 方法")
        view.onStop()
    }

    // 5. 暴露方法给RN：销毁广告View - 原有逻辑无修改
    @ReactMethod
    fun destroy(view: SplashAdView) {
        Log.d(TAG, "SplashAdViewManager: 收到RN调用 destroy 方法")
        view.destroy()
    }

    /**
     * 发送事件到RN - 原有逻辑无修改
     */
    private fun sendEvent(eventName: String, params: ReadableMap?) {
        try {
            reactContext.getJSModule(
                com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
            ).emit(eventName, params)
            Log.d(TAG, "SplashAdViewManager: 成功发送事件到RN：$eventName")
        } catch (e: Exception) {
            Log.e(TAG, "SplashAdViewManager: 发送事件到RN失败：$eventName", e)
        }
    }
}