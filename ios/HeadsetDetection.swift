//
//  HeadsetDetection.swift
//  Melon
//
//  Created by 季弘扬 on 2025/8/1.
//

import Foundation
import AVFoundation
import React

@objc(HeadsetDetection)
class HeadsetDetection: RCTEventEmitter {
    private var hasListeners = false

    override init() {
        super.init()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(audioRouteChanged),
            name: AVAudioSession.routeChangeNotification,
            object: nil
        )
    }

    override func supportedEvents() -> [String]! {
        return ["onHeadsetStateChanged"]
    }

    @objc func startListening() {
        // no-op, just to align with Android API
    }

    @objc func stopListening() {
        // no-op
    }

    @objc func audioRouteChanged(notification: Notification) {
        guard let reasonValue = notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let _ = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else { return }

        // 延迟判断，避免误判耳机状态
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            let hasHeadphones = AVAudioSession.sharedInstance().currentRoute.outputs.contains {
                $0.portType == .headphones ||
                $0.portType == .bluetoothA2DP ||
                $0.portType == .bluetoothLE ||
                $0.portType == .bluetoothHFP
            }

            if self.hasListeners {
                self.sendEvent(withName: "onHeadsetStateChanged", body: hasHeadphones)
            }
        }
    }

    override func startObserving() {
        hasListeners = true
    }

    override func stopObserving() {
        hasListeners = false
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
