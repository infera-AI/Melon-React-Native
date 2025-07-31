package com.melon

import android.content.*
import android.media.AudioManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class HeadsetDetectionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var receiverRegistered = false
    private val headsetReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == Intent.ACTION_HEADSET_PLUG) {
                val state = intent.getIntExtra("state", -1)
                val isPlugged = state == 1
                sendEvent("onHeadsetStateChanged", isPlugged)
            }
        }
    }

    override fun getName(): String = "HeadsetDetection"

    @ReactMethod
    fun startListening() {
        if (!receiverRegistered) {
            val filter = IntentFilter(Intent.ACTION_HEADSET_PLUG)
            reactContext.registerReceiver(headsetReceiver, filter)
            receiverRegistered = true
        }
    }

    @ReactMethod
    fun stopListening() {
        if (receiverRegistered) {
            reactContext.unregisterReceiver(headsetReceiver)
            receiverRegistered = false
        }
    }

    private fun sendEvent(eventName: String, data: Boolean) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }
}
