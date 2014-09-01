/**
 * Created by leadprogrammer on 14-7-25.
 */

var Layer_SAL2 = cc.Layer.extend({
    // ccb Callback
    id: "SAL2",

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
        this['core_node'].setPosition(cc.p(-161, 369));
        this['core_node'].runAction(cc.EaseElasticOut.create(cc.MoveTo.create(.4, cc.p(161, 369)), 0.8));
    },

    layerInEnd: function () {
    },

    layerOutCall: function () {
    },

    layerOutStart: function () {
        this['core_node'].runAction(cc.EaseElasticIn.create(cc.MoveTo.create(.4, cc.p(494, 369)), 0.8));
    },

    layerOutEnd: function () {
    },

    switch_btn_clicked: function () {
        cc.log("sal2 switch btn");
        var para = {
            group_id: 'group1',
            layer_id: 'SAL1',
            out_delay_time: 0,
            in_delay_time: 0.4,
            ori_zorder: 50,
            dest_zorder: 60
        };
        Switcher.gotoLayer(para);
    }
});