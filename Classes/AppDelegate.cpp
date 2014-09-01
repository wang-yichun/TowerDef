#include "AppDelegate.h"

#include "vector"
using namespace std;

#include "cocos2d.h"
#include "SimpleAudioEngine.h"
#include "ScriptingCore.h"
#include "generated/jsb_cocos2dx_auto.hpp"
#include "generated/jsb_cocos2dx_extension_auto.hpp"
#include "generated/jsb_cocos2dx_studio_auto.hpp"
#include "jsb_cocos2dx_extension_manual.h"
#include "jsb_cocos2dx_studio_manual.h"
#include "cocos2d_specifics.hpp"
#include "js_bindings_chipmunk_registration.h"
#include "js_bindings_system_registration.h"
#include "js_bindings_ccbreader.h"
#include "jsb_opengl_registration.h"
#include "XMLHTTPRequest.h"
#include "jsb_websocket.h"
#include "jsb_soomla.h"

//#include "kompex_binding.hpp"

#include "JSBHelper.h"
#include "Bridge.h"

#include "TalkingData.h"

//
//#include "C2DXShareSDK.h"
//#include "ShareSDKBridge.h"
//
//#include "GameCenterBridge.h"

//using namespace cn;
//using namespace sharesdk;

USING_NS_CC;
using namespace CocosDenshion;


extern void register_JSBHelper_js(JSContext* cx, JSObject* global);

AppDelegate::AppDelegate()
{
}

AppDelegate::~AppDelegate()
{
    //GameCenterBridge::saveState();
    CCScriptEngineManager::purgeSharedManager();
}

bool AppDelegate::applicationDidFinishLaunching()
{
	CCLog("79. AppDelegate::applicationDidFinishLaunching");
    // initialize director
    CCDirector *pDirector = CCDirector::sharedDirector();
    pDirector->setOpenGLView(CCEGLView::sharedOpenGLView());
    
    CCSize screenSize = CCEGLView::sharedOpenGLView()->getFrameSize();
    CCSize designSize = CCSizeMake(320, 480);
    vector<string> searchPath = CCFileUtils::sharedFileUtils()->getSearchPaths();
    
    CCFileUtils::sharedFileUtils()->setSearchPaths(searchPath);
    
    CCLog("79.screenSize %f, %f", screenSize.width, screenSize.height);

    int target_limit = 2;

    int target_android = 0;
    
#ifdef TARGET_HD
    target_limit = 3;
#endif
    
#ifdef TARGET_NORMAL
    target_limit = 2;
#endif
    
#ifdef TARGET_SD
    target_limit = 1;
#endif
    
#ifdef TARGET_ANDROID
    target_android = 1;
#endif

if (target_android == 0) {
    if (screenSize.width > 1136 && target_limit >= 3) { // ipad retina / ipadmini retina
        CCLOG("// ipad retina / ipadmini retina");
        searchPath.push_back("Assets/HDR");
        pDirector->setContentScaleFactor(4.0);
        designSize = CCSizeMake(512, 386);
    } else if(screenSize.width > 1024 && screenSize.height <= 640 && target_limit >= 2) { // iphone5
        CCLOG("iphone5");
        searchPath.push_back("Assets/HD");
        pDirector->setContentScaleFactor(2.0);
        designSize = CCSizeMake(568, 320);
    } else if (screenSize.width > 960 && target_limit >= 2 && target_android != 1) { // ipad 1 / ipadmini
        CCLOG("ipad 1 / ipadmini");
        searchPath.push_back("Assets/HD");
        pDirector->setContentScaleFactor(2.0);
        designSize = CCSizeMake(512, 389);
    } else if (screenSize.width > 480 && target_limit >= 2) { // iphone4
        CCLOG("iphone4");
        searchPath.push_back("Assets/HD");
        pDirector->setContentScaleFactor(2.0);
        designSize = CCSizeMake(480, 320);
    } else { // iphone3
        CCLOG("iphone3");
        searchPath.push_back("Assets/SD");
        pDirector->setContentScaleFactor(1.0);
        designSize = CCSizeMake(480, 320);
    }
} else { // Android
    
    CCLOG("android designSize");
    
//    if(screenSize.width > 640 && target_limit >= 3) { // HDR
//        searchPath.push_back("Assets/HDR");
//        pDirector->setContentScaleFactor(4.0);
//        int y = 320 * screenSize.height / screenSize.width;
//        designSize = CCSizeMake(320, y);
//    } else {
        searchPath.push_back("Assets/HD");
        pDirector->setContentScaleFactor(2.0);
        int y = 320 * screenSize.height / screenSize.width;
        designSize = CCSizeMake(320, y);
//    }
}
//    if (screenSize.height > 1136){//iPad Retina
//        searchPath.push_back("Assets/HDR");
//        pDirector->setContentScaleFactor(4.0f);
//        designSize = CCSizeMake(320, 480);
//    }else if (screenSize.height > 960 && screenSize.height <= 1024){//iPad
//        searchPath.push_back("Assets/HD");
//        pDirector->setContentScaleFactor(2.0f);
//        designSize = CCSizeMake(320, 480);
//    }else if (screenSize.height > 480 && screenSize.height <= 1136){//iPhone Retina
//        searchPath.push_back("Assets/HD");
//        pDirector->setContentScaleFactor(2.0f);
//        if (screenSize.height > 960) {
//            designSize = CCSizeMake(320, 568);
//        }
//    }else{//iPhone
//        searchPath.push_back("Assets/SD");
//        pDirector->setContentScaleFactor(480.0f/designSize.height);
//    }
    
    CCEGLView::sharedOpenGLView()->setDesignResolutionSize(designSize.width, designSize.height, kResolutionShowAll);
    
    CCFileUtils::sharedFileUtils()->setSearchPaths(searchPath);
    
    // turn on display FPS
    pDirector->setDisplayStats(false);
    
    // set FPS. the default value is 1.0/60 if you don't call this
    pDirector->setAnimationInterval(1.0 / 60);
    
    ScriptingCore* sc = ScriptingCore::getInstance();
    sc->addRegisterCallback(register_all_cocos2dx);
    sc->addRegisterCallback(register_all_cocos2dx_extension);
    sc->addRegisterCallback(register_all_cocos2dx_extension_manual);
    sc->addRegisterCallback(register_cocos2dx_js_extensions);
    sc->addRegisterCallback(register_all_cocos2dx_studio);
    sc->addRegisterCallback(register_all_cocos2dx_studio_manual);
    sc->addRegisterCallback(register_CCBuilderReader);
    sc->addRegisterCallback(jsb_register_chipmunk);
    sc->addRegisterCallback(jsb_register_system);
    sc->addRegisterCallback(JSB_register_opengl);
    sc->addRegisterCallback(MinXmlHttpRequest::_js_register);
    sc->addRegisterCallback(register_jsb_websocket);
    sc->addRegisterCallback(register_jsb_soomla);
    
//    sc->addRegisterCallback(register_all_kompex_binding);
    
    sc->addRegisterCallback(register_JSBHelper_js);
    
    sc->start();
    
    CCScriptEngineProtocol *pEngine = ScriptingCore::getInstance();
    CCScriptEngineManager::sharedManager()->setScriptEngine(pEngine);
    
    ScriptingCore::getInstance()->runScript("Scripts/cocos2d-jsb.js");
    
    JSBHelper::AddSelector("helloCpp", callfuncND_selector(Bridge::helloCpp),new Bridge());
    
   // GameCenterBridge::loadState();
   // GameCenterBridge::authenticateLocalPlayer();
    
    // Game Analytics sdk
    TDCCTalkingDataGA::onStart("0AFFEEBD4D27BDE1D99F15903666DC8B", "IOS_TEST");
    TDCCAccount * account = TDCCAccount::setAccount(TDCCTalkingDataGA::getDeviceId());
    account->setAccountType(TDCCAccount::kAccountAnonymous);
    return true;
}

void AppDelegate::shareSDK_Initialize()
{
//    JSBHelper::AddSelector("authrize_shareSDK", callfuncND_selector(ShareSDKBridge::authorize), ShareSDKBridge::getInstance());
//    JSBHelper::AddSelector("shareContent_shareSDK", callfuncND_selector(ShareSDKBridge::shareContent), ShareSDKBridge::getInstance());
//
//    C2DXShareSDK::open(CCString::create("api20"), false);
//    CCDictionary *sinaConfigDict = CCDictionary::create();
//    sinaConfigDict -> setObject(CCString::create("2851680552"), "app_key");
//    sinaConfigDict -> setObject(CCString::create("d5f90e01ba493098a794e1dddaccd65d"), "app_secret");
//    sinaConfigDict -> setObject(CCString::create("http://www.sharesdk.cn"), "redirect_uri");
//    C2DXShareSDK::setPlatformConfig(C2DXPlatTypeSinaWeibo, sinaConfigDict);
}

// This function will be called when the app is inactive. When comes a phone call,it's be invoked too
void AppDelegate::applicationDidEnterBackground()
{
    CCDictionary* dic2 = new CCDictionary();
    dic2->setObject(CCString::create("I am message from CPP"), "message");
    SendMessageToJS("home_btn_pause_game", dic2);
    CCDirector::sharedDirector()->stopAnimation();
    SimpleAudioEngine::sharedEngine()->pauseBackgroundMusic();
    SimpleAudioEngine::sharedEngine()->pauseAllEffects();
}

// this function will be called when the app is active again
void AppDelegate::applicationWillEnterForeground()
{
    CCDirector::sharedDirector()->startAnimation();
    SimpleAudioEngine::sharedEngine()->resumeBackgroundMusic();
    SimpleAudioEngine::sharedEngine()->resumeAllEffects();
}
