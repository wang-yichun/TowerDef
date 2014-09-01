/**
 * Created by leadprogrammer on 14-8-4.
 */

var SwitcherAnimationFunc = {
    scene_in_animation_blackfade: function (para) {
        var winSize = cc.Director.getInstance().getWinSize();
        var mask_layer = cc.LayerColor.create(cc.c4b(0, 0, 0, 255), winSize.width, winSize.height + 40);
        Switcher.currentScene.addChild(mask_layer, 100);
        Switcher.currentScene.switcher_para.waste_nodes.push(mask_layer);
        mask_layer.setOpacity(255);
        var fade_out = cc.FadeOut.create(para[0]);
        mask_layer.runAction(fade_out);

        var ori_position = cc.POINT_ZERO;

        Switcher.currentScene.setPositionY(ori_position.y - 20);
        Switcher.currentScene.runAction(cc.EaseOut.create(cc.MoveTo.create(para[0] / 2, ori_position), 4));
    },

    scene_out_animation_blackfade: function (para) {
        var winSize = cc.Director.getInstance().getWinSize();
        var mask_layer = cc.LayerColor.create(cc.c4b(0, 0, 0, 255), winSize.width, winSize.height + 40);
        Switcher.currentScene.addChild(mask_layer, 100);
        Switcher.currentScene.switcher_para.waste_nodes.push(mask_layer);
        mask_layer.setOpacity(0);
        var fade_in = cc.FadeIn.create(para[0]);
        mask_layer.runAction(fade_in);

        var ori_position = Switcher.currentScene.getPosition();
//            Switcher.currentScene.setPositionY(ori_position.y - 20);
        Switcher.currentScene.runAction(cc.EaseOut.create(cc.MoveTo.create(para[0] / 2, cc.p(ori_position.x, ori_position.y - 10)), 4));
    }
};