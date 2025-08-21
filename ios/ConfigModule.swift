//
//  ConfigModule.swift
//  Melon
//
//  Created by 季弘扬 on 2025/8/20.
//

import Foundation

@objc(ConfigModule)
class ConfigModule: NSObject {

    // 辅助方法：获取配置字典
    private func getAppConfigDictionary() -> [String: Any] {
        return Bundle.main.object(forInfoDictionaryKey: "APP_CONFIG") as? [String: Any] ?? [:]
    }

    // 唯一需要暴露给JS的方法：异步获取所有常量
    @objc
    func getConfig(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
        let constants = getAppConfigDictionary()
        resolve(constants)
    }

    // 必须实现的方法
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
