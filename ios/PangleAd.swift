import Foundation
import React
import UIKit
import BUAdSDK

// 奖励信息模型（解析穿山甲SDK返回的奖励数据）
private class RewardInfo {
    let isSuccess: Bool
    let rewardName: String
    let rewardAmount: Int
    let errorCode: Int
    let errorMsg: String
    let rewardPropose: Int  // 进阶奖励比例（0-100）
    
    init(dict: [String: Any]) {
        self.isSuccess = dict["is_success"] as? Bool ?? false
        self.rewardName = dict["reward_name"] as? String ?? "未知奖励"
        self.rewardAmount = dict["reward_amount"] as? Int ?? 0
        self.errorCode = dict["error_code"] as? Int ?? -1
        self.errorMsg = dict["error_msg"] as? String ?? "未知错误"
        self.rewardPropose = dict["reward_propose"] as? Int ?? 0
    }
}

// MARK: - RN广告模块（继承RCTEventEmitter用于发送事件，与桥接文件匹配）
@objc(PangleAd)
class PangleAd: RCTEventEmitter {
    // 广告实例（穿山甲激励视频广告）
    private var rewardAd: BUNativeExpressRewardedVideoAd?
    // 广告位ID（从RN传入）
    private var slotID: String = ""
    // 状态控制（避免重复操作）
    private var isInited: Bool = false
    private var isLoading: Bool = false
    private var isAdLoaded: Bool = false
    // 奖励配置（从RN可选参数中解析）
    private var rewardName: String = "金币"
    private var rewardAmount: Int = 0
    private var enableAdvancedReward: Bool = false
    
    // MARK: - RCTEventEmitter 必须实现：返回支持的事件列表（RN可监听）
    override func supportedEvents() -> [String] {
        return [
            "PangleAd_onInitSuccess",
            "PangleAd_onInitFailed",
            "PangleAd_onAdLoaded",
            "PangleAd_onAdLoadFailed",
            "PangleAd_onAdShown",
            "PangleAd_onAdShowFailed",
            "PangleAd_onAdClicked",
            "PangleAd_onAdClosed",
            "PangleAd_onVideoCompleted",
            "PangleAd_onVideoError",
            "PangleAd_onVideoSkipped",
            "PangleAd_onRewardArrived",
            "PangleAd_onAdvancedReward"
        ]
    }
    
    // MARK: - 主线程初始化控制（与AudioSessionManager风格一致）
    @objc func requiresMainQueueSetup() -> Bool {
        return true  // 广告操作需主线程，必须返回true
    }
    
    // MARK: - 暴露给RN的方法（@objc修饰，与桥接文件签名完全匹配）
    
    /// 1. 初始化广告（对应RN的initAd方法）
    /// - Parameters:
    ///   - adCodeId: 广告位ID（9开头9位数字，必传）
    ///   - options: 可选配置（奖励名称、数量、进阶奖励开关）
    ///   - resolver: RN成功回调
    ///   - rejecter: RN失败回调
    @objc func initAd(
        _ adCodeId: String,
        options: NSDictionary?,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        // 1. 验证广告位ID格式
        guard adCodeId.count == 9, adCodeId.starts(with: "9") else {
            let errorMsg = "无效的广告位ID（需9开头9位数字）"
            reject("INIT_FAILED", errorMsg, nil)
            sendEvent(withName: "PangleAd_onInitFailed", body: ["msg": errorMsg])
            return
        }
        
        // 2. 解析RN传入的可选参数
        if let options = options {
            rewardName = options["rewardName"] as? String ?? "积分"
            rewardAmount = options["rewardAmount"] as? Int ?? 0
            enableAdvancedReward = options["enableAdvancedReward"] as? Bool ?? false
        }
        
        // 3. 初始化穿山甲激励视频广告实例
        let rewardModel = BURewardedVideoModel()
        rewardModel.rewardName = rewardName
        rewardModel.rewardAmount = rewardAmount
        
        rewardAd = BUNativeExpressRewardedVideoAd(
            slotID: adCodeId,
            rewardedVideoModel: rewardModel
        )
        rewardAd?.delegate = self  // 设置广告回调代理
        
        // 4. 更新状态并回调RN
        slotID = adCodeId
        isInited = true
        let successMsg = "广告初始化成功（adCodeId：\(adCodeId)）"
        print("广告初始化成功")
        sendEvent(withName: "PangleAd_onInitSuccess", body: ["msg": successMsg])
        resolve(successMsg)

//      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
//        self?.sendEvent(withName: "PangleAd_onInitSuccess", body: ["msg": successMsg])
//      }
    }
    
    /// 2. 加载广告（对应RN的autoLoadRewardAd方法）
    /// - Note: 必须先调用initAd且初始化成功
    @objc func autoLoadRewardAd(
        _ ignore: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        // 1. 检查初始化状态
        guard isInited else {
            let errorMsg = "请先调用initAd初始化广告"
            reject("LOAD_FAILED", errorMsg, nil)
            sendEvent(withName: "PangleAd_onAdLoadFailed", body: ["code": -100, "msg": errorMsg])
            return
        }
        
        // 2. 避免重复加载
        guard !isLoading else {
            let errorMsg = "广告正在加载中，请勿重复请求"
            reject("LOAD_FAILED", errorMsg, nil)
            sendEvent(withName: "PangleAd_onAdLoadFailed", body: ["code": -2, "msg": errorMsg])
            return
        }
      
//
//        
//        // 3. 开始加载广告
        isLoading = true
        isAdLoaded = false
        rewardAd?.loadData()  // 调用穿山甲SDK加载方法
        resolve("开始加载激励广告（adCodeId：\(slotID)）")
    }
    
    /// 3. 展示广告（对应RN的showAd方法）
    /// - Note: 必须先调用autoLoadRewardAd且加载成功
    @objc func showAd(
        _ ignore: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
      // 🔥 额外保障：强制 showAd 整体在主线程执行
          DispatchQueue.main.async { [weak self] in
              guard let self = self else { return }  // 避免循环引用
              
              // 1. 检查初始化状态
              guard self.isInited else {
                  let errorMsg = "请先调用initAd初始化广告"
                  reject("SHOW_FAILED", errorMsg, nil)
                  self.sendEvent(withName: "PangleAd_onAdShowFailed", body: ["msg": errorMsg])
                  return
              }
              
              // 2. 检查广告加载状态
              guard self.isAdLoaded, let ad = self.rewardAd else {
                  let errorMsg = "广告未加载，请先调用autoLoadRewardAd"
                  reject("SHOW_FAILED", errorMsg, nil)
                  self.sendEvent(withName: "PangleAd_onAdShowFailed", body: ["msg": errorMsg])
                  return
              }
              
              // 3. 获取当前顶层ViewController（已强制主线程）
              guard let currentVC = self.getCurrentViewController() else {
                  let errorMsg = "无法获取当前页面，无法展示广告"
                  reject("SHOW_FAILED", errorMsg, nil)
                  self.sendEvent(withName: "PangleAd_onAdShowFailed", body: ["msg": errorMsg])
                  return
              }
              
              // 4. 展示广告（UI操作，必须主线程）
              ad.show(fromRootViewController: currentVC)
              resolve("广告开始展示（adCodeId：\(self.slotID)）")
          }
    }
    
    /// 4. 释放广告资源（对应RN的releaseAd方法）
    /// - Note: RN页面卸载时调用，避免内存泄漏
    @objc func releaseAd(
        _ ignore: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        // 清空广告实例和状态
        rewardAd?.delegate = nil  // 先移除代理，避免野指针
        rewardAd = nil
        isInited = false
        isLoading = false
        isAdLoaded = false
        
        let successMsg = "广告资源已释放（adCodeId：\(slotID)）"
      print("广告资源已释放")
        resolve(successMsg)
        sendEvent(withName: "PangleAd_onAdClosed", body: ["msg": successMsg])
    }
    
    // MARK: - 辅助方法：获取当前顶层ViewController（兼容iOS 13+多窗口）
    private func getCurrentViewController() -> UIViewController? {
      var currentVC: UIViewController?
          
      // 🔥 核心修复：先判断当前线程是否为主线程，避免主线程 sync 死锁
      if Thread.isMainThread {
          // 1. 当前已是主线程：直接执行 UI 逻辑，无需 sync
          currentVC = getTopVCOnMainThread()
      } else {
          // 2. 当前是子线程：用 sync 切换到主线程执行（安全）
          DispatchQueue.main.sync {
              currentVC = getTopVCOnMainThread()
          }
      }
      
      return currentVC
    }
  
    // 🔥 抽离 UI 逻辑到单独方法，避免代码重复
    private func getTopVCOnMainThread() -> UIViewController? {
        // 1. 兼容 iOS 13+ SceneDelegate 窗口（UI 操作，必须主线程）
        guard let windowScene = UIApplication.shared.connectedScenes
                .filter({ $0.activationState == .foregroundActive })
                .first as? UIWindowScene else {
            // 2. 兼容旧版 UIWindow（iOS < 13）
            let keyWindow = UIApplication.shared.keyWindow ?? UIApplication.shared.windows.first
            return keyWindow?.rootViewController?.topMostViewController()
        }
        
        // 3. 从活跃窗口中找关键窗口（keyWindow）
        guard let keyWindow = windowScene.windows.first(where: { $0.isKeyWindow }) else {
            // 兜底：如果没有 keyWindow，取窗口列表第一个
            return windowScene.windows.first?.rootViewController?.topMostViewController()
        }
        
        // 4. 获取最顶层控制器
        return keyWindow.rootViewController?.topMostViewController()
    }
}

// MARK: - 辅助扩展：递归获取最顶层ViewController
extension UIViewController {
    func topMostViewController() -> UIViewController {
        // 处理导航控制器（UINavigationController）
        if let navVC = self as? UINavigationController {
            return navVC.visibleViewController?.topMostViewController() ?? navVC
        }
        
        // 处理标签控制器（UITabBarController）
        if let tabVC = self as? UITabBarController {
            guard let selectedVC = tabVC.selectedViewController else {
                return tabVC
            }
            return selectedVC.topMostViewController()
        }
        
        // 处理模态弹出的控制器（presentedViewController）
        if let presentedVC = self.presentedViewController {
            return presentedVC.topMostViewController()
        }
        
        // 最顶层控制器（无嵌套）
        return self
    }
}

// MARK: - 穿山甲广告回调代理（转换为RN事件）
extension PangleAd: BUNativeExpressRewardedVideoAdDelegate {
    /// 广告加载成功
    func nativeExpressRewardedVideoAdDidLoad(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        isLoading = false
        isAdLoaded = true
        sendEvent(withName: "PangleAd_onAdLoaded", body: ["msg": "广告加载成功，可展示"])
    }
    
    /// 视频缓存完成（补充事件，确保广告能立即展示）
    func nativeExpressRewardedVideoAdDidDownLoadVideo(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        sendEvent(withName: "PangleAd_onAdLoaded", body: ["msg": "视频缓存完成，展示无延迟"])
    }
    
    /// 广告加载失败
    func nativeExpressRewardedVideoAd(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd, didFailWithError error: Error?) {
        isLoading = false
        let adError = error as? BUAdError
        let errorCode = adError?.code ?? -999
        let errorMsg = adError?.localizedDescription ?? "未知加载错误"
      print("IOS广告加载失败--\(error)")
        sendEvent(withName: "PangleAd_onAdLoadFailed", body: ["code": errorCode, "msg": errorMsg])
    }
    
    /// 广告展示成功
    func nativeExpressRewardedVideoAdDidVisible(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        sendEvent(withName: "PangleAd_onAdShown", body: ["msg": "广告已展示"])
    }
    
    /// 广告展示失败（渲染错误）
    func nativeExpressRewardedVideoAdViewRenderFail(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd, error: Error?) {
        let errorMsg = error?.localizedDescription ?? "广告渲染失败，无法展示"
        sendEvent(withName: "PangleAd_onAdShowFailed", body: ["msg": errorMsg])
    }
    
    /// 广告被点击
    func nativeExpressRewardedVideoAdDidClick(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        sendEvent(withName: "PangleAd_onAdClicked", body: ["msg": "广告被点击"])
    }
    
    /// 广告关闭
    func nativeExpressRewardedVideoAdDidClose(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
        sendEvent(withName: "PangleAd_onAdClosed", body: ["msg": "广告已关闭"])
      rewardAd?.delegate = nil  // 先移除代理，避免野指针
      rewardAd = nil
      isInited = false
      isLoading = false
      isAdLoaded = false
    }
    
    /// 视频播放完成
    func nativeExpressRewardedVideoAdDidPlayFinish(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd, didFailWithError error: Error?) {
        print("视频播放完成")
        sendEvent(withName: "PangleAd_onVideoCompleted", body: ["msg": "视频播放完成"])
    }
    
    /// 视频播放错误
    func nativeExpressRewardedVideoAdDidPlayError(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd, error: Error?) {
        let errorMsg = error?.localizedDescription ?? "视频播放错误"
        sendEvent(withName: "PangleAd_onVideoError", body: ["msg": errorMsg])
    }
    
    /// 视频被跳过
    func nativeExpressRewardedVideoAdDidClickSkip(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd) {
      print("video is jump跳过")
        sendEvent(withName: "PangleAd_onVideoSkipped", body: ["msg": "视频被跳过，无奖励"])
    }
    
    /// 奖励发放（基础奖励 + 进阶奖励）
    func nativeExpressRewardedVideoAdServerRewardDidSucceed(_ rewardedVideoAd: BUNativeExpressRewardedVideoAd, verify: Bool) {
      if verify {
          // 验证成功：给用户发放奖励（如通知RN）
          sendEvent(withName: "PangleAd_onRewardArrived", body: [
              "isRewardValid": true,
              "rewardName": rewardName,  // 从initAd时的配置获取
              "rewardAmount": rewardAmount,
              "msg": "奖励验证成功，可发放"
          ])
          print("✅ 奖励验证成功（verify = true）")
      } else {
          // 验证失败：不发放奖励
          sendEvent(withName: "PangleAd_onRewardArrived", body: [
              "isRewardValid": false,
              "msg": "奖励验证失败（verify = false）"
          ])
          print("❌ 奖励验证失败（verify = false）")
      }
      
//      let rewardInfo = RewardInfo(dict: verify as? [String: Any] ?? [:])
//        
//        // 1. 发送基础奖励事件
//        sendEvent(withName: "PangleAd_onRewardArrived", body: [
//            "isRewardValid": rewardInfo.isSuccess,
//            "rewardType": 0,  // 0=基础奖励
//            "rewardName": rewardInfo.rewardName,
//            "rewardAmount": rewardInfo.rewardAmount,
//            "serverErrorCode": rewardInfo.errorCode,
//            "serverErrorMsg": rewardInfo.errorMsg
//        ])
        
        // 2. 若启用进阶奖励，额外发送进阶奖励事件
//        if enableAdvancedReward && rewardInfo.isSuccess {
//            sendEvent(withName: "PangleAd_onAdvancedReward", body: [
//                "rewardType": 1,  // 1=进阶奖励
//                "rewardName": rewardInfo.rewardName,
//                "rewardAmount": rewardInfo.rewardAmount,
//                "rewardPropose": rewardInfo.rewardPropose  // 奖励比例
//            ])
//        }
    }
  
    /// 2. 奖励验证失败回调（源码中也有声明，必须实现，避免遗漏）
    func nativeExpressRewardedVideoAdServerRewardDidFail(
        _ rewardedVideoAd: BUNativeExpressRewardedVideoAd,
        error: Error?
    ) {
        // 服务器验证请求本身失败（如网络错误），不发放奖励
        let errorMsg = error?.localizedDescription ?? "奖励验证请求失败"
        sendEvent(withName: "PangleAd_onRewardArrived", body: [
            "isRewardValid": false,
            "serverErrorMsg": errorMsg
        ])
        print("❌ 奖励验证请求失败：\(errorMsg)")
    }
}
