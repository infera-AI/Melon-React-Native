//
//  RNApplePay.swift
//  Melon
//
//  Created by 季弘扬 on 2025/11/2.
//

import Foundation
import StoreKit
import React

@objc(RNApplePay)
class RNApplePay: NSObject, RCTBridgeModule {
    static func moduleName() -> String! {
        return "RNApplePay"
    }

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    private var resolveBlock: RCTPromiseResolveBlock?
    private var rejectBlock: RCTPromiseRejectBlock?
    private var currentProductId: String?
    
    override init() {
        super.init()
        SKPaymentQueue.default().add(self)
    }

    deinit {
        SKPaymentQueue.default().remove(self)
    }

    // MARK: - canMakePayments
    @objc
    func canMakePayments(_ callback: @escaping RCTResponseSenderBlock) {
        let can = SKPaymentQueue.canMakePayments()
        callback([can])
    }

    // MARK: - requestPayment（与 JS 一致）
    @objc(requestPayment:resolver:rejecter:)
    func requestPayment(_ paymentData: [String: Any],
                        resolver resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        self.resolveBlock = resolve
        self.rejectBlock = reject

        guard let productId = paymentData["productId"] as? String else {
            reject("INVALID_PARAM", "缺少商品ID", nil)
            return
        }

        self.currentProductId = productId

        // 请求商品信息
        let request = SKProductsRequest(productIdentifiers: [productId])
        request.delegate = self
        request.start()
    }
}

// MARK: - SKProductsRequestDelegate
extension RNApplePay: SKProductsRequestDelegate {
    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        guard let product = response.products.first else {
            rejectBlock?("IAP_PRODUCT_NOT_FOUND", "未找到商品", nil)
            return
        }

        // 发起购买
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }

    func request(_ request: SKRequest, didFailWithError error: Error) {
        rejectBlock?("IAP_REQUEST_FAILED", error.localizedDescription, error)
    }
}

// MARK: - SKPaymentTransactionObserver
extension RNApplePay: SKPaymentTransactionObserver {
    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                if let receiptURL = Bundle.main.appStoreReceiptURL,
                   let receiptData = try? Data(contentsOf: receiptURL) {
                    let receipt = receiptData.base64EncodedString()
                    resolveBlock?(["success": true, "receipt": receipt])
                } else {
                    rejectBlock?("IAP_NO_RECEIPT", "找不到收据", nil)
                }
                SKPaymentQueue.default().finishTransaction(transaction)

            case .failed:
                let errMsg = transaction.error?.localizedDescription ?? "购买失败"
                rejectBlock?("IAP_FAILED", errMsg, transaction.error)
                SKPaymentQueue.default().finishTransaction(transaction)

            case .restored:
                SKPaymentQueue.default().finishTransaction(transaction)

            default:
                break
            }
        }
    }
}

