/**
 * Created by leadprogrammer on 14-8-2.
 */

var gInnerGameMain = null;
var Layer_InnerGameMain = cc.Layer.extend({
    // ccb Callback
    id: "InnerGameMain",

    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Layer);
        gInnerGameMain = this;
    },

    onDidLoadFromCCB: function () {
    },

    switchMenuItem: function () {
    },

    layerInCall: function () {
    },

    layerInStart: function () {
        cc.NotificationCenter.getInstance().addObserver(this, this.refreshGameStatus, 'refreshGameStatus');
        cc.NotificationCenter.getInstance().addObserver(this, this.refreshScore, 'refreshScore');
    },

    layerInEnd: function () {
    },

    layerOutCall: function () {
    },

    layerOutStart: function () {
    },

    layerOutEnd: function () {
        cc.NotificationCenter.getInstance().removeObserver(this, this.refreshGameStatus);
    },

    refreshGameStatus: function (para) {
        this['label_status'].setString(para);
    },

    current_score_show: 0,
    refreshScore: function (para) {
        this.rootNode.unschedule(gInnerGameMain.stepCountCurrentScore);
        this.rootNode.schedule(gInnerGameMain.stepCountCurrentScore, 0.05, cc.REPEAT_FOREVER, 0);
        this['label_current_score'].setString("本局得分: " + gInnerGameMain.current_score_show);
        this['label_last_turn_score'].setString("上轮: " + para.last_turn_score);
    },

    stepCountCurrentScore: function () {
        // this: [rootNode]
        var part_score;
        if (gInnerGameMain.current_score_show < Core.current_score) {
            part_score = Math.floor(Math.abs(gInnerGameMain.current_score_show - Core.current_score) / 10);
            if (gInnerGameMain.current_score_show + part_score < Core.current_score) {
                gInnerGameMain.current_score_show += part_score;
            }
            gInnerGameMain.current_score_show++;
        } else {
            part_score = Math.floor(Math.abs(gInnerGameMain.current_score_show - Core.current_score) / 5);
            if (Core.current_score + part_score < gInnerGameMain.current_score_show) {
                gInnerGameMain.current_score_show -= part_score;
            }
            gInnerGameMain.current_score_show--;
        }
        gInnerGameMain['label_current_score'].setString("本局得分: " + gInnerGameMain.current_score_show);

        if (C.current_score == C.history_score) {
            gInnerGameMain['label_history_score'].setString("历史: " + gInnerGameMain.current_score_show);
            gInnerGameMain['label_history_score'].setColor(cc.c3b(255, 100, 100));
        } else { // current_score < history_score
            gInnerGameMain['label_history_score'].setString("历史: " + C.history_score);
            gInnerGameMain['label_history_score'].setColor(cc.c3b(200, 200, 200));
        }

        if (gInnerGameMain.current_score_show == Core.current_score) {
            gInnerGameMain.rootNode.unschedule(gInnerGameMain.stepCountCurrentScore);
        }
    },

    btn_restart_clicked: function () {
        cc.log('btn_restart_clicked');
        C.clearMatch();
        C.startMatch();
    }
});