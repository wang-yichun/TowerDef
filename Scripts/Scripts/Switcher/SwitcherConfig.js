/**
 * Created by leadprogrammer on 14-7-28.
 */

var SwitcherConfig = {
    sceneInfo: null,
    init: function () {
//        this.sceneInfo = parseJson(RES_DATA_scene_info);
        this.sceneInfo = { // 场景信息
            'InnerGameScene': {
                'class': 'SceneCoreGame',
                'object': gSceneCoreGame,
                'layers': {
                    'group1': {
                        'InnerGameBoard': {
                            ccbi: RES_CCBI_Layer_InnerGameBoard,
                            in_timeline: { name: "LayerIn", time: 0.1 },
                            out_timeline: { name: null, time: 0.1 },
                            zorder: 50
                        }
                    },
                    'group2': {
                        'InnerGameMain': {
                            ccbi: RES_CCBI_Layer_InnerGameMain,
                            in_timeline: { name: null, time: 0.1 },
                            out_timeline: { name: null, time: 0.1 },
                            zorder: 20
                        }
                    }
                }
            },
            'SceneA': { // scene_info
                'class': 'SceneA',
                'object': gSceneA,
                'layers': {
                    'group1': { // group_info
                        'SAL1': { // layer_info
                            ccbi: RES_CCBI_Layer_SAL1,
                            in_timeline: { name: null, time: 0.4 },
                            out_timeline: { name: null, time: 0.4 },
                            zorder: 50
                        },
                        'SAL2': {
                            ccbi: RES_CCBI_Layer_SAL2,
                            in_timeline: { name: null, time: .4 },
                            out_timeline: { name: null, time: .4 },
                            zorder: 51
                        }
                    },
                    'group2': { // group_info
                        'SAL3': { // layer_info
                            ccbi: RES_CCBI_Layer_SAL3,
                            in_timeline: { name: 'LayerIn', time: 1 },
                            out_timeline: { name: 'LayerOut', time: 1 },
                            zorder: 50
                        },
                        'SAL4': {
                            ccbi: RES_CCBI_Layer_SAL4,
                            in_timeline: { name: 'LayerIn', time: 1 },
                            out_timeline: { name: 'LayerOut', time: 1 },
                            zorder: 50
                        }
                    },
                    'group3': {
                        'BG1': {
                            ccbi: RES_CCBI_Layer_Background,
                            in_timeline: { name: 'LayerIn', time: 1 },
                            out_timeline: { name: 'LayerOut', time: 1 },
                            zorder: 10
                        }
                    },
                    'group_bmob': {
                        'BmobTest': {
                            ccbi: RES_CCBI_Layer_BmobTest,
                            in_timeline: { name: null, time: .4 },
                            out_timeline: { name: null, time: .4 },
                            zorder: 50
                        }
                    },
                    'group_test': {
                        'DrawTest': {
                            ccbi: RES_CCBI_Layer_DrawTest,
                            in_timeline: { name: null, time: .1 },
                            out_timeline: { name: null, time: .1 },
                            zorder: 50
                        }
                    }
                }
            },
            'ScenePopup': {
                'class': 'ScenePopup',
                'object': gScenePopup,
                'layers': {
                    'group1': {
                        'Dialog': {
                            ccbi: RES_CCBI_Layer_Dialog,
                            in_timeline: {name: 'LayerIn', time: .2},
                            out_timeline: { name: 'LayerOut', time: .2},
                            zorder: 50
                        }
                    }
                }
            },
            'MyScene': {
                'class': 'MyScene',
                'object': gMyScene,
                'layers': {
                    'group1': {
                        'SAL1': {
                            ccbi: RES_CCBI_Layer_SAL1,
                            in_timeline: { name: 'LayerIn', time: 1 },
                            out_timeline: { name: 'LayerOut', time: 1 },
                            zorder: 50
                        },
                        'SAL2': {
                            ccbi: RES_CCBI_Layer_SAL2,
                            in_timeline: { name: 'LayerIn', time: 1 },
                            out_timeline: { name: 'LayerOut', time: 1 },
                            zorder: 50
                        }
                    },
                    'group2': {
                        'BG1': {
                            ccbi: RES_CCBI_Layer_Background,
                            in_timeline: { name: 'LayerIn', time: 1 },
                            out_timeline: { name: 'LayerOut', time: 1 },
                            zorder: 10
                        }
                    }
                }
            }
        }
    }
};