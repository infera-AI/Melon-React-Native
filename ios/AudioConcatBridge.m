//
//  AudioConcatBridge.m
//  Melon
//
//  Created by 季弘扬 on 2025/8/8.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

// 告诉 React Native 存在一个 Swift 模块
@interface RCT_EXTERN_MODULE(AudioConcatModule, NSObject)

RCT_EXTERN_METHOD(concatAudios:
                  (NSArray<NSString *> *)audioPaths
                  outputPath:(NSString *)outputPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
