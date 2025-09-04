package com.melon

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.os.Process

class NativeKillBackgroundModule(
    private val reactContext: ReactApplicationContext // 保存 React 上下文
) : ReactContextBaseJavaModule(reactContext) {

    // 1. 模块名称（RN 层通过此名称调用，需与 RN 端一致）
    override fun getName(): String = "NativeKillBackgroundModule"

    // 2. 暴露给 RN 的“杀后台”方法（@ReactMethod 注解使其可被 RN 调用）
    @ReactMethod
    fun killApp() {
        // 关键修复：用 reactContext.currentActivity 替代 getCurrentActivity()
        val currentActivity = reactContext.currentActivity

        if (currentActivity != null) {
            // 步骤1：销毁当前 Activity（关闭 RN 根页面）
            currentActivity.finishAndRemoveTask() // 比 finish() 更彻底：销毁任务栈，避免残留
            // 步骤2：强制终止当前进程（彻底“杀后台”，释放所有内存）
            Process.killProcess(Process.myPid())
            System.exit(0) // 双重保障：确保进程退出（部分机型需此步骤）
        } else {
            // 极端情况：Activity 已销毁，直接杀进程
            Process.killProcess(Process.myPid())
            System.exit(0)
        }
    }
}