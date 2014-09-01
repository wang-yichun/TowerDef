/**
 * Created by meyougamesp2 on 14-3-3.
 */

var Layer_Background = cc.Layer.extend({
    // ccb Callback

    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.Layer );
    },

    onDidLoadFromCCB:function() {
//        this.rootNode.animationManager.runAnimationsForSequenceNamed("Layerloop");
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
    }
});