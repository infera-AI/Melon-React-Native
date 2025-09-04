//
//  SplashAdViewBridge.m
//  Melon
//
//  Created by 季弘扬 on 2025/8/29.
//

#import <Foundation/Foundation.h>
// SplashAdViewManager-Bridge.m
#import <React/RCTViewManager.h>

// 1. 声明 Swift 中的 SplashAdViewManager 类（与 Swift 中的 @objc(SplashAdViewManager) 对应）
@class CSJSplashAdViewManager;

// 2. 注册原生 UI 组件：指定组件名称为 "CSJSplashAdView"（与 RN 中 requireNativeComponent 的参数一致）
@interface RCT_EXTERN_MODULE(CSJSplashAdViewManager, RCTViewManager)

// 3. 暴露给 RN 的方法：每个方法对应 Swift 中 @objc 标记的方法
// 格式：RCT_EXTERN_METHOD(方法名, (参数类型)参数1, (参数类型)参数2, ...)
// 注意：RN 调用 UI 组件方法时，必须传递 reactTag（组件唯一标识），对应 Swift 中的 _ reactTag: NSNumber

// 暴露 loadAd 方法（参数：reactTag、adCodeId、timeout）
RCT_EXTERN_METHOD(loadAd:(nonnull NSNumber *)reactTag adCodeId:(NSString *)adCodeId timeout:(NSInteger)timeout)

// 暴露 onResume 方法（参数：reactTag）
RCT_EXTERN_METHOD(onResume:(nonnull NSNumber *)reactTag)

// 暴露 onStop 方法（参数：reactTag）
RCT_EXTERN_METHOD(onStop:(nonnull NSNumber *)reactTag)

// 暴露 destroy 方法（参数：reactTag）
RCT_EXTERN_METHOD(destroy:(nonnull NSNumber *)reactTag)

@end
