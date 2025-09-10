//
//  ConfigModule.m
//  Melon
//
//  Created by 季弘扬 on 2025/8/20.
//

#import <Foundation/Foundation.h>

#import <React/RCTBridgeModule.h>

// 这里不需要 @interface 声明，直接 @implementation
@interface RCT_EXTERN_MODULE(ConfigModule, NSObject)

// 使用 RCT_EXTERN_METHOD 导出Swift方法
RCT_EXTERN_METHOD(getConfig:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

// 导出 requiresMainQueueSetup 类方法
RCT_EXTERN_METHOD(requiresMainQueueSetup)

@end
