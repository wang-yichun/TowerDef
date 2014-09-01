/**
 * Created by leadprogrammer on 14-8-2.
 */

var gSceneCoreGame = null;
var SceneCoreGame = cc.Scene.extend({
    layers: {},

    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Scene);
        gSceneCoreGame = this;
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    }
});

Switcher.sceneMap["SceneCoreGame"] = SceneCoreGame;