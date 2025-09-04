package com.melon

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * 注册PangleAdModule到React Native
 * 需在MainApplication中添加此Package
 */
class PangleAdPackage : ReactPackage {

    // 注册Native Module（仅添加PangleAdModule）
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        return mutableListOf(PangleAdModule(reactContext))
    }

    // 无需自定义原生视图，返回空列表
    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> {
        return mutableListOf()
    }
}