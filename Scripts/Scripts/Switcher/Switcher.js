/**
 * Created by leadprogrammer on 14-7-25.
 *
 *  Switcher v1.7
 *  wang-yichun
 *
 *  已完成:    场景跳转 | 同场多组 | 多组同跳 | 层序管理 | 进行中忽略 |
 *          动态时间轴 | 触发点回调 | 延时动画 | 场景过场 | 场景动画库 |
 *          弹出场景 | 日志系统 | 动态层序 | 命令反馈 | 前后id标记
 *
 *  未完成: 全局动画 | 场景信息传递 | 动作反馈 | 命令等待 | 定时命令 | TalkingData | 说明书
 *
 *  1.1 运行同一个场景内多个组的同时跳转
 *  1.2 如果两个层的跳转还未完成，那么一旦执行它们所参与的其它层跳转，那么就需要忽略后面一次的跳转任务
 *  1.3 记录 Layer Node 的前一个/后一个 LayerID，在 switcher_para, 因为有了这个，change layer 时可以更准确的调整currentSwitchingGroups
 *  1.4 弹出窗口 弹出 scene : *同样已经可以播放代码过场
 *  1.5 场景过场
 *  1.6 命令反馈: 一个命令是否成功执行 gotoScene 和 gotoLayer
 *  1.7 gotoLayer 可以移除层了, layer_id: null,
 *   todo: 1.6 场景动画（全局）
 *   todo: 1.7 动态层序
 *   todo: 1.8 信息传递
 */

var Switcher = {
    name: "My name is switcher.",
    sceneMap: {},

    /**
     * 日志系统
     */
// 1 警告
// 2 跳转信息 goto scene/layer
// 3 调试currentSwitchingGroups
// 4 调试checkSwitchingGroups
// 5 layer In/Out Call/Start/End
// 6 remove 层垃圾
// 7 debug
    logLevel: {1: true, 2: true, 3: true, 4: true, 5: false, 6: false, 7: true},
    log: function (level, s) {
        if (Switcher.logLevel[level]) {
//            cc.log("  Switcher log(" + level + "/" + JSON.stringify(Switcher.logLevel) + ") >> " + s);
            cc.log("  Switcher log(" + level + ") >> " + s);
        }
    },

    /**
     * 核心
     */

    sceneInfo: null,

    currentSceneID: null,   // 当前场景 id
    currentScene: null,     // 当前场景的 layer_node
    currentLayerIDs: null,  // key 为组id 的当前层 id
    currentSwitchingGroups: null, // 记录正在发生跳转的组
    animation_func: null, // 动画库

    // 是否有正在跳转的层
    isCurrentSwitchingGroupsHaveTrue: function () {
        if (Switcher.currentSwitchingGroups == null) {
            return false;
        } else {
            for (var group_id in Switcher.currentSwitchingGroups) {
                if (Switcher.currentSwitchingGroups[group_id]) {
                    return true;
                }
            }
        }
        return false;
    },

    initSwitcher: function () {
        SwitcherConfig.init();
        Switcher.sceneInfo = SwitcherConfig.sceneInfo;
        Switcher.animation_func = SwitcherAnimationFunc;
        Switcher.log(2, "initialize.");
        Switcher.currentSwitchingGroups = {};
        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));
    },

    //  通过层 id 获取当前场景的层 node
    getLayerNodeFromCurrentSceneByLayerID: function (layer_id) {
        return Switcher.currentScene.switcher_para.layers[layer_id];
    },


    // 切换场景
    // {
    //   'scene_id':'MyScene',  // 目标场景
    //   'groups':{             // 每个组的目标层
    //     'group1':'SAL1',
    //     'group2':'BG1'
    //   }
    //    'layers_para': {
    //        'SAL1': {
    //            zorder: 50
    //        },
    //        'BG1': {
    //            zorder: 10
    //        }
    //    },
    //   'out_animation':{func_name:'函数名',time:0.1},
    //   'in_animation':{func_name:'函数名',time:0.2}
    // }
    // return: 0 success , 1 same scene_id, 2 err scene_id, 3 err group_id, 4 err layer_id
    gotoScene: function (para) {
        var return_status = 0;
        var ori_scene_id = Switcher.currentSceneID;
        var dest_scene_id = para.scene_id;
        if (ori_scene_id == dest_scene_id) {
            Switcher.log(1, "same scene_id:" + ori_scene_id);
            return_status = 1;
            return return_status;
        }
        if (SwitcherConfig.sceneInfo[para.scene_id] == null) {
            Switcher.log(1, "err scene_id: (make sure SwitcherConfig.sceneInfo has this scene_id.");
            return_status = 2;
            return return_status;
        }
        if (ori_scene_id == null) {
            // 第一个场景
            Switcher.gotoScene_firstScene(para);
        } else {
            // 切换场景
            Switcher.gotoScene_changeScene(para);
        }
        return 0; // 假设切换场景里面不存在异常,
    },

    gotoScene_firstScene: function (para) {
        Switcher.log(2, "goto scene(first scene):" + para.scene_id);
        Switcher.currentSceneID = para.scene_id;
        Switcher.currentLayerIDs = para.groups;

        Switcher.replaceScene(para);
    },

    changeSceneInfo: {
        waitForChange: false, // 等待切换场景
        waitForPushdown: false, // 等待切换场景 pushdown使用
        changeScenePara: null, // 切换参数 (gotoScene的参数)
        waitLayerOutCount: 0 // 等待LayerOut层的个数
    },
    gotoScene_changeScene: function (para) {
        Switcher.log(2, "goto scene(change scene):" + Switcher.currentSceneID + "->" + para.scene_id);

        if (para.out_animation != null) {
            Switcher.animation_func[para.out_animation.func_name](para.out_animation.para);
        }

        Switcher.changeSceneInfo.waitLayerOutCount = 0;
        for (var e_group_id in Switcher.currentLayerIDs) {
            Switcher.currentSwitchingGroups[e_group_id] = true;
            Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));
            var ori_layer_id = Switcher.currentLayerIDs[e_group_id];
            var ori_layer = Switcher.currentScene.switcher_para.layers[ori_layer_id];
            if (ori_layer == null) {
                Switcher.log(1, "ori layer is null:" + ori_layer_id);
                continue;
            }
            ori_layer.controller.switcher_para.switching = true;
            if (ori_layer.controller.layerOutCall != null) {
                Switcher.log(5, "layerOutCall: " + ori_layer.controller.switcher_para.layer_id);
                ori_layer.controller.layerOutCall();
            }
            Switcher.changeSceneInfo.waitForChange = true;
            Switcher.changeSceneInfo.waitForPushdown = false;
            Switcher.changeSceneInfo.waitLayerOutCount++;
            ori_layer.unschedule(Switcher.layerOutStart);
            ori_layer.scheduleOnce(Switcher.layerOutStart, 0); // 保持一致性，这样在 layerOutStart 里面的 this 为layer_node
        }
        if (Switcher.changeSceneInfo.waitForChange == true) {
            Switcher.changeSceneInfo.changeScenePara = para;
        }
        Switcher.currentSceneID = para.scene_id;
        Switcher.currentLayerIDs = para.groups;
    },

    replaceScene: function (para) {
        Switcher.currentSwitchingGroups = {};
        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));

        Switcher.currentScene = new Switcher.sceneMap[Switcher.sceneInfo[Switcher.currentSceneID].class]();
//        Switcher.currentScene = new Switcher.sceneInfo[Switcher.currentSceneID].class();
        Switcher.currentScene.switcher_para = {};
        Switcher.currentScene.switcher_para.scene_id = Switcher.currentSceneID;
        Switcher.currentScene.switcher_para.next_scene_id = null;
        Switcher.currentScene.switcher_para.next_scene = null;
        Switcher.currentScene.switcher_para.prev_scene_id = null;
        Switcher.currentScene.switcher_para.prev_scene = null;
        Switcher.currentScene.switcher_para.waste_nodes = [];

        if (cc.Director.getInstance().getRunningScene()) {
            cc.Director.getInstance().replaceScene(Switcher.currentScene);
        } else {
            cc.Director.getInstance().runWithScene(Switcher.currentScene);
        }

        if (para.in_animation != null) {
            Switcher.animation_func[para.in_animation.func_name](para.in_animation.para);
        }

        Switcher.addLayersForScene(para);
    },

    // 弹出场景
    // {
    //   'scene_id':'MyScene',  // 目标场景
    //   'groups':{             // 每个组的目标层
    //     'group1':'Dialog',
    //   },
    //   'out_time': 0.1,       // 滞留时间，应大于 out_animation 的播放长度 *弹出场景并不播放下层场景的任何时间轴，此处时间预留给 out_animation 动画
    //   'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
    //   'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
    // }
    popupScene: function (para) {
        Switcher.log(2, "popup scene:" + Switcher.currentSceneID + "->" + para.scene_id);

        if (para.out_animation != null) {
            Switcher.animation_func[para.out_animation.func_name](para.out_animation.para);
        }

        Switcher.changeSceneInfo.waitForChange = false;
        Switcher.changeSceneInfo.waitForPushdown = false;
        Switcher.changeSceneInfo.changeScenePara = para;

        Switcher.currentScene.unschedule(Switcher.pushScene);
        Switcher.currentScene.scheduleOnce(Switcher.pushScene, para.out_time);
    },

    pushScene: function () {

        Switcher.removeWasteNode.call(Switcher.currentScene);

        var para = Switcher.changeSceneInfo.changeScenePara;

        Switcher.changeSceneInfo.waitForChange = false;
        Switcher.changeSceneInfo.waitForPushdown = false;
        Switcher.changeSceneInfo.changeScenePara = null;
        Switcher.changeSceneInfo.waitLayerOutCount = 0;

        var oldSceneLayersIDs = JSON.parse(JSON.stringify(Switcher.currentLayerIDs));
        var oldSceneCurrentSwitchingGroups = JSON.parse(JSON.stringify(Switcher.currentSwitchingGroups));

        Switcher.currentSwitchingGroups = {};
        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));
        Switcher.currentSceneID = para.scene_id;
        Switcher.currentLayerIDs = para.groups;

        var newScene = new Switcher.sceneInfo[Switcher.currentSceneID].class();
        var oldScene = Switcher.currentScene;

        // 老场景参数
        oldScene.switcher_para.next_scene_id = para.scene_id;
        oldScene.switcher_para.next_scene = newScene;

        // 新场景
        Switcher.currentScene = newScene;
        Switcher.currentScene.switcher_para = {};
        Switcher.currentScene.switcher_para.scene_id = para.scene_id;
        Switcher.currentScene.switcher_para.prev_scene_id = oldScene.switcher_para.scene_id;
        Switcher.currentScene.switcher_para.prev_scene = oldScene;
        Switcher.currentScene.switcher_para.prev_scene_layer_ids = oldSceneLayersIDs;
        Switcher.currentScene.switcher_para.prev_scene_switching_groups = oldSceneCurrentSwitchingGroups;
        Switcher.currentScene.switcher_para.next_scene_id = null;
        Switcher.currentScene.switcher_para.next_scene = null;
        Switcher.currentScene.switcher_para.waste_nodes = [];

        cc.Director.getInstance().pushScene(Switcher.currentScene);

        Switcher.addLayersForScene(para);
    },

//    var para = {
//        'out_animation': {func_name: 'scene_out_animation_blackfade', para: [0.1]},
//        'in_animation': {func_name: 'scene_in_animation_blackfade', para: [0.2]}
//    };
    pushdownScene: function (para) {
        Switcher.log(2, "pushdown scene:" + Switcher.currentSceneID + "->" + Switcher.currentScene.switcher_para.prev_scene_id);

        if (para.out_animation != null) {
            Switcher.animation_func[para.out_animation.func_name](para.out_animation.para);
        }

        Switcher.changeSceneInfo.waitLayerOutCount = 0;
        for (var e_group_id in Switcher.currentLayerIDs) {
            Switcher.currentSwitchingGroups[e_group_id] = true;
            Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));
            var ori_layer_id = Switcher.currentLayerIDs[e_group_id];
            var ori_layer = Switcher.currentScene.switcher_para.layers[ori_layer_id];
            if (ori_layer == null) {
                Switcher.log(1, "ori layer is null:" + ori_layer_id);
                continue;
            }

            Switcher.setLayerMenuItemEnabled(ori_layer, false);

            ori_layer.controller.switcher_para.switching = true;
            if (ori_layer.controller.layerOutCall != null) {
                Switcher.log(5, "layerOutCall: " + ori_layer.controller.switcher_para.layer_id);
                ori_layer.controller.layerOutCall();
            }
            Switcher.changeSceneInfo.waitForChange = false;
            Switcher.changeSceneInfo.waitForPushdown = true;
            Switcher.changeSceneInfo.waitLayerOutCount++;
            ori_layer.unschedule(Switcher.layerOutStart);
            ori_layer.scheduleOnce(Switcher.layerOutStart, 0); // 保持一致性，这样在 layerOutStart 里面的 this 为layer_node
        }
        if (Switcher.changeSceneInfo.waitForPushdown == true) {
            Switcher.changeSceneInfo.changeScenePara = para;
        }
//        Switcher.currentSceneID = para.scene_id;
//        Switcher.currentLayerIDs = para.groups;

        Switcher.currentSceneID = Switcher.currentScene.switcher_para.prev_scene_id;
        Switcher.currentLayerIDs = Switcher.currentScene.switcher_para.prev_scene_layer_ids;
        Switcher.currentSwitchingGroups = Switcher.currentScene.switcher_para.prev_scene_switching_groups;

        Switcher.currentScene = Switcher.currentScene.switcher_para.prev_scene;
    },

    popScene: function (para) {
//        Switcher.currentSwitchingGroups = {};
        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));

//        Switcher.currentSceneID = Switcher.currentScene.switcher_para.prev_scene_id;
//        Switcher.currentLayerIDs = Switcher.currentScene.switcher_para.prev_scene_layer_ids;
//        Switcher.currentScene = Switcher.currentScene.switcher_para.prev_scene;

        cc.Director.getInstance().popScene();

//        Switcher.removeWasteNode.call(Switcher.currentScene);

        if (para.in_animation != null) {
            Switcher.animation_func[para.in_animation.func_name](para.in_animation.para);
        }
    },

    removeWasteNode: function () {
        Switcher.log(6, "remove waste node: " + this.switcher_para.scene_id + " ...(" + this.switcher_para.waste_nodes.length + " removed)");
        var waste_nodes = this.switcher_para.waste_nodes;
        for (var i = 0; i < waste_nodes.length; i++) {
            var node = waste_nodes[i];
            node.removeFromParent();
        }
        this.switcher_para.waste_nodes = [];
    },

    addLayersForScene: function (para) {
        Switcher.currentScene.switcher_para.layers = {};
        var scene_info = Switcher.sceneInfo[Switcher.currentSceneID];

        for (var group_id in scene_info.layers) { // 该层拥有的所有组
            var group_info = scene_info.layers[group_id];

            var dest_layer_id = Switcher.currentLayerIDs[group_id]; // 改组的显示层

            for (var layer_id in group_info) {
                var layer_info = group_info[layer_id];
                var layer_node = cc.BuilderReader.load(layer_info.ccbi, Switcher.currentScene);
//                var layer_node = cc.BuilderReader.load(window[layer_info.ccbi], Switcher.currentScene);
                layer_node.controller.switcher_para = {};
                layer_node.controller.switcher_para.scene_id = Switcher.currentSceneID;
                layer_node.controller.switcher_para.group_id = group_id;
                layer_node.controller.switcher_para.layer_id = layer_id;
                layer_node.controller.switcher_para.prev_layer_id = null;
                layer_node.controller.switcher_para.next_layer_id = null;
                layer_node.controller.switcher_para.switching = false;

                if (layer_id == dest_layer_id) {
                    Switcher.currentSwitchingGroups[group_id] = true;
                    Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));
                    layer_node.controller.switcher_para.switching = true;
                    if (layer_node.controller.layerInCall != null) {
                        Switcher.log(5, "layerInCall: " + layer_node.controller.switcher_para.layer_id);
                        layer_node.controller.layerInCall();
                    }
                    layer_node.unschedule(Switcher.layerInStart);
                    layer_node.scheduleOnce(Switcher.layerInStart, 0);
                }
                layer_node.setVisible(false);

                var zorder = layer_info.zorder;
                if (para.layers_para != null) {
                    if (para.layers_para[layer_id] != null) {
                        if (para.layers_para[layer_id].zorder != null) {
                            zorder = para.layers_para[layer_id].zorder;
                        }
                    }
                }
                layer_node.setZOrder(zorder);

                Switcher.setLayerMenuItemEnabled(layer_node, false);
                Switcher.currentScene.switcher_para.layers[layer_id] = layer_node;
                Switcher.currentScene.addChild(layer_node);
            }
        }
    },

    // 同场景切换层
    // {
    //   group_id: 'group1'
    //   layer_id: 'SAL1'
    //   out_delay_time: 0,
    //   in_delay_time: 0,
    //   ori_zorder: 50,
    //   dest_zorder: 60
    // }
    // return: 0 success , 1 same scene_id, 2 err scene_id, 3 err group_id, 4 err layer_id, 5 same layer_id, 6 group is switching, 7 ori layer_id is null
    gotoLayer: function (para) {
        var return_status = 0;
        var current_scene_info = SwitcherConfig.sceneInfo[Switcher.currentSceneID];
        if (current_scene_info.layers[para.group_id] == null) {
            Switcher.log(1, "no group_id in current scene_info: (current scene_id:" +
                Switcher.currentSceneID + ", dest group_id:" + para.group_id);
            return_status = 3;
            return return_status;
        }

        if (para.layer_id == null) {
            return_status = Switcher.gotoLayer_lastLayer(para);
            return return_status;
        }

        if (current_scene_info.layers[para.group_id][para.layer_id] == null) {
            Switcher.log(1, "no layer_id in current scene_info.group: (current scene_id:" +
                Switcher.currentSceneID + ", current group_id:" + para.group_id + ", dest layer_id:" + para.layer_id);
            return_status = 4;
            return return_status;
        }

        if (Switcher.currentLayerIDs[para.group_id] == null) {
            return_status = Switcher.gotoLayer_firstLayer(para);
        } else {
            if (Switcher.currentLayerIDs[para.group_id] == para.layer_id) {
                Switcher.log(1, "same layer_id:" + para.layer_id);
                return;
            }
            return_status = Switcher.gotoLayer_changeLayer(para);
        }
        return return_status;
    },

    gotoLayer_lastLayer: function (para) {
        var return_status = 0;
        if (Switcher.currentLayerIDs[para.group_id] == null){
            return_status = 7; // 7 ori layer_id is null
            return return_status;
        }
        Switcher.log(2, "goto layer(last layer):" + para.group_id + "|" + Switcher.currentLayerIDs[para.group_id] + "-> null");

        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));
        if (Switcher.currentSwitchingGroups != null && Switcher.currentSwitchingGroups[para.group_id] == true) {
            Switcher.log(1, "group is switching:" + para.group_id + ", " + JSON.stringify(Switcher.currentSwitchingGroups));
            return 6;
        }
        var ori_layer_id = Switcher.currentLayerIDs[para.group_id];
        var ori_layer_node = Switcher.currentScene.switcher_para.layers[ori_layer_id];
        if (para.ori_zorder != null) {
            ori_layer_node.setZOrder(para.ori_zorder);
        }
        Switcher.currentLayerIDs[para.group_id] = null;
        Switcher.setLayerMenuItemEnabled(ori_layer_node, false);
        Switcher.currentSwitchingGroups[para.group_id] = true;
        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));
        ori_layer_node.controller.switcher_para.next_layer_id = null;
        ori_layer_node.controller.switcher_para.switching = true;

        if (ori_layer_node.controller.layerOutCall != null) {
            Switcher.log(5, "layerOutCall: " + ori_layer_node.controller.switcher_para.layer_id);
            ori_layer_node.controller.layerOutCall();
        }
        ori_layer_node.unschedule(Switcher.layerOutStart);
        ori_layer_node.scheduleOnce(Switcher.layerOutStart, para.out_delay_time ? para.out_delay_time : 0);

        return return_status;
    },

    gotoLayer_firstLayer: function (para) {
        Switcher.log(2, "goto layer(first layer):" + para.group_id + "|" + para.layer_id);

        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));
        if (Switcher.currentSwitchingGroups != null && Switcher.currentSwitchingGroups[para.group_id] == true) {
            Switcher.log(1, "group is switching:" + para.group_id + ", " + JSON.stringify(Switcher.currentSwitchingGroups));
            return 6;
        }

        Switcher.currentSwitchingGroups[para.group_id] = true;
        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));

        var layer_node = Switcher.currentScene.switcher_para.layers[para.layer_id];
        Switcher.currentLayerIDs[para.group_id] = para.layer_id;

        layer_node.controller.switcher_para.switching = true;
        layer_node.controller.switcher_para.next_layer_id = null;

        if (para.dest_zorder != null) {
            layer_node.setZOrder(para.dest_zorder);
        }

        if (layer_node.controller.layerInCall != null) {
            Switcher.log(5, "layerInCall: " + layer_node.controller.switcher_para.layer_id);
            layer_node.controller.layerInCall();
        }

        layer_node.unschedule(Switcher.layerInStart);
        layer_node.scheduleOnce(Switcher.layerInStart, para.in_delay_time ? para.in_delay_time : 0);

        return 0;
    },

    gotoLayer_changeLayer: function (para) {
        Switcher.log(2, "goto layer(change layer):" + para.group_id + "|" + Switcher.currentLayerIDs[para.group_id] + "->" + para.layer_id);

        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));
        if (Switcher.currentSwitchingGroups != null && Switcher.currentSwitchingGroups[para.group_id] == true) {
            Switcher.log(1, "group is switching:" + para.group_id + ", " + JSON.stringify(Switcher.currentSwitchingGroups));
            return 6;
        }

        var ori_layer_id = Switcher.currentLayerIDs[para.group_id];
        var ori_layer_node = Switcher.currentScene.switcher_para.layers[ori_layer_id];
        var dest_layer_id = para.layer_id;
        var dest_layer_node = Switcher.currentScene.switcher_para.layers[dest_layer_id];

        if (para.ori_zorder != null) {
            ori_layer_node.setZOrder(para.ori_zorder);
        }
        if (para.dest_zorder != null) {
            dest_layer_node.setZOrder(para.dest_zorder);
        }

        if (ori_layer_id == dest_layer_id) {
            Switcher.log(1, "same layer_id:" + ori_layer_id);
            return 5;
        }

        Switcher.currentLayerIDs[para.group_id] = para.layer_id;

        Switcher.setLayerMenuItemEnabled(ori_layer_node, false);

        Switcher.currentSwitchingGroups[para.group_id] = true;
        Switcher.log(3, JSON.stringify(Switcher.currentSwitchingGroups));

        ori_layer_node.controller.switcher_para.next_layer_id = dest_layer_id;
        dest_layer_node.controller.switcher_para.prev_layer_id = ori_layer_id;

        ori_layer_node.controller.switcher_para.switching = true;
        dest_layer_node.controller.switcher_para.switching = true;

        if (ori_layer_node.controller.layerOutCall != null) {
            Switcher.log(5, "layerOutCall: " + ori_layer_node.controller.switcher_para.layer_id);
            ori_layer_node.controller.layerOutCall();
        }
        if (dest_layer_node.controller.layerInCall != null) {
            Switcher.log(5, "layerInCall: " + dest_layer_node.controller.switcher_para.layer_id);
            dest_layer_node.controller.layerInCall();
        }

        ori_layer_node.unschedule(Switcher.layerOutStart);
        ori_layer_node.scheduleOnce(Switcher.layerOutStart, para.out_delay_time ? para.out_delay_time : 0);

        dest_layer_node.unschedule(Switcher.layerInStart);
        dest_layer_node.scheduleOnce(Switcher.layerInStart, para.in_delay_time ? para.in_delay_time : 0);
    },

    layerInStart: function () { // 此处的this是 layer_node
        if (this.controller.layerInStart != null) {
            Switcher.log(5, "layerInStart: " + this.controller.switcher_para.layer_id);
            this.controller.layerInStart();
        }
        var scene_info = Switcher.sceneInfo[this.controller.switcher_para.scene_id];
        var group_info = scene_info.layers[this.controller.switcher_para.group_id];
        var layer_info = group_info[this.controller.switcher_para.layer_id];
        this.setVisible(true);

        var in_end_delay_time = 0;
        if (layer_info.in_timeline != null) {
            if (layer_info.in_timeline.name != null) {
                this.animationManager.runAnimationsForSequenceNamed(layer_info.in_timeline.name);
            }
            if (layer_info.in_timeline.time != null) {
                in_end_delay_time = layer_info.in_timeline.time;
            }
        }

        this.unschedule(Switcher.layerInEnd);
        this.scheduleOnce(Switcher.layerInEnd, in_end_delay_time);
    },

    layerInEnd: function () {
        if (this.controller.layerInEnd != null) {
            Switcher.log(5, "layerInEnd: " + this.controller.switcher_para.layer_id);
            this.controller.layerInEnd();
        }

        Switcher.setLayerMenuItemEnabled(this, true);

        this.controller.switcher_para.switching = false;

        Switcher.checkSwitchingGroups_AfterIn.call(this);
    },

    layerOutStart: function () {
        if (this.controller.layerOutStart != null) {
            Switcher.log(5, "layerOutStart: " + this.controller.switcher_para.layer_id);
            this.controller.layerOutStart();
        }

        var scene_info = Switcher.sceneInfo[this.controller.switcher_para.scene_id];
        var group_info = scene_info.layers[this.controller.switcher_para.group_id];
        var layer_info = group_info[this.controller.switcher_para.layer_id];

        var in_end_delay_time = 0;
        if (layer_info.out_timeline != null) {
            if (layer_info.out_timeline.name != null) {
                this.animationManager.runAnimationsForSequenceNamed(layer_info.out_timeline.name);
            }
            if (layer_info.out_timeline.time != null) {
                in_end_delay_time = layer_info.out_timeline.time;
            }
        }

        this.unschedule(Switcher.layerOutEnd);
        this.scheduleOnce(Switcher.layerOutEnd, in_end_delay_time);
    },

    layerOutEnd: function () {
        if (this.controller.layerOutEnd != null) {
            Switcher.log(5, "layerOutEnd: " + this.controller.switcher_para.layer_id);
            this.controller.layerOutEnd();
        }

        this.controller.switcher_para.switching = false;

        this.setVisible(false);

        Switcher.checkSwitchingGroups_AfterOut.call(this);

        Switcher.checkChangeScene();
    },

    checkChangeScene: function () {
        if (Switcher.changeSceneInfo.waitForChange == true) {
            Switcher.changeSceneInfo.waitLayerOutCount--;
            if (Switcher.changeSceneInfo.waitLayerOutCount == 0) {

                Switcher.replaceScene(Switcher.changeSceneInfo.changeScenePara);

                Switcher.changeSceneInfo.waitForChange = false;
                Switcher.changeSceneInfo.changeScenePara = null;
                Switcher.changeSceneInfo.waitLayerOutCount = 0;
            }
        } else if (Switcher.changeSceneInfo.waitForPushdown == true) {
            Switcher.changeSceneInfo.waitLayerOutCount--;
            if (Switcher.changeSceneInfo.waitLayerOutCount == 0) {

                Switcher.popScene(Switcher.changeSceneInfo.changeScenePara);

                Switcher.changeSceneInfo.waitForPushdown = false;
                Switcher.changeSceneInfo.changeScenePara = null;
                Switcher.changeSceneInfo.waitLayerOutCount = 0;
            }
        }
    },

    checkSwitchingGroups_AfterIn: function () {
        var prev_layer_id = this.controller.switcher_para.prev_layer_id;
        if (prev_layer_id == null) {
            Switcher.currentSwitchingGroups[this.controller.switcher_para.group_id] = false;
            Switcher.log(4, "checkSwitchingGroups_AfterOut other null:" + JSON.stringify(Switcher.currentSwitchingGroups));
        } else {
            var layer_node = Switcher.getLayerNodeFromCurrentSceneByLayerID(prev_layer_id);
            if (layer_node.controller.switcher_para.switching == false) {
                Switcher.currentSwitchingGroups[this.controller.switcher_para.group_id] = false;
                Switcher.log(4, "checkSwitchingGroups_AfterIn change:" + JSON.stringify(Switcher.currentSwitchingGroups));
            } else {
                Switcher.log(4, "checkSwitchingGroups_AfterIn no change:" + JSON.stringify(Switcher.currentSwitchingGroups));
            }
        }
        if (Switcher.isCurrentSwitchingGroupsHaveTrue() == false) {
            Switcher.log(2, "goto scene/layer finished:" + Switcher.currentSceneID + ":" + JSON.stringify(Switcher.currentLayerIDs));
            Switcher.removeWasteNode.call(Switcher.currentScene);
        }
    },

    checkSwitchingGroups_AfterOut: function () {
        var next_layer_id = this.controller.switcher_para.next_layer_id;
        if (next_layer_id == null) {
            Switcher.currentSwitchingGroups[this.controller.switcher_para.group_id] = false;
            Switcher.log(4, "checkSwitchingGroups_AfterOut other null:" + JSON.stringify(Switcher.currentSwitchingGroups));
        } else {
            var layer_node = Switcher.getLayerNodeFromCurrentSceneByLayerID(next_layer_id);
            if (layer_node.controller.switcher_para.switching == false) {
                Switcher.currentSwitchingGroups[this.controller.switcher_para.group_id] = false;
                Switcher.log(4, "checkSwitchingGroups_AfterOut change:" + JSON.stringify(Switcher.currentSwitchingGroups));
            } else {
                Switcher.log(4, "checkSwitchingGroups_AfterOut no change:" + JSON.stringify(Switcher.currentSwitchingGroups));
            }
        }
        if (Switcher.isCurrentSwitchingGroupsHaveTrue() == false) {
            Switcher.log(2, "goto scene/layer finished:" + Switcher.currentSceneID + ":" + JSON.stringify(Switcher.currentLayerIDs));
            Switcher.removeWasteNode.call(Switcher.currentScene);
        }
    },

    setLayerMenuItemEnabled: function (layer_node, value) {
        if (layer_node.controller.switchMenuItem == null) return;
        var item_list = layer_node.controller.switchMenuItem();
        if (item_list != null) {
            for (var i = 0; i < item_list.length; i++) {
                item_list[i].setEnabled(value);
            }
        }
    }
};