import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

// 导入ATT、IDFA、穿山甲SDK相关框架
import AppTrackingTransparency
import AdSupport
import BUAdSDK
import BUAdSDK.BUAdSDKManager
import BUAdTestMeasurement

// 1. 导入谷歌登录 SDK
import GoogleSignIn

@main
class AppDelegate: UIResponder, UIApplicationDelegate, RNAppAuthAuthorizationFlowManager {
  public weak var authorizationFlowManagerDelegate: RNAppAuthAuthorizationFlowManagerDelegate?
  var window: UIWindow?
  private var globalOverlayButton: UIButton!
  
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()
    
    let appConfig = Bundle.main.object(forInfoDictionaryKey: "APP_CONFIG") as? [String: Any] ?? [:]
    let appSign = appConfig["APP_SIGN"] as? String ?? ""

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    // 初始化窗口并立即显示
    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = .white
    
    // 关键修复：先设置一个临时根控制器（解决启动时根控制器缺失的错误）
    let tempVC = UIViewController()
    tempVC.view.backgroundColor = .white // 避免黑屏
    window?.rootViewController = tempVC
    
    window?.makeKeyAndVisible()
    
    // 处理ATT权限和穿山甲初始化
    setupCSJAndATT { [weak self] in
      // ATT处理完成后，启动RN并替换根控制器
      factory.startReactNative(
        withModuleName: "Melon",
        in: self?.window,
        launchOptions: launchOptions
      )
      #if DEBUG
        if appSign == "melon" || appSign == "momor" {
          self?.setupGlobalOverlayButton()
        }
      #endif
    }

    return true
  }
  
  // 处理谷歌登录 URL 回调
  func application(
      _ app: UIApplication,
      open url: URL,
      options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
//      // 让谷歌 SDK 处理回调，同时保留其他可能的回调处理（如果有的话）
//      let handledByGoogle = GIDSignIn.sharedInstance.handle(url)
//      
//      // 如果有其他需要处理的 URL 回调（如其他第三方登录、支付等），可以在这里添加
//      // 例如：let handledByOther = otherSDK.handle(url)
//      
//      // 返回是否处理成功（谷歌处理成功则返回 true）
//      return handledByGoogle
    
    // 优先让RNAppAuth处理回调，如果处理成功则返回true
    if let delegate = self.authorizationFlowManagerDelegate,
       delegate.resumeExternalUserAgentFlow(with: url) {
        return true
    }
    
    // 然后让谷歌 SDK 处理 URL 回调，如果谷歌 SDK 处理成功也返回true
    let handledByGoogle = GIDSignIn.sharedInstance.handle(url)
    if handledByGoogle {
        return true
    }
    
    return false
  }
  
  // 创建全局覆盖按钮（保持不变，仅修改点击事件关联）
  private func setupGlobalOverlayButton() {
    guard let window = window else { return }
    
    globalOverlayButton = UIButton(type: .system)
    globalOverlayButton.setTitle("广告测试工具", for: .normal)
    globalOverlayButton.setTitleColor(.white, for: .normal)
    globalOverlayButton.backgroundColor = .systemOrange
    globalOverlayButton.layer.cornerRadius = 8
    globalOverlayButton.layer.shadowColor = UIColor.black.cgColor
    globalOverlayButton.layer.shadowOpacity = 0.3
    globalOverlayButton.layer.shadowRadius = 4
    globalOverlayButton.layer.shadowOffset = .zero
    // 关键修改：点击事件改为打开纯原生控制器
    globalOverlayButton.addTarget(self, action: #selector(openNativeTestToolController), for: .touchUpInside)
    
    let buttonSize = CGSize(width: 150, height: 50)
    globalOverlayButton.bounds = CGRect(origin: .zero, size: buttonSize)
    updateGlobalButtonPosition()
    
    window.addSubview(globalOverlayButton)
    window.bringSubviewToFront(globalOverlayButton)
    
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(updateGlobalButtonPosition),
      name: UIDevice.orientationDidChangeNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(updateGlobalButtonPosition),
      name: UIApplication.didChangeStatusBarFrameNotification,
      object: nil
    )
  }
  
  @objc private func updateGlobalButtonPosition() {
    guard let window = window, let button = globalOverlayButton else { return }
    
    let horizontalMargin: CGFloat = 20
    let verticalMargin: CGFloat = 20
    let bottomSafeMargin = window.safeAreaInsets.bottom > 0 ? window.safeAreaInsets.bottom + verticalMargin : verticalMargin
    
    let buttonX = window.bounds.width - button.bounds.width - horizontalMargin
    let buttonY = window.bounds.height - button.bounds.height - bottomSafeMargin
    
    button.center = CGPoint(x: buttonX + button.bounds.width/2, y: buttonY + button.bounds.height/2)
    window.bringSubviewToFront(button)
  }
  
  // MARK: - 新增：打开纯原生测试工具控制器（核心修改）
  @objc private func openNativeTestToolController() {
    print("广告测试工具按钮被点击 → 打开纯原生控制器")
    
    // 1. 创建纯原生测试工具控制器（独立于RN）
    let testToolVC = TestToolNativeViewController()
    testToolVC.title = "测试工具入口"
    
    // 2. 用导航控制器包装（确保测试工具弹窗能正常弹出，复刻官方Demo逻辑）
    let navVC = UINavigationController(rootViewController: testToolVC)
    navVC.modalPresentationStyle = .fullScreen // 全屏显示，避免被RN视图遮挡
    navVC.navigationBar.tintColor = .black // 设置导航栏返回按钮颜色
    
    // 3. 从当前根控制器弹出（无论根控制器是RN还是临时VC，都能正常弹出）
    guard let rootVC = window?.rootViewController else {
      print("❌ 无法获取根控制器，无法打开测试工具")
      return
    }
    
    rootVC.present(navVC, animated: true) {
      print("✅ 纯原生测试工具控制器已弹出")
    }
  }
  
  // 优化后的ATT权限和穿山甲初始化逻辑（保持不变）
  private func setupCSJAndATT(completion: @escaping () -> Void) {
    print("📱 开始处理ATT权限")
    
    // 初始化ATT权限管理器
    ATTPermissionManager.shared.handleATTPermission { [weak self] in
      let appConfig = Bundle.main.object(forInfoDictionaryKey: "APP_CONFIG") as? [String: Any] ?? [:]
      let appSign = appConfig["APP_SIGN"] as? String ?? ""

      if appSign == "melon" || appSign == "momor" {
        print("穿山甲SDK初始化")
        // ATT处理完成后初始化穿山甲
        self?.initCSJSDK(completion: completion)
      } else {
        completion()
      }
      
      
    }
  }

  // 穿山甲SDK初始化（保持不变）
  private func initCSJSDK(completion: @escaping () -> Void) {
//    5736753
    let csjAppID = "5735174"
    print("🚀 初始化穿山甲SDK，AppID：\(csjAppID)")
    
    let configuration = BUAdSDKConfiguration.configuration()
    configuration.appID = csjAppID
    
    
    configuration.allowModifyAudioSessionSetting = true
    configuration.audioSessionSetType = .mix
    
    // 配置测试工具
    #if DEBUG
      configuration.debugLog = 1 // 开启调试日志（源码要求：1=打开，0=关闭）
      configuration.useMediation = false // 使用测试预览工具必须设为false
      configuration.customIdfa = "5669F4CC-7104-4ECB-8AE5-DC174F581D66"
      BUAdTestMeasurementConfiguration().debugMode = true
      
      print("✅ 已开启测试工具 debug 模式")
    #endif
    
    BUAdSDKManager.start(asyncCompletionHandler: { success, error in
      DispatchQueue.main.async {
        if success {
          print("🎉 穿山甲SDK初始化成功，版本：\(BUAdSDKManager.sdkVersion ?? "未知")")
        } else {
          print("❌ 穿山甲SDK初始化失败：\(error?.localizedDescription ?? "无信息")")
        }
        completion()
      }
    })
    
    
  }
}

// MARK: - 纯原生测试工具控制器（新增返回按钮逻辑）
class TestToolNativeViewController: UIViewController {
  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .white
    
    // 关键新增：添加导航栏返回按钮（解决无法返回问题）
    setupNavigationBarBackButton()
    
    // 添加标题标签
    let titleLabel = UILabel(frame: CGRect(x: 0, y: 100, width: view.bounds.width, height: 30))
    titleLabel.text = "请点击下方按钮启动测试工具"
    titleLabel.textAlignment = .center
    titleLabel.font = .systemFont(ofSize: 18)
    view.addSubview(titleLabel)
    
    // 添加启动测试工具按钮
    let startTestToolBtn = UIButton(type: .system)
    startTestToolBtn.setTitle("启动穿山甲测试工具", for: .normal)
    startTestToolBtn.titleLabel?.font = .systemFont(ofSize: 16, weight: .medium)
    startTestToolBtn.backgroundColor = .systemBlue
    startTestToolBtn.setTitleColor(.white, for: .normal)
    startTestToolBtn.layer.cornerRadius = 8
    startTestToolBtn.frame = CGRect(
      x: (view.bounds.width - 200) / 2,
      y: 200,
      width: 200,
      height: 50
    )
    startTestToolBtn.addTarget(self, action: #selector(startPangleTestTool), for: .touchUpInside)
    view.addSubview(startTestToolBtn)
  }
  
  // MARK: - 新增：配置导航栏返回按钮
  private func setupNavigationBarBackButton() {
    // 1. 设置导航栏标题
    self.title = "测试工具入口"
    
    // 2. 创建返回按钮（系统默认样式，带“< 返回”文字）
    let backButton = UIBarButtonItem(
      barButtonSystemItem: .done,
      target: self,
      action: #selector(backToPreviousPage)
    )
    // （可选）自定义返回按钮文字和颜色
    // let backButton = UIBarButtonItem(
    //   title: "返回",
    //   style: .plain,
    //   target: self,
    //   action: #selector(backToPreviousPage)
    // )
    // backButton.tintColor = .black // 设置返回按钮颜色
    
    // 3. 将返回按钮添加到导航栏左侧
    self.navigationItem.leftBarButtonItem = backButton
    
    // 4. （可选）设置导航栏背景色（避免与RN界面风格差异太大）
    self.navigationController?.navigationBar.backgroundColor = .white
    self.navigationController?.navigationBar.barTintColor = .white
  }
  
  // MARK: - 新增：返回按钮点击事件
  @objc private func backToPreviousPage() {
    // 关闭当前控制器，返回上一页（RN界面）
    self.dismiss(animated: true) {
      print("✅ 已返回RN主界面")
    }
  }
  
  // MARK: - 核心：启动测试工具（原有逻辑不变）
  @objc private func startPangleTestTool() {
    print("在纯原生控制器中调用测试工具 → BUAdTestMeasurementManager")
    BUAdTestMeasurementManager.showTestMeasurement(with: self)
    
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in
      guard let self = self else { return }
      if self.presentedViewController != nil {
        print("✅ 测试工具已成功弹出（纯原生控制器调用）")
      } else {
        print("❌ 测试工具未弹出，可能原因：")
        print("   1. BUAdTestMeasurement.xcframework 未正确链接")
        print("   2. 穿山甲SDK版本问题（推荐6.15.0）")
        print("   3. AppID无效（当前：5735174）")
      }
    }
  }
  
  // MARK: - 新增：支持右滑返回（可选，模拟系统默认返回体验）
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    // 开启导航控制器的右滑返回功能（默认关闭，需手动开启）
    self.navigationController?.interactivePopGestureRecognizer?.isEnabled = true
    // （可选）设置右滑返回的代理（避免手势冲突）
    self.navigationController?.interactivePopGestureRecognizer?.delegate = self
  }
}

// MARK: - 新增：右滑返回手势代理（确保手势正常工作）
extension TestToolNativeViewController: UIGestureRecognizerDelegate {
  // 允许手势触发
  func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
    // 只有当前控制器是导航栈的根控制器时，才允许右滑返回（避免多层嵌套问题）
    return self.navigationController?.viewControllers.count ?? 0 > 1
  }
}

// 独立的ATT权限管理工具类（保持不变）
class ATTPermissionManager: NSObject {
  static let shared = ATTPermissionManager()
  private override init() {}
  
  /// 处理ATT权限，确保弹窗显示
  func handleATTPermission(completion: @escaping () -> Void) {
    print("📱 开始处理ATT权限请求")
    
    // iOS 14.5以下无需授权
    guard #available(iOS 14.5, *) else {
      print("📌 iOS版本<14.5，无需ATT授权")
      printIDFA()
      completion()
      return
    }
    
    // 检查当前ATT状态
    let currentStatus = ATTrackingManager.trackingAuthorizationStatus
    print("🔍 当前ATT状态：\(getStatusDescription(status: currentStatus))")
    
    switch currentStatus {
    case .notDetermined:
      // 延迟0.5秒并确保在主线程弹窗
      print("⚠️ 准备弹出ATT授权弹窗（延迟0.5秒确保窗口就绪）")
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        ATTrackingManager.requestTrackingAuthorization { status in
          DispatchQueue.main.async {
            print("✅ ATT授权结果：\(self.getStatusDescription(status: status))")
            self.printIDFA()
            completion()
          }
        }
      }
      
    case .authorized, .denied, .restricted:
      // 已确定状态直接处理
      print("📌 ATT状态已确定，无需弹窗")
      printIDFA()
      completion()
      
    @unknown default:
      print("📌 ATT未知状态")
      printIDFA()
      completion()
    }
  }
  
  /// 打印IDFA信息
  private func printIDFA() {
    if #available(iOS 14.5, *) {
      guard ATTrackingManager.trackingAuthorizationStatus == .authorized else {
        print("📱 IDFA：ATT未授权，无法获取")
        return
      }
    }
    
    let idfa = ASIdentifierManager.shared().advertisingIdentifier.uuidString
    if idfa == "00000000-0000-0000-0000-000000000000" {
      print("📱 IDFA：无效值（可能是模拟器或未授权）")
    } else {
      print("📱 IDFA：\(idfa)")
    }
  }
  
  /// 转换状态为可读文字
  private func getStatusDescription(status: ATTrackingManager.AuthorizationStatus) -> String {
    switch status {
    case .notDetermined: return "未确定（将弹窗）"
    case .authorized: return "已允许（可获取IDFA）"
    case .denied: return "已拒绝"
    case .restricted: return "受限制"
    @unknown default: return "未知"
    }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
