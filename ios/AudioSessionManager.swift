//
//  AudioSessionManager.swift
//  Melon
//
//  Created by 季弘扬 on 2025/7/31.
//
import Foundation
import AVFoundation
import React  // 解决找不到 RCTPromiseResolveBlock 的问题

@objc(AudioSessionManager)
class AudioSessionManager: NSObject {

  @objc
  func setAudioSessionCategory(
    _ category: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let session = AVAudioSession.sharedInstance()
    var avCategory: AVAudioSession.Category

    switch category.lowercased() {
    case "playback":
      avCategory = .playback
    case "record":
      avCategory = .record
    case "playandrecord":
      avCategory = .playAndRecord
    default:
      avCategory = .soloAmbient
    }

    do {
      try session.setCategory(avCategory)
      try session.setActive(true)
      resolve(true)
    } catch {
      reject("set_audio_error", error.localizedDescription, error)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
