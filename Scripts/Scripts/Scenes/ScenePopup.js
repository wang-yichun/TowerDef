/**
 * Created by leadprogrammer on 14-7-31.
 */

var gScenePopup = null;
var ScenePopup = cc.Scene.extend({
    layers: {},

    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Scene);
        gScenePopup = this;
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    }
});

Switcher.sceneMap["ScenePopup"] = ScenePopup;