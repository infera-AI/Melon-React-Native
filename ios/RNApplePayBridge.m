//
//  RNApplePayBridge.m
//  Melon
//
//  Created by 季弘扬 on 2025/11/1.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNApplePay, NSObject)

// canMakePayments
RCT_EXTERN_METHOD(canMakePayments:(RCTResponseSenderBlock)callback)

// Promise 风格：requestPayment
RCT_EXTERN_METHOD(requestPayment:(NSDictionary *)paymentData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
