//
//  AudioConcatModule.swift
//  Melon
//
//  Created by 季弘扬 on 2025/8/8.
//

import Foundation
import AVFoundation
import React

@objc(AudioConcatModule)
class AudioConcatModule: NSObject {

  @objc(concatAudios:outputPath:resolver:rejecter:)
  func concatAudios(audioPaths: [String], outputPath: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    print("开始拼接音频")
    print("输入音频路径：\(audioPaths)")
    print("输出路径：\(outputPath)")
    
    // 清洗路径去掉 file://
    let cleanedPaths = audioPaths.map { path in
        return path.replacingOccurrences(of: "file://", with: "")
    }
    
    // 路径合法性检查
    for path in cleanedPaths {
      if !FileManager.default.fileExists(atPath: path) {
        print("文件不存在：\(path)")
        rejecter("file_not_found", "音频文件不存在: \(path)", nil)
        return
      } else {
        print("文件存在：\(path)")
      }
    }
    
    let composition = AVMutableComposition()
    guard let compositionAudioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) else {
      rejecter("track_error", "Cannot create track", nil)
      return
    }

    var insertTime = CMTime.zero

    // 插入音频轨道
    for path in cleanedPaths {
      let asset = AVURLAsset(url: URL(fileURLWithPath: path))
      if let track = asset.tracks(withMediaType: .audio).first {
        do {
          let timeRange = CMTimeRange(start: .zero, duration: asset.duration)
          try compositionAudioTrack.insertTimeRange(timeRange, of: track, at: insertTime)
          insertTime = CMTimeAdd(insertTime, asset.duration)
        } catch {
          rejecter("insert_error", "Error inserting audio track: \(error.localizedDescription)", error)
          return
        }
      }
    }

    let exportSession = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetAppleM4A)!
    exportSession.outputURL = URL(fileURLWithPath: outputPath)
    exportSession.outputFileType = .m4a

    // 导出拼接后的音频
    exportSession.exportAsynchronously {
      switch exportSession.status {
      case .completed:
        print("音频拼接完成，输出路径：\(outputPath)")
        resolver(true)
      case .failed, .cancelled:
        print("导出失败：\(exportSession.error?.localizedDescription ?? "Unknown error")")
        rejecter("export_failed", exportSession.error?.localizedDescription ?? "Export failed", exportSession.error)
      default:
        break
      }
    }
  }
}
