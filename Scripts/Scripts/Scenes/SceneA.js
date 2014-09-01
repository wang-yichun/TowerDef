/**
 * Created by leadprogrammer on 14-7-25.
 */

var gSceneA = null;
var SceneA = cc.Scene.extend({
    layers: {},

    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Scene);
        gSceneA = this;
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    }
});

Switcher.sceneMap["SceneA"] = SceneA;