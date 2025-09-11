package com.melon

import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.Toast
import com.bytedance.tools.util.ToolsUtil
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if ((BuildConfig.APP_SIGN == "melon" || BuildConfig.APP_SIGN == "momor") && BuildConfig.DEBUG) { // 国内版使用穿山甲
            // RN 容器是 android.R.id.content
            val content = findViewById<ViewGroup>(android.R.id.content)

            val button = Button(this).apply {
                text = "测试工具"
                setBackgroundColor(Color.parseColor("blue"))
                setOnClickListener {
                    Toast.makeText(this@MainActivity, "点击了原生按钮", Toast.LENGTH_SHORT).show()
                    ToolsUtil.start(this@MainActivity);
                }
            }

            val params = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM or Gravity.END
            ).apply {
                marginEnd = 50
                bottomMargin = 260
            }

            content.addView(button, params)
        }
    }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Melon"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
