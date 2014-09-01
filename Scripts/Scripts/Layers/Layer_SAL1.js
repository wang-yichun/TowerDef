/**
 * Created by leadprogrammer on 14-7-25.
 */

var Layer_SAL1 = cc.Layer.extend({
    // ccb Callback
    id: "SAL1",

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

        var text = cc.FileUtils.getInstance().getStringFromFile(RES_DATA_Untitled);
        var jsonText = JSON.parse(text);
        cc.log(JSON.stringify(jsonText));
    },

    layerInStart: function () {
        this['core_node'].setPosition(cc.p(-161, 369));
        this['core_node'].runAction(cc.EaseElasticOut.create(cc.MoveTo.create(.4, cc.p(161, 369)), 0.8));
    },

    layerInEnd: function () {
        var node_cell = cc.BuilderReader.load(DefCell['cell1'].ccbi);
        node_cell.animationManager.runAnimationsForSequenceNamed("Default Timeline");
        this['core_node'].addChild(node_cell, 200);

        var act_vec = [];
        var move1 = cc.MoveBy.create(1, cc.p(50, 0));
        act_vec.push(move1);
        var move2 = cc.MoveBy.create(2, cc.p(-100, 0));
        act_vec.push(move2);
        var move3 = cc.MoveBy.create(1, cc.p(50, 0));
        act_vec.push(move3);


        var sequence = fix.Sequence.create(act_vec);
//        var sequence = cc.Sequence.create(act_vec[0]);
//        for (var i = 1; i < act_vec.length; i++) {
//            sequence = cc.Sequence.create(sequence, act_vec[i]);
//        }

        node_cell.runAction(sequence);
    },

    layerOutCall: function () {
    },

    layerOutStart: function () {
        this['core_node'].runAction(cc.EaseElasticIn.create(cc.MoveTo.create(.4, cc.p(494, 369)), 0.8));
    },

    layerOutEnd: function () {
    },

    switch_btn_clicked: function () {
        cc.log("sal1 switch btn");
        var para = {
            group_id: 'group1',
            layer_id: 'SAL2',
            out_delay_time: 0,
            in_delay_time: 0.4,
            ori_zorder: 50,
            dest_zorder: 60
        };
        Switcher.gotoLayer(para);
//
//        var para2 = {
//            group_id: 'group2',
//            layer_id: 'SAL3',
//            out_delay_time: 0,
//            in_delay_time: 0.8
//        };
//        Switcher.gotoLayer(para2);

//        var para = {
//            'scene_id': 'MyScene',  // 目标场景
//            'groups': {             // 每个组的目标层
//                'group1': 'SAL1',
//                'group2': 'BG1'
//            },
//            'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
//            'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
//        };
//        Switcher.gotoScene(para);
    }
});