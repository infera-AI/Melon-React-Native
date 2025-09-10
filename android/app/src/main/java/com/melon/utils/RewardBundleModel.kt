package com.melon.utils

import android.os.Bundle
import android.util.Log

/**
 * 穿山甲奖励信息解析模型（官方文档推荐）
 * 用于解析 onRewardArrived 回调中 extraInfo 的奖励参数
 */
class RewardBundleModel(private val extraInfo: Bundle) {
    companion object {
        private const val TAG = "RewardBundleModel"
        // 官方定义的 extraInfo Key（文档明确）
        const val KEY_ERROR_CODE = "reward_extra_key_error_code"
        const val KEY_ERROR_MSG = "reward_extra_key_error_msg"
        const val KEY_REWARD_NAME = "reward_extra_key_reward_name"
        const val KEY_REWARD_AMOUNT = "reward_extra_key_reward_amount"
        const val KEY_REWARD_PROPOSE = "reward_extra_key_reward_propose" // 进阶奖励建议百分比
    }

    /**
     * 获取奖励错误码
     */
    fun getServerErrorCode(): Int = extraInfo.getInt(KEY_ERROR_CODE, -1)

    /**
     * 获取奖励错误信息
     */
    fun getServerErrorMsg(): String = extraInfo.getString(KEY_ERROR_MSG, "未知错误") ?: "未知错误"

    /**
     * 获取奖励名称（如“金币”）
     */
    fun getRewardName(): String = extraInfo.getString(KEY_REWARD_NAME, "未知奖励") ?: "未知奖励"

    /**
     * 获取奖励数量（如100）
     */
    fun getRewardAmount(): Int {
        return try {
            extraInfo.getString(KEY_REWARD_AMOUNT, "0")?.toInt() ?: 0
        } catch (e: NumberFormatException) {
            Log.e(TAG, "解析奖励数量失败", e)
            0
        }
    }

    /**
     * 获取进阶奖励建议百分比（仅进阶奖励生效）
     */
    fun getRewardPropose(): Int = extraInfo.getInt(KEY_REWARD_PROPOSE, 100) // 默认100%
}