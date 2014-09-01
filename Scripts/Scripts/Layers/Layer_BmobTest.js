/**
 * Created by leadprogrammer on 8/12/14.
 */

var Layer_BmobTest = cc.Layer.extend({
    // ccb Callback
    id: "BmobTest",
    label_content: null,

    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Layer);
    },

    onDidLoadFromCCB: function () {
    },

    switchMenuItem: function () {
        return null;
    },

    layerInCall: function () {
    },

    layerInStart: function () {
        this['core_node'].setPosition(cc.p(-188, 240));
        this['core_node'].runAction(cc.EaseElasticOut.create(cc.MoveTo.create(.4, cc.p(160, 240)), 0.8));
    },

    layerInEnd: function () {
        this.label_content.setString("Hello,\nBomb test!\n");

        JSBHelper.AddSelector("bmob_add_person_callback", this.bmob_add_person_callback);
        var para = {
            class_name: 'BmobManager',
            function_name: 'addPerson',
            callback_name: 'bmob_add_person_callback',
            para: {
                name: 'value001',
                address: '中国区 China'
            }
        };
        SendMessageToNative("nativeFunc", para);
    },

    layerOutCall: function () {
    },

    layerOutStart: function () {
        this['core_node'].runAction(cc.EaseElasticIn.create(cc.MoveTo.create(.4, cc.p(498, 240)), 0.8));
    },

    layerOutEnd: function () {
    },

    bmob_add_person_callback: function (parm) {
        cc.log("bmob_add_person_callback parm:" + JSON.stringify(parm));
    }
});