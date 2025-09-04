//
//  PangleAdBridge.m
//  Melon
//
//  Created by 季弘扬 on 2025/8/29.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@class PangleAd;

// 父类 RCTEventEmitter 与 Swift 一致（正确）
@interface RCT_EXTERN_MODULE(PangleAd, RCTEventEmitter)

// 1. initAd：修正 resolver/rejecter 变量名（与真实签名一致）
RCT_EXTERN_METHOD(initAd:(NSString *)adCodeId
                  options:(NSDictionary * _Nullable)options
                  resolver:(RCTPromiseResolveBlock _Nonnull)resolve  // ✅ 变量名：resolve（不是 resolver）
                  rejecter:(RCTPromiseRejectBlock _Nonnull)reject)   // ✅ 变量名：reject（不是 rejecter）

RCT_EXTERN_METHOD(autoLoadRewardAd:(NSString *)ignore
                  resolver:(RCTPromiseResolveBlock _Nonnull)resolve  // ✅ 变量名：resolve（不是 resolver）
                  rejecter:(RCTPromiseRejectBlock _Nonnull)reject)   // ✅ 变量名：reject（不是 rejecter）

RCT_EXTERN_METHOD(showAd:(NSString *)ignore
                  resolver:(RCTPromiseResolveBlock _Nonnull)resolve  // ✅ 变量名：resolve（不是 resolver）
                  rejecter:(RCTPromiseRejectBlock _Nonnull)reject)   // ✅ 变量名：reject（不是 rejecter）

RCT_EXTERN_METHOD(releaseAd:(NSString *)ignore
                  resolver:(RCTPromiseResolveBlock _Nonnull)resolve  // ✅ 变量名：resolve（不是 resolver）
                  rejecter:(RCTPromiseRejectBlock _Nonnull)reject)   // ✅ 变量名：reject（不是 rejecter）

@end
