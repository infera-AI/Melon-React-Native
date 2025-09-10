package com.melon

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import java.lang.reflect.Field

class ConfigModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ConfigModule"

    @ReactMethod
    fun getConfig(promise: Promise) {
        try {
            val config = Arguments.createMap()
            val buildConfigClass = BuildConfig::class.java
            val fields: Array<Field> = buildConfigClass.declaredFields
            
            // 只暴露以 "APP_" 或 "CONFIG_" 开头的字段（可自定义）
            val allowedPrefixes = listOf("APP_", "CONFIG_", "API_")
            
            for (field in fields) {
                val fieldName = field.name
                
                // 过滤：只处理符合前缀的字段
                if (allowedPrefixes.any { fieldName.startsWith(it) }) {
                    field.isAccessible = true
                    val fieldValue = field.get(null)
                    
                    when (fieldValue) {
                        is String -> config.putString(fieldName, fieldValue)
                        is Boolean -> config.putBoolean(fieldName, fieldValue)
                        is Int -> config.putInt(fieldName, fieldValue)
                        is Double -> config.putDouble(fieldName, fieldValue)
                        is Float -> config.putDouble(fieldName, fieldValue.toDouble())
                        else -> config.putString(fieldName, fieldValue.toString())
                    }
                }
            }
            
            // 添加一些固定信息
            // config.putString("appVersion", BuildConfig.VERSION_NAME)
            // config.putString("buildNumber", BuildConfig.VERSION_CODE.toString())
            // config.putString("platform", "android")
            
            promise.resolve(config)
        } catch (e: Exception) {
            promise.reject("CONFIG_ERROR", "Failed to read configuration", e)
        }
    }
}