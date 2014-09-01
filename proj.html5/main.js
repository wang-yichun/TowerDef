/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org


 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var cocos2dApp = cc.Application.extend({
    config: document['ccConfig'],
    ctor: function (scene) {
        this._super();
        this.startScene = scene;
        cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
        cc.initDebugSetting();
        cc.setup(this.config['tag']);
        cc.AppController.shareAppController().didFinishLaunchingWithOptions();
    },
    applicationDidFinishLaunching: function () {
        if (cc.RenderDoesnotSupport()) {
            //show Information to user
            alert("Browser doesn't support WebGL");
            return false;
        }
        // initialize director
        var director = cc.Director.getInstance();

        cc.EGLView.getInstance()._adjustSizeToBrowser();
        var screenSize = cc.EGLView.getInstance().getFrameSize();
        var designSize = cc.size(480, 320);
        var searchPaths = [];


        if (screenSize.width > 1136) { // ipad retina / ipadmini retina
            cc.log("// ipad retina / ipadmini retina");
            searchPaths.push("Assets/HDR");
            director.setContentScaleFactor(4.0);
            designSize = cc.size(512, 320);
        } else if (screenSize.width > 1024) { // iphone5
            cc.log("iphone5");
            searchPaths.push("Assets/HDR");
            director.setContentScaleFactor(4.0);
            var designSize = cc.size(568, 320);
        } else if (screenSize.width > 960) { // ipad 1 / ipadmini
            cc.log("ipad 1 / ipadmini");
            searchPaths.push("Assets/HD");
            director.setContentScaleFactor(2.0);
            designSize = cc.size(512, 389);
        } else if (screenSize.width > 480) { // iphone4
            cc.log("iphone4");
            searchPaths.push("Assets/HD");
            director.setContentScaleFactor(2.0);
            var designSize = cc.size(480, 320);
        } else { // iphone3
            cc.log("iphone3");
            searchPaths.push("Assets/SD");
            director.setContentScaleFactor(1.0);
            var designSize = cc.size(480, 320);
        }

//        if (screenSize.height > 480) {
//            searchPaths.push("Assets/HD");
//            director.setContentScaleFactor(2.0);
//            if (screenSize.height > 960) {
//                designSize = cc.size(320, 568);
//            }
//        } else {
//            searchPaths.push("Assets/SD");
//            director.setContentScaleFactor(480.0 / designSize.height);
//        }


        cc.EGLView.getInstance().setDesignResolutionSize(designSize.width, designSize.height, cc.RESOLUTION_POLICY.SHOW_ALL);
        cc.FileUtils.getInstance().setSearchPaths(searchPaths);


        // turn on display FPS
        director.setDisplayStats(this.config['showFPS']);

        // set FPS. the default value is 1.0/60 if you don't call this
        director.setAnimationInterval(1.0 / this.config['frameRate']);

        //load resources
        Switcher.initSwitcher();

        cc.LoaderScene.preload(g_resources, function () {

            cc.SpriteFrameCache.getInstance().addSpriteFrames(RES_TEX_PLIST_InnerGame);

//            director.replaceScene(new this.startScene());

//            var para = {
//                'scene_id': 'SceneA',  // 目标场景
//                'groups': {             // 每个组的目标层
//                    'group_bmob': 'BmobTest'
//                },
//                'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
//                'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
//            };

//            var para = {
//                'scene_id': 'InnerGameScene',  // 目标场景
//                'groups': {             // 每个组的目标层
//                    'group1': 'InnerGameBoard',
//                    'group2': 'InnerGameMain'
//                },
//                'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
//                'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.1]}
//            };

            var para = {
                'scene_id': 'SceneA',  // 目标场景
                'groups': {             // 每个组的目标层
                    'group_test': 'DrawTest'
                },
                'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
                'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
            };
            Switcher.gotoScene(para);

//            Switcher.gotoSceneLayer("MyScene", "group2", "BG1", 0, 0);
        }, this);

        return true;
    }
});
//var myApp = new cocos2dApp(CoreScene);
var myApp = new cocos2dApp(MyScene);
