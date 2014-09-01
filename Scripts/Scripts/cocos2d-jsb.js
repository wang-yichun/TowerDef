/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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

// boot code needed for cocos2d + JS bindings.
// Not needed by cocos2d-html5

require("jsb.js");
require("Scripts/AppFiles.js");

cc.dumpConfig();

for (var i = 0; i < appFiles.length; i++) {
    require(appFiles[i]);
}

var director = cc.Director.getInstance();
director.setDisplayStats(false);

// set FPS. the default value is 1.0/60 if you don't call this
director.setAnimationInterval(1.0 / 60);

// Switcher init.
Switcher.initSwitcher();
//
//var para = {
//    'scene_id': 'SceneA',  // 目标场景
//    'groups': {             // 每个组的目标层
//        'group_bmob': 'BmobTest'
//    },
//    'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
//    'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
//};
//var para = {
//    'scene_id': 'InnerGameScene',  // 目标场景
//    'groups': {             // 每个组的目标层
//        'group1': 'InnerGameBoard',
//        'group2': 'InnerGameMain'
//    },
//    'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
//    'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.1]}
//};
//var para = {
//    'scene_id': 'SceneA',  // 目标场景
//    'groups': {             // 每个组的目标层
//        'group1': 'SAL1',
//        'group3': 'BG1'
//    },
//    'layers_para': {
//        'SAL1': {
//            zorder: 50
//        },
//        'BG1': {
//            zorder: 10
//        }
//    },
//    'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
//    'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
//};
var para = {
    'scene_id': 'SceneA',  // 目标场景
    'groups': {             // 每个组的目标层
        'group_test': 'DrawTest'
    },
    'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
    'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
};
Switcher.gotoScene(para);

//// run
//var runningScene = director.getRunningScene();
//if (runningScene === null)
//    director.runWithScene(myScene);
//else
//    director.replaceScene(myScene);
