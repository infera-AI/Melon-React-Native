# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

#指定class模糊字典
-classobfuscationdictionary ./pro-android.txt
#指定package模糊字典
-packageobfuscationdictionary ./pro-android.txt
#指定外部模糊字典
-obfuscationdictionary ./pro-android.txt


#------基本指令区------
# 代码混淆压缩比，在0~7之间，默认为5，一般不做修改
-optimizationpasses 5
# 混合时不使用大小写混合，混合后的类名为小写
-dontusemixedcaseclassnames
# 指定不去忽略非公共库的类,是否混淆第三方jar
-dontskipnonpubliclibraryclasses
# 指定不去忽略非公共库的类成员
-dontskipnonpubliclibraryclassmembers
# 不做预校验，preverify是proguard的四个步骤之一，Android不需要preverify，去掉这一步能够加快混淆速度
-dontpreverify
# 混淆时是否记录日志,包含有类名->混淆后类名的映射关系
-verbose
#混淆映射文件输出
-printmapping proguardMapping.txt
#保留Annotation不混淆
-keepattributes *Annotation*,InnerClasses
# 避免混淆泛型
-keepattributes Signature
# 抛出异常时保留源文件名及行号
-keepattributes SourceFile,LineNumberTable
# 指定混淆是采用的算法，后面的参数是一个过滤器，这个过滤器是谷歌推荐的算法，一般不做更改
-optimizations !code/simplification/cast,!field/*,!class/merging/*

# ------默认保留区------
#保留我们使用的四大组件，自定义的Application等等这些类不被混淆
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.app.backup.BackupAgentHelper
-keep public class * extends android.preference.Preference
-keep public class * extends android.view.View
-keep public class com.android.vending.licensing.ILicensingService

# 保留support下的所有类及其内部类
-keep class android.support.** {*;}
# 保留继承support的
-keep public class * extends android.support.v4.**
-keep public class * extends android.support.v7.**
-keep public class * extends android.support.annotation.**
#Fragment不需要在AndroidManifest.xml中注册，需要额外保护下
-keep public class * extends android.support.v4.**
-keep public class * extends android.app.Fragment

#如果引用了v4或者v7包，可以忽略警告，因为用不到android.support
-dontwarn android.support.**

# 保持 native 方法不被混淆
-keepclasseswithmembernames class * {
    native <methods>;
}

# 保留在Activity中的方法参数是view的方法，这样以来我们在layout中写的onClick就不会被影响
-keepclassmembers class * extends android.app.Activity {
   public void *(android.view.View);
}

# 保留我们自定义控件（继承自View）不被混淆
-keep public class * extends android.view.View{
    *** get*();
    void set*(***);
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# 保持自定义控件类不被混淆
-keepclasseswithmembers class * {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# 保留Parcelable序列化类不被混淆
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

#保持 Serializable 不被混淆
-keepnames class * implements java.io.Serializable

# 保留Serializable序列化的类不被混淆
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

#保持枚举 enum 类不被混淆 如果混淆报错，建议直接使用上面的 -keepclassmembers class * implements java.io.Serializable即可
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

#保持实体类不被混淆
-keep class com.mys.example.common.entity.**{*;}

#过滤R文件的混淆：
-keep class **.R$* {
 *;
}

#------react native 基本框架避免混淆------

# google相关包
-dontwarn com.google.**
-keep class com.google.** { *; }
-dontwarn com.google.**
-keep class com.google.** { *; }

# react native相关包
-dontwarn com.facebook.**
-keep class com.facebook.** { *; }

# github相关包
-dontwarn com.github.**
-keep class com.github.** { *; }

#react-native-video 配置
-dontwarn com.brentvatne.react.**
-keep class com.brentvatne.react.** { *; }

# 自定义模块混淆规则
-keep class com.melon.HeadsetDetectionModule { *; }
-keep class com.melon.HeadsetDetectionPackage { *; }
-keep class com.melon.FileSaverModule { *; }
-keep class com.melon.FileSaverPackage { *; }

# FFmpeg Kit 相关规则
-dontwarn com.arthenica.ffmpegkit.**
-keep class com.arthenica.ffmpegkit.** { *; }
-keep class com.arthenica.mobileffmpeg.** { *; }

# React Native Sound 规则
-dontwarn com.zmxv.RNSound.**
-keep class com.zmxv.RNSound.** { *; }

# OkHttp 规则
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }
-dontwarn okio.**

# 蓝牙相关规则
-dontwarn android.bluetooth.**
-keep class android.bluetooth.** { *; }

# 音频相关规则
-dontwarn android.media.**
-keep class android.media.** { *; }