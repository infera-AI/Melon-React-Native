//
//  HeadsetDetectionBridge.m
//  Melon
//
//  Created by 季弘扬 on 2025/8/1.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(HeadsetDetection, RCTEventEmitter)

RCT_EXTERN_METHOD(startListening)
RCT_EXTERN_METHOD(stopListening)

@end

