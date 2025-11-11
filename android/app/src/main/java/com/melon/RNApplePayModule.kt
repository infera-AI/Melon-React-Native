package com.melon

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableMap  // 新增：导入ReadableMap

class RNApplePayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "RNApplePay"

    @ReactMethod
    fun canMakePayments(callback: Callback) {
        callback.invoke(false)
    }

    // 关键修正：将参数类型从 Map<String, Any> 改为 ReadableMap
    @ReactMethod
    fun requestPayment(paymentData: ReadableMap, promise: Promise) {
        promise.reject("UNSUPPORTED", "Android 不支持 Apple Pay")
    }
}