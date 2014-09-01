/**
 * Created by leadprogrammer on 14-7-31.
 */

var Layer_Dialog = cc.Layer.extend({
    // ccb Callback
    id: "Dialog",

    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Layer);
    },

    onDidLoadFromCCB: function () {
    },

    switchMenuItem: function () {
    },

    layerInCall: function () {
    },

    layerInStart: function () {
    },

    layerInEnd: function () {
    },

    layerOutCall: function () {
    },

    layerOutStart: function () {
    },

    layerOutEnd: function () {
    },

    switch_btn_clicked: function () {
        cc.log("sal1 switch btn");
        var para = {
            'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
            'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
        };
        Switcher.pushdownScene(para);
    }
});
