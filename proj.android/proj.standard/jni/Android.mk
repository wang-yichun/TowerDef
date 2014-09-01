LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_SRC_FILES := hellojavascript/main.cpp \
                   ../../../Classes/AppDelegate.cpp \
                   ../../../Classes/Bridge.cpp \
                   ../../../Classes/JSBHelper/js_bindings_easyJSB.cpp \
                   ../../../Classes/JSBHelper/JSBHelper.cpp \
                   ../../../Classes/JSBHelper/JSBHelperCallbackNode.cpp \
                   ../../../Classes/NDKHelper/NDKCallbackNode.cpp \
                   ../../../Classes/NDKHelper/NDKHelper.cpp \
                   ../../../Classes/jsoncpp/src \
                   ../../../_PomeloLibrary/PlatformService/PlatformService/TalkingData/SDK/platform/android/TDCCAccount.cpp \
                   ../../../_PomeloLibrary/PlatformService/PlatformService/TalkingData/SDK/platform/android/TDCCItem.cpp \
                   ../../../_PomeloLibrary/PlatformService/PlatformService/TalkingData/SDK/platform/android/TDCCMIssion.cpp \
                   ../../../_PomeloLibrary/PlatformService/PlatformService/TalkingData/SDK/platform/android/TDCCTalkingDataGA.cpp \
                   ../../../_PomeloLibrary/PlatformService/PlatformService/TalkingData/SDK/platform/android/TDCCVirtualCurrency.cpp \
                   ../../../_PomeloLibrary/PlatformService/PlatformService/TalkingData/SDK/platform/android/TDGAJniHelper.cpp
                   

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../../Classes \
					$(LOCAL_PATH)/../../../Classes/jansson \
					$(LOCAL_PATH)/../../../Classes/jsoncpp/include \
					$(LOCAL_PATH)/../../../Classes/JSBHelper \
					$(LOCAL_PATH)/../../../Classes/NDKHelper \
					$(LOCAL_PATH)/../../../_PomeloLibrary/GameFoundation/CocosDenshion/include \
					$(LOCAL_PATH)/../../../_PomeloLibrary/PlatformService/PlatformService/TalkingData/SDK/include \
					$(LOCAL_PATH)/../../../_PomeloLibrary/PlatformService/PlatformService/TalkingData/SDK/platform/android

LOCAL_WHOLE_STATIC_LIBRARIES := cocos2dx_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocosdenshion_static
LOCAL_WHOLE_STATIC_LIBRARIES += chipmunk_static
LOCAL_WHOLE_STATIC_LIBRARIES += spidermonkey_static
LOCAL_WHOLE_STATIC_LIBRARIES += scriptingcore-spidermonkey
LOCAL_WHOLE_STATIC_LIBRARIES += cocos2dx_store_static
LOCAL_WHOLE_STATIC_LIBRARIES += cocos2dx-talkingdata


LOCAL_EXPORT_CFLAGS := -DCOCOS2D_DEBUG=2 -DCOCOS2D_JAVASCRIPT -DTARGET_ANDROID -DTARGET_NORMAL

include $(BUILD_SHARED_LIBRARY)

$(call import-module,cocos2dx)
$(call import-module,CocosDenshion/android)
$(call import-module,external/chipmunk)
$(call import-module,scripting/javascript/spidermonkey-android)
$(call import-module,scripting/javascript/bindings)
$(call import-module,extensions/cocos2dx-store/android/jni)