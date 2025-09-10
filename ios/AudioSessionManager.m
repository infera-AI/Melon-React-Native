//
//  AudioSessionManager.m
//  Melon
//
//  Created by 季弘扬 on 2025/7/31.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AudioSessionManager, NSObject)

RCT_EXTERN_METHOD(setAudioSessionCategory:(NSString *)category
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
