/**
 * Created by leadprogrammer on 14-8-2.
 */
var gInnerGameBoard = null;
var Layer_InnerGameBoard = cc.Layer.extend({
    // ccb Callback
    id: "InnerGameBoard",
    cell_container: null, // cell 容器

    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Layer);
        gInnerGameBoard = this;
    },

    onDidLoadFromCCB: function () {
        this.rootNode.setTouchEnabled(true);
        this.rootNode.onTouchesBegan = function (touches, event) {
            this.controller.onTouchesBegan(touches, event);
            return true;
        };
        this.rootNode.onTouchesEnded = function (touches, event) {
            this.controller.onTouchesEnded(touches, event);
            return true;
        };
    },

    switchMenuItem: function () {
    },

    layerInCall: function () {
    },

    layerInStart: function () {
    },

    layerInEnd: function () {
        C.startMatch();
    },

    layerOutCall: function () {
    },

    layerOutStart: function () {
    },

    layerOutEnd: function () {
    },

    onTouchesBegan: function (touches, event) {
        cc.log("onTouchesBegan");
        for (var tid = 0; tid < touches.length; tid++) {
            var touch = touches[tid];
            var p0 = gInnerGameBoard.cell_container.convertTouchToNodeSpace(touch);
            var loc = C.pos2loc(p0);
        }
    },

    onTouchesEnded: function (touches, event) {
        cc.log("onTouchesEnded");
        for (var tid = 0; tid < touches.length; tid++) {
            var touch = touches[tid];
            var p0 = gInnerGameBoard.cell_container.convertTouchToNodeSpace(touch);
            var loc = C.pos2loc(p0);

            C.clickOneCellToRemove(loc);
        }
    }
});