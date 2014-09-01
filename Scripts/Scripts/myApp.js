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

var gMyScene = null;
var MyScene = cc.Scene.extend({
    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Scene);
        gMyScene = this;
    },

    onEnter: function () {
        this._super();

//        var background = cc.BuilderReader.load(RES_CCBI_Layer_Background, this);

//        this.addChild(background);
        gMyScene.scheduleOnce(gMyScene.gotoScene, 1);
    },

    gotoScene: function () {
        var para = {
            'scene_id': 'SceneA',  // 目标场景
            'groups': {             // 每个组的目标层
                'group1': 'SAL1',
                'group3': 'BG1'
            },
            'layers_para': {
                'SAL1': {
                    zorder: 50
                },
                'BG1': {
                    zorder: 10
                }
            },
            'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.0]},
            'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
        };
        Switcher.gotoScene(para);
    }
});
