import Foundation
import React
import BUAdSDK

// 标记为Objective-C可见，RN可识别
@objc(CSJSplashAdViewManager)
class CSJSplashAdViewManager: RCTViewManager {
    // 1. 组件名称（RN端引用的名称，必须实现）
    override static func moduleName() -> String! {
        return "CSJSplashAdView"
    }
    
    // 日志TAG
    private let TAG = "TTAdSdk"
    
    // 2. 创建原生视图实例（重写父类方法）
    override func view() -> UIView! {
        let splashView = SplashAdView()
        splashView.adCallback = self
        Log.d(TAG, "SplashAdView实例创建完成，回调已绑定")
        return splashView
    }
    
    // 3. 注册RN可监听的事件（无需override，自定义静态方法供RN识别）
    static func supportedEvents() -> [String] {
        return [
            "onSplashAdLoadSuccess",
            "onSplashAdRenderSuccess",
            "onSplashAdShow",
            "onSplashAdClick",
            "onSplashAdClose",
            "onSplashAdError",
            "onSplashAdForceGoMain"
        ]
    }
    
    // 4. 方法执行队列（重写父类，指定主线程）
    override var methodQueue: DispatchQueue! {
        return DispatchQueue.main
    }
    
    // MARK: - 暴露给RN的方法（@objc标记，参数符合桥接要求）
    // 加载广告
    @objc func loadAd(_ reactTag: NSNumber, adCodeId: String, timeout: Int) {
        Log.d(TAG, "RN调用loadAd：adCodeId=\(adCodeId)，timeout=\(timeout)ms")
        // 修复：通过父类的bridge.uiManager获取视图（解决uiManager找不到问题）
        guard let uiManager = self.bridge?.uiManager else {
            Log.e(TAG, "获取uiManager失败：bridge为空")
            return
        }
        guard let splashView = uiManager.view(forReactTag: reactTag) as? SplashAdView else {
            Log.e(TAG, "获取SplashAdView实例失败：reactTag无效或视图已销毁")
            return
        }
        splashView.loadSplashAd(adCodeId: adCodeId, timeout: timeout)
    }
    
    // 生命周期onResume
    @objc func onResume(_ reactTag: NSNumber) {
        Log.d(TAG, "RN调用onResume")
        guard let uiManager = self.bridge?.uiManager else {
            Log.e(TAG, "获取uiManager失败：bridge为空")
            return
        }
        guard let splashView = uiManager.view(forReactTag: reactTag) as? SplashAdView else {
            Log.e(TAG, "获取SplashAdView实例失败")
            return
        }
        splashView.onResume()
    }
    
    // 生命周期onStop
    @objc func onStop(_ reactTag: NSNumber) {
        Log.d(TAG, "RN调用onStop")
        guard let uiManager = self.bridge?.uiManager else {
            Log.e(TAG, "获取uiManager失败：bridge为空")
            return
        }
        guard let splashView = uiManager.view(forReactTag: reactTag) as? SplashAdView else {
            Log.e(TAG, "获取SplashAdView实例失败")
            return
        }
        splashView.onStop()
    }
    
    // 销毁广告
    @objc func destroy(_ reactTag: NSNumber) {
        Log.d(TAG, "RN调用destroy")
        guard let uiManager = self.bridge?.uiManager else {
            Log.e(TAG, "获取uiManager失败：bridge为空")
            return
        }
        guard let splashView = uiManager.view(forReactTag: reactTag) as? SplashAdView else {
            Log.e(TAG, "获取SplashAdView实例失败")
            return
        }
        splashView.destroy()
    }
    
    // MARK: - 发送事件到RN（修复RCTEvent初始化问题）
    private func sendEvent(_ eventName: String, params: [String: Any]? = nil) {
        // 修复：使用RCTEventEmitter的正确事件发送方式（适配RN 0.60+）
        guard let bridge = self.bridge else {
            Log.e(TAG, "发送事件失败：bridge为空")
            return
        }
        // 正确构造事件（避免RCTEvent初始化问题）
        let eventDict: [String: Any] = [
            "target": 0, // 占位target，不影响事件接收
            "body": params ?? [:]
        ]
        bridge.enqueueJSCall(
            "RCTDeviceEventEmitter.emit",
            args: [eventName, eventDict]
        )
        Log.d(TAG, "成功发送事件到RN：\(eventName)，参数：\(params ?? [:])")
    }
    
    // 5. 主线程初始化设置（重写父类方法）
    @objc static override func requiresMainQueueSetup() -> Bool {
        return true
    }
}

// 实现广告回调协议，转发事件到RN
extension CSJSplashAdViewManager: SplashAdCallback {
    func onLoadSuccess() {
        sendEvent("onSplashAdLoadSuccess")
    }
    
    func onRenderSuccess() {
        sendEvent("onSplashAdRenderSuccess")
    }
    
    func onAdShow() {
        sendEvent("onSplashAdShow")
    }
    
    func onAdClick() {
        sendEvent("onSplashAdClick")
    }
    
    func onAdClose() {
        sendEvent("onSplashAdClose")
    }
    
    func onError(errorMsg: String) {
        sendEvent("onSplashAdError", params: ["errorMsg": errorMsg])
    }
    
    func onForceGoMain() {
        sendEvent("onSplashAdForceGoMain")
    }
}
