/**
 * Created by leadprogrammer on 8/27/14.
 */
var gLayer_DrawTest = null;
var Layer_DrawTest = cc.Layer.extend({

    id: "DrawTest",

    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Layer);
        gLayer_DrawTest = this;
        C.initCore();
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
        this.rootNode.onTouchesMoved = function (touches, event) {
            this.controller.onTouchesMoved(touches, event);
            return true;
        };
    },

    switchMenuItem: function () {
    },

    layerInCall: function () {
        for (var i = 0; i < C.traverse_list_loc.length; i++) {
            C.createCellByLoc(C.traverse_list_loc[i]);
        }
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

    onTouchesBegan: function (touches, event) {
        this.calcMove(touches);
    },

    onTouchesMoved: function (touches, event) {
        this.calcMove(touches);
    },

    onTouchesEnded: function (touches, event) {
        this.calcMove(touches);
        this.calcStop();
    },

    // 暂存上次 touch 的 id
    touch_ids: null,

    // 传入 touches 与上次的 touch 相比，返回 true 表示完全相同
    sameTouchesId: function (touches) {
        if (this.touch_ids == null) return false;
        if (touches.length != this.touch_ids.length) return false;
        if (touches[0] != null && touches[0].getId() != this.touch_ids[0]) return false;
        if (touches[1] != null && touches[1].getId() != this.touch_ids[1]) return false;
        return true;
    },

    // 构造暂存 touch_ids
    makeTouchesMap: function (touches) {
        this.touch_ids = [];
        if (touches.length == 1) {
            this.touch_ids[0] = touches[0].getId();
        } else if (touches.length >= 2) {
            this.touch_ids[0] = touches[0].getId();
            this.touch_ids[1] = touches[1].getId();
        }
    },

    // 计算并执行本次操作的动作
    calcMove: function (touches) {
        var t0, t1, t2;
        var tp0, tp1, tp2;
        var delta;
        var diff_zoom_center;
        var touches_distance_current;
        var touches_distance_previous;
        var container_pos;
        var container_scale;
        if (this.sameTouchesId(touches)) {
            if (touches.length >= 2) {
                t0 = touches[0].getLocation();
                t1 = touches[1].getLocation();
                t2 = cc.pMidpoint(t0, t1);
                touches_distance_current = Math.sqrt(Math.pow(t1.x - t0.x, 2) + Math.pow(t1.y - t0.y, 2));
                tp0 = touches[0].getPreviousLocation();
                tp1 = touches[1].getPreviousLocation();
                tp2 = cc.pMidpoint(tp0, tp1);
                touches_distance_previous = Math.sqrt(Math.pow(tp1.x - tp0.x, 2) + Math.pow(tp1.y - tp0.y, 2));

                // 缩放变换
                container_scale = gLayer_DrawTest['zoom_container'].getScale();
                container_scale = container_scale * touches_distance_current / touches_distance_previous;
                gLayer_DrawTest['zoom_container'].setScale(container_scale);

                // 移动变换
                delta = cc.pSub(t2, tp2);
                delta = cc.pMult(delta, 1 / container_scale);// cc.p(delta.x / container_scale, delta.y / container_scale);
                container_pos = gLayer_DrawTest['move_container'].getPosition();
                container_pos = cc.pAdd(container_pos, delta);
                gLayer_DrawTest['move_container'].setPosition(container_pos);

                this.setRelateNode(t2);

            } else if (touches.length == 1) {
                t0 = touches[0].getLocation();
                tp0 = touches[0].getPreviousLocation();
                delta = cc.pSub(t0, tp0);
                container_scale = gLayer_DrawTest['zoom_container'].getScale();
                delta = cc.pMult(delta, 1 / container_scale);

                // 移动变换
                container_pos = gLayer_DrawTest['move_container'].getPosition();
                container_pos = cc.pAdd(container_pos, delta);
                gLayer_DrawTest['move_container'].setPosition(container_pos);

                this.setRelateNode(t0);
            }
        } else {
            this.makeTouchesMap(touches);
        }
    },

    // 设置 zoom_container 与 move_container 的相对位置关系
    setRelateNode: function (pos) {
        var diff_zoom_center = gLayer_DrawTest['static_container'].convertToNodeSpace(pos);
        cc.log('mid:' + JSON.stringify(diff_zoom_center));

        var static_container_pos = gLayer_DrawTest['static_container'].getPosition();
        var zoom_container_pos = gLayer_DrawTest['zoom_container'].getPosition();
        var diff_zoom = zoom_container_pos;
        zoom_container_pos = cc.pAdd(static_container_pos, diff_zoom_center);
        gLayer_DrawTest['zoom_container'].setPosition(zoom_container_pos);

        var container_scale = gLayer_DrawTest['zoom_container'].getScale();
        diff_zoom = cc.pSub(zoom_container_pos, diff_zoom);
        diff_zoom = cc.pMult(diff_zoom, 1 / container_scale);
        var move_container_pos = gLayer_DrawTest['move_container'].getPosition();
        move_container_pos = cc.pSub(move_container_pos, diff_zoom);
        gLayer_DrawTest['move_container'].setPosition(move_container_pos);
    },

    // 停止本次计算
    calcStop: function () {
        this.touch_ids = null;
    }

});