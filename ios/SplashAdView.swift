//
//  SplashAdView.swift
//  Melon
//
//  Created by 季弘扬 on 2025/8/28.
//

import Foundation
import UIKit
import BUAdSDK
import BUAdSDK.BUSplashAd

// 广告回调协议（与 Android 的 AdCallback 完全对齐）
protocol SplashAdCallback: AnyObject {
    func onLoadSuccess()
    func onRenderSuccess()
    func onAdShow()
    func onAdClick()
    func onAdClose()
    func onError(errorMsg: String)
    func onForceGoMain()
}

class SplashAdView: UIView {
    // 日志 TAG（与 Android 保持一致）
    private let TAG = "TTAdSdk"
    // 穿山甲开屏广告实例（V4700+ 新接口）
    private var splashAd: BUSplashAd?
    // 广告容器（承载广告视图，对应 Android 的 mSplashContainer）
    private var adContainer: UIView!
    // 广告位 ID
    private var adCodeId: String = ""
    // 加载超时时间（默认 4000ms，与 Android 一致）
    private var timeout: TimeInterval = 4.0
    // 强制跳主界面标记（与 Android 的 mForceGoMain 一致）
    private var isForceGoMain: Bool = false
    // 回调代理（传递事件到 ViewManager）
    weak var adCallback: SplashAdCallback?
    // 当前根视图控制器（对应 Android 的 mActivity）
    private var rootVC: UIViewController?
    
    // MARK: - 初始化（与 Android init 逻辑对齐）
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupAdContainer()
        getRootViewController()
        Log.d(TAG, "SplashAdView 初始化完成，根VC：\(rootVC?.className ?? "未知")")
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - 初始化广告容器（对应 Android 的 splash_ad_container）
    private func setupAdContainer() {
        adContainer = UIView(frame: self.bounds)
        adContainer.autoresizingMask = [.flexibleWidth, .flexibleHeight] // 自适应父视图
        self.addSubview(adContainer)
    }
    
    // MARK: - 获取当前根视图控制器（对应 Android 的 getValidActivity）
    private func getRootViewController() {
      // 修复：iOS 13+ 正确获取当前窗口（替代废弃的 keyWindow）
        guard let window = UIApplication.shared.connectedScenes
                .compactMap({ $0 as? UIWindowScene })
                .flatMap({ $0.windows })
                .first(where: { $0.isKeyWindow }) else {
            Log.e(TAG, "获取根VC失败：未找到当前活跃窗口")
            return
        }
        
        // 处理嵌套容器（导航/标签控制器），复刻官方Demo逻辑
        var topVC = window.rootViewController
        // 1. 处理模态弹出的VC
        while let presentedVC = topVC?.presentedViewController {
            topVC = presentedVC
        }
        // 2. 处理导航控制器（取栈顶VC）
        while let navVC = topVC as? UINavigationController, let lastVC = navVC.viewControllers.last {
            topVC = lastVC
        }
        // 3. 处理标签控制器（取选中VC）
        while let tabVC = topVC as? UITabBarController, let selectedVC = tabVC.selectedViewController {
            topVC = selectedVC
        }
        
        rootVC = topVC
        Log.d(TAG, "获取根VC成功：\(rootVC?.className ?? "未知")")
    }
    
    // MARK: - 加载开屏广告（与 Android loadSplashAd 完全对齐）
    func loadSplashAd(adCodeId: String, timeout: Int) {
        self.adCodeId = adCodeId
      self.timeout = TimeInterval(timeout)/1000.0
        
        // 校验参数和根VC
        guard !adCodeId.isEmpty else {
            let errorMsg = "加载广告失败：adCodeId 为空"
            Log.e(TAG, errorMsg)
            adCallback?.onError(errorMsg: errorMsg)
            goToMain()
            return
        }
        guard let rootVC = rootVC else {
            let errorMsg = "加载广告失败：根VC为空"
            Log.e(TAG, errorMsg)
            adCallback?.onError(errorMsg: errorMsg)
            goToMain()
            return
        }
        
        // 1. 计算广告尺寸（全屏，与 Android 屏幕尺寸逻辑一致）
        let screenSize = UIScreen.main.bounds.size
        Log.d(TAG, "屏幕尺寸：宽\(screenSize.width)px，高\(screenSize.height)px")
      
//      let screenSizeNative = UIScreen.main.nativeBounds
//      
//        let adSlot = BUAdSlot()
//      adSlot.id = adCodeId
//      let buSize = BUSize()
//      buSize.width = Int(screenSizeNative.width)
//      buSize.height = Int(screenSizeNative.height)
//      adSlot.imgSize = buSize
//      adSlot.adType = BUAdSlotAdType.splash
//      adSlot.adLoadType = BUAdLoadType.unknown
//      
//        
//        // 2. 初始化 BUSplashAd（V4700+ 新接口）
//        splashAd = BUSplashAd(slot: adSlot, adSize: screenSize)
      
        splashAd = BUSplashAd(slotID: adCodeId, adSize: screenSize)
      if let ad = splashAd {
          Log.d(TAG, "splashAd 初始化成功: \(ad)")
      } else {
          Log.e(TAG, "⚠️ 警告: splashAd 初始化失败，为 nil")
      }
        splashAd?.delegate = self
        splashAd?.cardDelegate = self // 新增：设置卡片广告代理
        splashAd?.tolerateTimeout = self.timeout // 设置超时时间
        splashAd?.supportCardView = true // 新增：启用卡片广告支持（官方Demo默认开启
        
        // 3. 加载广告（主线程调用，与 Android 一致）
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            Log.d(TAG, "开始加载开屏广告，adCodeId：\(adCodeId)，超时时间：\(timeout)s")
          self.splashAd?.loadData()
          
        }
    }
    
    // MARK: - 跳转到主界面（与 Android goToMain 一致）
    private func goToMain() {
        guard !isForceGoMain, let rootVC = rootVC else { return }
        Log.d(TAG, "触发跳主界面逻辑")
        
        // 移除广告容器，释放资源
        adContainer.removeAllSubviews()
        splashAd = nil
        isForceGoMain = true
        
        // 通知 RN 强制跳主界面
        adCallback?.onForceGoMain()
    }
    
    // MARK: - 生命周期方法（与 Android onResume/onStop 对齐）
    func onResume() {
        Log.d(TAG, "生命周期 onResume，isForceGoMain：\(isForceGoMain)")
        if isForceGoMain {
            adCallback?.onForceGoMain()
        }
    }
    
    func onStop() {
        Log.d(TAG, "生命周期 onStop，标记强制跳主界面")
        isForceGoMain = true
    }
    
    // MARK: - 释放资源（与 Android destroy 一致）
    func destroy() {
        Log.d(TAG, "释放广告资源")
        adContainer.removeAllSubviews()
        splashAd?.removeSplashView()
        splashAd = nil
        adCallback = nil
    }
    
    // MARK: - 错误码解析（与 Android getErrorCodeDesc 一致）
    private func getErrorDesc(error: BUAdError?) -> String {
        guard let code = error?.code else {
            return "未知错误（无错误码）"
        }
        switch code {
        case 1: return "物料加载失败"
        case 2: return "素材加载失败"
        case 3: return "渲染失败/渲染超时"
        case 23: return "加载超时（当前设置：\(Int(timeout))ms，建议增大超时时间）"
        case 1001: return "参数错误（adCodeId 无效）"
        case 1004: return "广告位无合适广告"
        default: return "未知错误（code：\(code)，\(error)）"
        }
    }
}

// MARK: - BUSplashAdDelegate（穿山甲开屏广告代理，映射 Android 回调）
// 实现BUSplashAdDelegate协议（补充所有必须方法）
extension SplashAdView: BUSplashAdDelegate {
    // 广告物料加载成功
    func splashAdLoadSuccess(_ splashAd: BUSplashAd) {
        Log.d(TAG, "广告物料加载成功，准备展示广告")
        adCallback?.onLoadSuccess()
        
        guard let rootVC = rootVC else {
            let errorMsg = "展示广告失败：根VC为空"
            adCallback?.onError(errorMsg: errorMsg)
            goToMain()
            return
        }
        splashAd.showSplashView(inRootViewController: rootVC)
    }
    
    // 广告物料加载失败
    func splashAdLoadFail(_ splashAd: BUSplashAd, error: BUAdError?) {
        let errorMsg = "广告加载失败：\(getErrorDesc(error: error))"
        Log.e(TAG, errorMsg)
      
        adCallback?.onError(errorMsg: errorMsg)
        goToMain()
    }
    
    // 广告渲染成功
    func splashAdRenderSuccess(_ splashAd: BUSplashAd) {
        Log.d(TAG, "广告渲染成功")
        adCallback?.onRenderSuccess()
    }
    
    // 广告渲染失败
    func splashAdRenderFail(_ splashAd: BUSplashAd, error: BUAdError?) {
        let errorMsg = "广告渲染失败：\(getErrorDesc(error: error))"
        Log.e(TAG, errorMsg)
        adCallback?.onError(errorMsg: errorMsg)
        goToMain()
    }
    
    // 广告展示
    func splashAdDidShow(_ splashAd: BUSplashAd) {
        Log.d(TAG, "广告已展示")
        adCallback?.onAdShow()
    }
    
    // 广告点击
    func splashAdDidClick(_ splashAd: BUSplashAd) {
        Log.d(TAG, "广告被点击")
        adCallback?.onAdClick()
    }
    
    // 广告关闭
    func splashAdDidClose(_ splashAd: BUSplashAd, closeType: BUSplashAdCloseType) {
        let closeDesc = closeType == .clickSkip ? "点击跳过" : (closeType == .countdownToZero ? "倒计时结束" : "点击跳转")
        Log.d(TAG, "广告关闭，关闭类型：\(closeDesc)")
        adCallback?.onAdClose()
        goToMain()
    }
    
    // 广告视图控制器关闭（协议必须实现的方法）
    func splashAdViewControllerDidClose(_ splashAd: BUSplashAd) {
        Log.d(TAG, "广告VC关闭，释放资源")
        destroy()
    }
    
    // 补充协议中可能新增的必须方法（根据SDK版本调整）
    func splashAdWillShow(_ splashAd: BUSplashAd) {
        Log.d(TAG, "广告即将展示")
    }
    
    func splashDidCloseOtherController(_ splashAd: BUSplashAd, interactionType: BUInteractionType) {
        Log.d(TAG, "广告跳转页面关闭，交互类型：\(interactionType.rawValue)")
    }
    // 视频广告播放完成（新增：处理视频类开屏广告的播放完成事件）
    func splashVideoAdDidPlayFinish(_ splashAd: BUSplashAd, didFailWithError error: Error?) {
        if let error = error {
            Log.e(TAG, "视频广告播放失败：\(error.localizedDescription)")
        } else {
            Log.d(TAG, "视频广告播放完成")
        }
        // 如需将此事件传递给RN，可添加回调：
        // adCallback?.onVideoPlayFinish()
        // 注意：需在SplashAdCallback协议中新增对应方法
    }
}

// MARK: - BUSplashCardDelegate 实现（卡片广告事件监听，关键：处理卡片展示/点击/关闭）
extension SplashAdView: BUSplashCardDelegate {
    // 卡片广告准备显示（必须实现：触发卡片展示）
    func splashCardReady(toShow splashAd: BUSplashAd) {
        Log.d(TAG, "卡片广告准备显示，执行展示逻辑")
        
        guard let rootVC = rootVC else {
            let errorMsg = "卡片广告展示失败：根VC为空"
            Log.e(TAG, errorMsg)
            adCallback?.onError(errorMsg: errorMsg)
            goToMain()
            return
        }
        // 显示卡片广告（调用SDK专用方法）
        splashAd.showCardView(inRootViewController: rootVC)
        Log.d(TAG, "卡片广告已发起显示请求，根VC：\(rootVC.className)")
    }
    
    // 卡片广告被点击（传递点击事件到RN）
    func splashCardViewDidClick(_ splashAd: BUSplashAd) {
        Log.d(TAG, "卡片广告被点击")
        adCallback?.onAdClick()
    }
    
    // 卡片广告关闭（触发跳主界面）
    func splashCardViewDidClose(_ splashAd: BUSplashAd) {
        Log.d(TAG, "卡片广告关闭，触发跳主界面")
        adCallback?.onAdClose()
        goToMain()
    }
}

// MARK: - 工具扩展（辅助方法）
extension UIView {
    // 移除所有子视图（简化代码）
    func removeAllSubviews() {
        subviews.forEach { $0.removeFromSuperview() }
    }
}

extension NSObject {
    // 获取类名（日志用）
    var className: String {
        return String(describing: type(of: self))
    }
}

// 日志工具（与 Android Log 对齐）
enum Log {
    static func d(_ tag: String, _ msg: String) {
        print("[DEBUG] \(tag): \(msg)")
    }
    static func e(_ tag: String, _ msg: String) {
        print("[ERROR] \(tag): \(msg)")
    }
}
