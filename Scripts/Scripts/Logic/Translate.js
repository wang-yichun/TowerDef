/**
 * Created by leadprogrammer on 14-8-5.
 */
var Translate = {};

// 0:等待用户操作 1:消除中 2:下落中
Translate.gameStatusShow = function (game_status) {
    switch (game_status) {
        case 0:
            return '请选择一个格子';
        case 1:
            return '等一等';
        case 2:
            return '等一等';
        default:
            return ''
    }
};