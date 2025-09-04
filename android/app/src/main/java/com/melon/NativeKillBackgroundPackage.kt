package com.melon

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.Collections.emptyList

// 2. 实现 ReactPackage 接口（RN 要求所有原生模块包必须实现此接口）
class NativeKillBackgroundPackage : ReactPackage {

    /**
     * 注册“原生模块”（如 NativeKillBackgroundModule）
     * - 参数：reactContext：RN 的上下文，用于模块初始化（如获取 Activity、权限等）
     * - 返回值：包含自定义原生模块的列表（RN 会加载列表中的模块）
     */
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        // 将自定义模块加入列表，传入 reactContext 供模块内部使用
        return mutableListOf(
            NativeKillBackgroundModule(reactContext)
        )
    }

    /**
     * 注册“自定义原生视图”（如自定义 RN 组件的原生渲染逻辑）
     * - 如果你只做“杀后台”这类逻辑（无自定义 UI），此方法返回空列表即可
     */
    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> {
        return emptyList() // 无自定义视图，返回空列表
    }
}