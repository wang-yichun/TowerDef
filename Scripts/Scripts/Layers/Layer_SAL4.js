/**
 * Created by leadprogrammer on 14-7-25.
 */

var Layer_SAL4 = cc.Layer.extend({
    // ccb Callback
    id: "SAL4",

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
        cc.log("sal4 switch btn");
        var para = {
            group_id: 'group2',
            layer_id: 'SAL3',
            out_delay_time: 0,
            in_delay_time: 0
        };
        Switcher.gotoLayer(para);
    }
});