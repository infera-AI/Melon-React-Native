package com.melon

import android.bluetooth.*
import android.content.*
import android.media.AudioManager
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class HeadsetDetectionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var receiverRegistered = false
    private var bluetoothProfile: BluetoothHeadset? = null
    private var bluetoothAdapter: BluetoothAdapter? = null

    private var lastWiredState: Boolean? = null
    private var lastBluetoothState: Boolean? = null

    override fun getName(): String = "HeadsetDetection"

    private val headsetReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_HEADSET_PLUG -> {
                    val state = intent.getIntExtra("state", -1)
                    val isPlugged = state == 1
                    Log.d("HeadsetDetection", "Wired headset plug state: $isPlugged")
                    notifyWiredStateChange(isPlugged)
                }
                BluetoothDevice.ACTION_ACL_CONNECTED -> {
                    val device: BluetoothDevice? = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    if (device != null && isBluetoothHeadset(device)) {
                        Log.d("HeadsetDetection", "Bluetooth device connected: ${device.name}")
                        notifyBluetoothStateChange(true)
                    }
                }
                BluetoothDevice.ACTION_ACL_DISCONNECTED -> {
                    val device: BluetoothDevice? = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    if (device != null && isBluetoothHeadset(device)) {
                        Log.d("HeadsetDetection", "Bluetooth device disconnected: ${device.name}")
                        notifyBluetoothStateChange(false)
                    }
                }
            }
        }
    }

    @ReactMethod
    fun startListening() {
        if (receiverRegistered) return

        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_HEADSET_PLUG)
            addAction(BluetoothDevice.ACTION_ACL_CONNECTED)
            addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED)
        }
        reactContext.registerReceiver(headsetReceiver, filter)
        receiverRegistered = true

        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
        bluetoothAdapter?.getProfileProxy(reactContext, bluetoothProfileListener, BluetoothProfile.HEADSET)

    }

    @ReactMethod
    fun stopListening() {
        if (!receiverRegistered) return
        try {
            reactContext.unregisterReceiver(headsetReceiver)
        } catch (e: Exception) {
            Log.w("HeadsetDetection", "Receiver not registered or already unregistered")
        }
        receiverRegistered = false

        bluetoothAdapter?.closeProfileProxy(BluetoothProfile.HEADSET, bluetoothProfile)
        bluetoothProfile = null
        bluetoothAdapter = null
    }

    private val bluetoothProfileListener = object : BluetoothProfile.ServiceListener {
        override fun onServiceConnected(profile: Int, proxy: BluetoothProfile?) {
            if (profile == BluetoothProfile.HEADSET) {
                bluetoothProfile = proxy as BluetoothHeadset?
                Log.d("HeadsetDetection", "Bluetooth HEADSET profile connected")
                checkBluetoothConnection()
            }
        }

        override fun onServiceDisconnected(profile: Int) {
            if (profile == BluetoothProfile.HEADSET) {
                bluetoothProfile = null
                Log.d("HeadsetDetection", "Bluetooth HEADSET profile disconnected")
                notifyBluetoothStateChange(false)
            }
        }
    }

    private fun checkInitialState() {
        // 初始有线耳机状态
        val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val isWiredPlugged = audioManager.isWiredHeadsetOn
        lastWiredState = isWiredPlugged
        Log.d("HeadsetDetection", "Initial wired headset state: $isWiredPlugged")
        sendEvent("onInitialWiredHeadsetState", isWiredPlugged)

        // 初始蓝牙状态（异步，由 ProfileListener 回调）
        checkBluetoothConnection()
    }

    private fun checkBluetoothConnection() {
        bluetoothProfile?.connectedDevices?.forEach { device ->
            if (isBluetoothHeadset(device)) {
                lastBluetoothState = true
                Log.d("HeadsetDetection", "Initial bluetooth headset connected: ${device.name}")
                sendEvent("onInitialBluetoothHeadsetState", true)
                return
            }
        }
        if (lastBluetoothState == null) {
            lastBluetoothState = false
            sendEvent("onInitialBluetoothHeadsetState", false)
        }
    }

    private fun notifyWiredStateChange(isPlugged: Boolean) {
        if (lastWiredState == isPlugged) return
        lastWiredState = isPlugged
        sendEvent("onWiredHeadsetStateChanged", isPlugged)
    }

    private fun notifyBluetoothStateChange(isConnected: Boolean) {
        if (lastBluetoothState == isConnected) return
        lastBluetoothState = isConnected
        sendEvent("onBluetoothHeadsetStateChanged", isConnected)
    }

    private fun sendEvent(eventName: String, data: Boolean) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }

    private fun isBluetoothHeadset(device: BluetoothDevice): Boolean {
        val btClass = device.bluetoothClass ?: return false
        return when (btClass.deviceClass) {
            BluetoothClass.Device.AUDIO_VIDEO_HANDSFREE,
            BluetoothClass.Device.AUDIO_VIDEO_WEARABLE_HEADSET,
            BluetoothClass.Device.AUDIO_VIDEO_HEADPHONES -> true
            else -> false
        }
    }
}
