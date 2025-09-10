package com.melon

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.zmxv.RNSound.SoundPackage
import com.melon.modules.FileSaverPackage
import com.melon.ConfigPackage
import com.melon.PangleAdPackage

// === 新增 START ===
import com.bytedance.sdk.openadsdk.TTAdSdk
import com.bytedance.sdk.openadsdk.TTAdConfig
// === 新增 END ===
import com.melon.splashad.SplashAdViewManager  // 导入SplashAdViewManager
import java.util.Collections  // 新增：导入Collections
import com.facebook.react.bridge.ReactApplicationContext

import com.melon.NativeKillBackgroundPackage

class MainApplication : Application(), ReactApplication {

  // 添加静态实例
  companion object {
    lateinit var instance: MainApplication
      private set
  }

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(SoundPackage())
              add(HeadsetDetectionPackage())
              add(FileSaverPackage())
              add(ConfigPackage())
              add(PangleAdPackage())
              add(NativeKillBackgroundPackage())
              add(object : ReactPackage {
                override fun createNativeModules(reactContext: ReactApplicationContext): List<com.facebook.react.bridge.NativeModule> {
                  return Collections.emptyList()  // 不注册NativeModule，返回空列表
                }

                override fun createViewManagers(reactContext: ReactApplicationContext): List<com.facebook.react.uimanager.ViewManager<*, *>> {
                  // 注册开屏广告的ViewManager
                  return listOf(SplashAdViewManager(reactContext))
                }
              })
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    // 初始化实例
    instance = this
    loadReactNative(this)
    // === 新增 START ===
    // 穿山甲 SDK 初始化
    // 国内版 需要加载穿山甲SDK
    if (BuildConfig.APP_SIGN == "melon" || BuildConfig.APP_SIGN == "momor") { // 国内版使用穿山甲
      initPangleSdk()
    }
    // === 新增 END ===
  }

  // === 新增 START ===
  private fun initPangleSdk() {
    val appId = "5735174" // 替换成自己的 AppID
    // 1. 获取测试设备的 OAID（或 IMEI，仅测试用）

    val ttAdConfig = TTAdConfig.Builder()
      .appId(appId)
      .appName("Melon") // 建议和应用名保持一致
      .allowShowNotify(true) // 是否允许通知栏提示
      .debug(true) // 开发阶段打开日志
      .supportMultiProcess(false) // 单进程设置 false
      .useMediation(false) // 测试时需放开该行代码
//      .addTestDeviceIds(testDeviceIds) // 2. 添加测试设备（关键：标记该设备为测试设备，避免限流）
//      .useTextureView(true) // 3. 启用广告预览（测试专用，正式环境需删除）
      .build()

    val isInit = TTAdSdk.init(this, ttAdConfig)
    Log.i("TTAdSdk", "Pangle SDK init result: $isInit")

    if (TTAdSdk.isSdkReady()) {
      Log.i("TTAdSdk", "Pangle SDK 已初始化完成")
    } else {
      TTAdSdk.start(object : TTAdSdk.Callback {
        override fun success() {
          Log.i("TTAdSdk", "Pangle SDK start 成功")
        }

        override fun fail(code: Int, msg: String) {
          Log.e("TTAdSdk", "Pangle SDK start 失败: code=$code, msg=$msg")
        }
      })
    }
  }
  // === 新增 END ===
}
