/**
 * Created by leadprogrammer on 14-7-25.
 */

var Layer_SAL3 = cc.Layer.extend({
    // ccb Callback
    id: "SAL3",

    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Layer);
    },

    onDidLoadFromCCB: function () {
    },

    switchMenuItem: function () {
        return [
            this["switch_btn"]
        ];
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
        cc.log("sal3 switch btn");

        var para = {
            group_id: 'group2',
            layer_id: 'SAL4',
            out_delay_time: 0,
            in_delay_time: 0
        };
        Switcher.gotoLayer(para);

        var para = {
            'scene_id': 'ScenePopup',  // 目标场景
            'groups': {             // 每个组的目标层
                'group1': 'Dialog'
            },
            'out_time': .2,
            'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
            'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
        };
        Switcher.popupScene(para);
    }
});