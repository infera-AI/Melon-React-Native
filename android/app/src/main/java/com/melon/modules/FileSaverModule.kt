package com.melon.modules

import android.content.ContentValues
import android.provider.MediaStore
import android.os.Environment
import android.net.Uri
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.util.Log
import com.facebook.react.bridge.*
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.*
import java.io.IOException

class FileSaverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "FileSaver"

    private val client = OkHttpClient()

    @ReactMethod
    fun downloadFileToDownloadFolder(url: String, fileName: String, promise: Promise) {
        val downloadDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val targetFile = File(downloadDir, fileName)

        if (!downloadDir.exists()) {
            val created = downloadDir.mkdirs()
            if (!created) {
                promise.reject("DIR_CREATE_FAIL", "Download 目录创建失败")
                return
            }
        }

        val request = Request.Builder().url(url).build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                promise.reject("HTTP_ERROR", "下载失败，HTTP状态码: ${response.code}")
                return
            }

            try {
                val sink = FileOutputStream(targetFile)
                response.body?.byteStream()?.copyTo(sink)
                sink.close()

                promise.resolve(targetFile.absolutePath)
            } catch (e: Exception) {
                promise.reject("WRITE_ERROR", "写入失败: ${e.message}", e)
            }
        }
    }

    @ReactMethod
    fun saveFileToDownloadsUsingMediaStore(url: String, fileName: String, promise: Promise) {
        try {
            val resolver = reactApplicationContext.contentResolver
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, "application/octet-stream")
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }

            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                ?: run {
                    promise.reject("SAVE_FAILED", "无法创建文件Uri")
                    return
                }

            val request = Request.Builder().url(url).build()
            val response = OkHttpClient().newCall(request).execute()

            if (!response.isSuccessful) {
                promise.reject("HTTP_ERROR", "下载失败，HTTP状态码: ${response.code}")
                return
            }

            val outputStream = resolver.openOutputStream(uri)
                ?: run {
                    promise.reject("OPEN_STREAM_FAILED", "无法打开输出流")
                    return
                }

            response.body?.byteStream()?.use { input ->
                outputStream.use { output ->
                    input.copyTo(output)
                }
            }

            promise.resolve(uri.toString())
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

}
