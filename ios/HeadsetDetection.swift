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
              let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else { return }

        let hasHeadphones = AVAudioSession.sharedInstance().currentRoute.outputs.contains {
            $0.portType == .headphones || $0.portType == .bluetoothA2DP || $0.portType == .bluetoothLE
        }

        if hasListeners {
            sendEvent(withName: "onHeadsetStateChanged", body: hasHeadphones)
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
