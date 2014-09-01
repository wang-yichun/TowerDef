/**
 * Created by leadprogrammer on 14-8-4.
 */

var Core = {
    nx: 11, // 格子数量 x 轴 (最长的)
    ny: 19, // 格子数量 y 轴
    t: null, // 周期内格数
    n: null, // 格子总数
    gridx: 27, // 格子宽度
    gridy: 15, // 格子高度
    boardx: null, // 总宽度
    boardy: null, // 总高度
    diffx: null, // 偏移 x 轴 : 格子(0,0)点与 layer(0,0)点的距离
    diffy: null, // 偏移 y 轴 : 格子(0,0)点与 layer(0,0)点的距离
    traverseLocVec: null,
    traverseLocVec_ReverseX: null,
    traverseLocVec_BothX: null,
    cellMap: null,
    current_score: null,
    history_score: null,

    initCore: function () {
        this.t = this.nx * 2 - 1;
        this.n = this.nx * this.ny - Math.floor(this.ny / 2);
        this.boardx = this.nx * this.gridx;
        this.boardy = this.ny * this.gridy;
        this.diffx = -this.boardx / 2 + this.gridx / 2;
        this.diffy = -this.boardy / 2 + this.gridy / 2;

        this.traverseLocVec = [];
        this.traverseLocVec_ReverseX = [];
        this.traverseLocVec_BothX = [];
        for (var y = 0; y < this.ny; y++) {
            for (var x = 0; x < this.nx * 2; x++) {
                var loc = cc.p(x, y);
                if (this.isCorrectLoc(loc)) {
                    this.traverseLocVec.push(loc);
                    this.traverseLocVec_BothX.push(loc);
                }
            }
            for (var x = this.nx * 2 - 1; x >= 0; x--) {
                var loc = cc.p(x, y);
                if (this.isCorrectLoc(loc)) {
                    this.traverseLocVec_ReverseX.push(loc);
                    this.traverseLocVec_BothX.push(loc);
                }
            }
        }

        Core.cellMap = {};
    },

    isCorrectLoc: function (loc) {
        if ((loc.x + loc.y) % 2 == 0) {
            return !(loc.x == 2 * Core.nx - 1);
        }
        return false;
    },

    isInBounds: function (loc) {
        if (loc.x < 0) return false;
        else if (loc.x >= 2 * Core.nx - 1) return false;
        else if (loc.y < 0) return false;
        else if (loc.y >= Core.ny) return false;
        return true;
    },

    getMoveDuration: function (loc0, loc1) {
        var factor = 0.005;
        var distance_x = Core.gridx * (loc1.x - loc0.x);
        var distance_y = Core.gridy * (loc1.y - loc0.y);
        return Math.sqrt(distance_x * distance_x + distance_y * distance_y) * factor;
    },

    idx2loc: function (idx) {
        var loc = cc.p(0, 0);
        if (idx % Core.t >= Core.nx) { // 周期上排
            loc.x = (idx % Core.t - Core.nx) * 2 + 1;
            loc.y = Math.floor(idx / Core.t) * 2 + 1;
        } else { // 周期下排
            loc.x = (idx % Core.t) * 2;
            loc.y = Math.floor(idx / Core.t) * 2
        }
        return loc;
    },

    idx2pos: function (idx) {
        if (idx == null) return null;
        return Core.loc2pos(Core.idx2loc(idx));
    },

    loc2idx: function (loc) {
        if (loc == null) return null;
        return Core.nx * loc.y + Math.floor(loc.x / 2) - Math.floor(loc.y / 2);
    },

    loc2pos: function (loc) {
        if (loc == null) return null;
        return cc.p(loc.x * Core.gridx / 2 + Core.diffx, loc.y * Core.gridy + Core.diffy);
    },

    pos2loc: function (pos) {
        if (pos == null) return null;
        var px = pos.x - Core.diffx + Core.gridx / 2;
        var py = pos.y - Core.diffy + Core.gridy / 2;
        var y = Math.floor(py / Core.gridy);
        var x;
        if (y % 2 == 0) {
            x = Math.floor(px / Core.gridx) * 2;
        } else {
            x = Math.floor((px - Core.gridx / 2) / Core.gridx) * 2 + 1;
        }
        return cc.p(x, y);
    },

    pos2idx: function (pos) {
        if (pos == null) return null;
        return Core.loc2idx(Core.pos2loc(pos));
    },

    // direct: 'TL','TR','CL','CR','BL','BR','B
    getAdjacent: function (ori_idx, direct) {
        var dest_idx = null;
        var dest_loc = Core.idx2loc(ori_idx);
        switch (direct) {
            case 'TL':
                dest_idx = ori_idx + Core.nx - 1;
                dest_loc.x -= 1;
                dest_loc.y += 1;
                break;
            case 'TR':
                dest_idx = ori_idx + Core.nx;
                dest_loc.x += 1;
                dest_loc.y += 1;
                break;
            case 'CL':
                dest_idx = ori_idx - 1;
                dest_loc.x -= 2;
                break;
            case 'CR':
                dest_idx = ori_idx + 1;
                dest_loc.x += 2;
                break;
            case 'BL':
                dest_idx = ori_idx - Core.nx;
                dest_loc.x -= 1;
                dest_loc.y -= 1;
                break;
            case 'BR':
                dest_idx = ori_idx - Core.nx + 1;
                dest_loc.x += 1;
                dest_loc.y -= 1;
                break;
            case 'B':
                dest_idx = ori_idx - Core.nx * 2 + 1;
                dest_loc.y -= 2;
                break;
            default:
                dest_idx = ori_idx;
        }

        if (C.isInBounds(dest_loc) == false) {
            return {idx: null, loc: null};
        }

        return {idx: dest_idx, loc: dest_loc};
    },

    // 得到相邻的同 code 的 idx 列表
    getAdjacentCellIdxInSameCode: function (ori_idx) {
        var current_uuid = uuid(64, 62);
        var cell_item = Core.cellMap[ori_idx];
        if (cell_item == null) return null;
        var primary_code = Core.cellMap[ori_idx].code;

        var vec1 = [];
        var vec2 = [];
        vec1.push(ori_idx);
        C.cellMap[ori_idx].uuid = current_uuid;
        var findTurn = 0;

        while (vec1.length > 0) {
            findTurn++;
            var idx = vec1.shift();
            vec2.push(idx);
            C.cellMap[idx].find_turn = findTurn;

            var direction_list = ['TL', 'TR', 'CL', 'CR', 'BL', 'BR'];
            for (var n = 0; n < direction_list.length; n++) {
                var adj_idx = Core.getAdjacent(idx, direction_list[n]).idx;
                if (adj_idx != null) {
                    var cell_item = C.cellMap[adj_idx];
                    if (cell_item != null) {
                        if (cell_item.code == primary_code) {
                            if (cell_item.uuid != current_uuid) {
                                vec1.push(adj_idx);
                                C.cellMap[adj_idx].uuid = current_uuid;
                            }
                        }
                    }
                }
            }
        }

        return vec2;
    },

    current_game_status: 0, // 0:等待用户操作 1:消除中 2:下落中
    setCurrentGameStatus: function (value) {
        C.current_game_status = value;
        cc.NotificationCenter.getInstance().postNotification("refreshGameStatus", Translate.gameStatusShow(value));
    },

    startMatch: function () {
        Core.cellMap = {};
        var ids = ['cell0', 'cell1', 'cell2', 'cell3'];
        for (var i = 0; i < C.traverseLocVec.length; i++) {
            var loc = C.traverseLocVec[i];
            C.createCellByLoc(loc, ids[Math.floor(Math.random() * 4)]);
        }
        C.setCurrentGameStatus(0);
        C.clearCurrentScore();
        C.history_score = sys.localStorage.getItem('history_score') | 0;
    },

    clearMatch: function () {
        gInnerGameBoard.cell_container.removeAllChildren();
        Core.cellMap = {};
        C.setCurrentGameStatus(0);
        C.need_wait_drop_amount = 0;
        C.need_wait_remove_amount = 0;
    },

    createCellByLoc: function (loc, code) {
        var idx = C.loc2idx(loc);
        var pos1 = C.loc2pos(loc);
        var node_cell = cc.BuilderReader.load(DefCell[code].ccbi);
        node_cell.animationManager.runAnimationsForSequenceNamed("Default Timeline");
        node_cell.setPosition(pos1);
//        var info_text = "(" + loc.x + "," + loc.y + ")";
//        var info_text = idx;
        var info_text = "";
        node_cell.controller['info'].setString(info_text);
        node_cell.controller['info'].setScale(0.6);
        gInnerGameBoard.cell_container.addChild(node_cell);

        C.cellMap[idx] = {
            loc: loc,
            node: node_cell,
            code: code,
            status: 0 // 0 静止, 1 消失中, 2 下落中
        };
    },

    removeCellByLoc: function (loc) {
        var idx = C.loc2idx(loc);
        if (C.cellMap[idx] == null) return;
        var cell_item = C.cellMap[idx];
        C.cellMap[idx] = null;
        cell_item.node.removeFromParent();
    },

    clickOneCellToRemove: function (loc) {
        if (C.current_game_status != 0) {
            cc.NotificationCenter.getInstance().postNotification("refreshGameStatus", "你必须等待下落结束才能开始再次消除");
            return;
        }
        var idx = C.loc2idx(loc);
        if (C.isCorrectLoc(loc) && C.isInBounds(loc)) {
            var adj_idxs = C.getAdjacentCellIdxInSameCode(idx); // 获得的相关的格子
            if (adj_idxs != null) {
                if (adj_idxs.length >= 3) {
                    // 得分
                    var turn_score = Math.pow(adj_idxs.length, 2);
                    Core.addCurrentScore(turn_score);
                    C.setCurrentGameStatus(1);
                    for (var i = 0; i < adj_idxs.length; i++) {
                        var adj_loc = C.idx2loc(adj_idxs[i]);
                        C.removeCellByLocWithAction(adj_loc, C.cellMap[adj_idxs[i]].find_turn / 20);
                    }
                } else {
                    cc.NotificationCenter.getInstance().postNotification("refreshGameStatus", "请选择3个及3个以上同色相连的格子");
                }
            }
        }
    },

    clearCurrentScore: function () {
        C.current_score = 0;
        cc.NotificationCenter.getInstance().postNotification(
            "refreshScore",
            {current_score: C.current_score, last_turn_score: 0, history_score: C.history_score}
        );
    },

    addCurrentScore: function (add_score) {
        C.current_score += add_score;
        if (C.current_score > C.history_score) {
            C.history_score = C.current_score;
            sys.localStorage.setItem('history_score', C.history_score);
        }

        cc.NotificationCenter.getInstance().postNotification(
            "refreshScore",
            {current_score: C.current_score, last_turn_score: add_score, history_score: C.history_score}
        );
    },

    need_wait_remove_amount: 0,
    removeCellByLocWithAction: function (loc, delay) {
        var idx = C.loc2idx(loc);
        if (C.cellMap[idx] == null) return;
        var cell_item = C.cellMap[idx];
        cell_item.status = 1;
        C.need_wait_remove_amount++;

        var actDelay = cc.DelayTime.create(delay);
        var fade = cc.FadeTo.create(0.3, 0);
        var scale = cc.ScaleTo.create(0.3, 2);
        var spawn = cc.Spawn.create(fade, scale);
        var func = cc.CallFunc.create(C.removeCellByLocWithActionEnd, cell_item.node, loc);
        var sequence = cc.Sequence.create(actDelay, spawn, func);
        cell_item.node.controller['main_sprite'].runAction(sequence);
    },

    removeCellByLocWithActionEnd: function (node, para) {
        var idx = C.loc2idx(para);
        if (C.cellMap[idx] == null) return;
        var cell_item = C.cellMap[idx];
        C.cellMap[idx] = null;
        cell_item.node.removeFromParent();
        C.need_wait_remove_amount--;

        if (C.need_wait_remove_amount == 0) {
            C.setCurrentGameStatus(2);
            Core.dropCellFullMap();
        }
    },

    need_wait_drop_amount: 0,
    dropCellFullMap: function () {
        var drop_list = Core.getDropList();
//        cc.log("drop_list: " + JSON.stringify(drop_list));
        if (drop_list.length == 0) C.setCurrentGameStatus(0);
        for (var i = 0; i < drop_list.length; i++) { // 需要下落的一个块
            var loc_list = drop_list[i];
            var cell_item = null;
            var act_move_list = [];
            for (var j = 0; j < loc_list.length; j++) {
                var loc = loc_list[j];
                var idx = Core.loc2idx(loc);
                var pos = Core.loc2pos(loc);
                if (j == 0) { // 第一
                    cell_item = Core.cellMap[idx];
                    Core.cellMap[idx] = null;
                } else if (j == loc_list.length - 1) { // 最后
                    var duration = Core.getMoveDuration(loc_list[j - 1], loc_list[j]);
                    act_move_list.push(cc.EaseElasticOut.create(cc.MoveTo.create(duration, pos), 2));
                    cell_item.loc = loc;
                    Core.cellMap[idx] = cell_item;
                } else { // 中间
                    var duration = Core.getMoveDuration(loc_list[j - 1], loc_list[j]);
                    act_move_list.push(cc.EaseElasticOut.create(cc.MoveTo.create(duration, pos), 2));
                }
            }
            var act_delay = cc.DelayTime.create(i * 0.02);
            var func = cc.CallFunc.create(C.dropCellFullMapEnd, cell_item.node, cell_item.loc);
            var zoom_small = cc.ScaleTo.create(0.1, 0.9);
            var zoom_large = cc.ScaleTo.create(0.1, 1.2);
            var zoom_normal = cc.ScaleTo.create(0.1, 1.0);
            var act_move_end_zoom = cc.Sequence.create(zoom_large, zoom_normal);

            act_move_list.unshift(zoom_small);
            act_move_list.unshift(act_delay);
//            act_move_list.push(zoom_large);
            act_move_list.push(act_move_end_zoom);
            act_move_list.push(func);

            var sequence = fix.Sequence.create(act_move_list);

            cell_item.status = 2;
            C.need_wait_drop_amount++;
            cell_item.node.runAction(sequence);
        }
    },

    dropCellFullMapEnd: function (node, para) {
        var idx = C.loc2idx(para);
        if (C.cellMap[idx] == null) return;
        var cell_item = C.cellMap[idx];
        cell_item.status = 0;
        C.need_wait_drop_amount--;

        if (C.need_wait_drop_amount == 0) {
            // todo:
            cc.log("dropCellFullMapEnd..........");
            C.setCurrentGameStatus(0);
        }
    },

    // [[cc.p(x0,y0), cc.p(x1,y1), cc.p(x1,y1)],[cc.p(x0,y0), cc.p(x1,y1), cc.p(x1,y1)]]
    getDropList: function () {
        // 复制 map
        var tempCellMap = {};
        for (var cell_idx in C.cellMap) {
            tempCellMap[cell_idx] = C.cellMap[cell_idx];
        }

        var outer_pos_list = [];
        for (var i = 0; i < C.traverseLocVec_BothX.length; i++) {
            var loc = C.traverseLocVec_BothX[i];
            var idx = C.loc2idx(loc);
            if (tempCellMap[idx] == null) continue;

            var inner_pos_list = [];
            inner_pos_list.push(loc);

            // 找下方位置
            var idx0 = idx;

            var last_direct = null;

            do {
                var prev_idx0 = idx0;
                var loc0 = C.idx2loc(idx0);
                var inBoundsNullMap = C.getAdjacentInBoundsNullAround(idx0, tempCellMap);
                var wentTo = 'C';
                if (inBoundsNullMap['BL'] && inBoundsNullMap['BR'] && inBoundsNullMap['B']) {
                    wentTo = 'B';
                } else if (inBoundsNullMap['BL'] && inBoundsNullMap['BR'] && !inBoundsNullMap['B']) {
                    var list = ['BL1', 'BR1'];
                    wentTo = list[Math.floor(Math.random() * 2)];
                } else if (!inBoundsNullMap['BL'] && !inBoundsNullMap['BR']) {
                    wentTo = 'C';
                } else if (inBoundsNullMap['BL'] && !inBoundsNullMap['BR']) {
                    if (inBoundsNullMap['CL']) { // 左空
                        wentTo = 'BL2';
//                        wentTo = 'C';
                    } else {
                        wentTo = 'C';
                    }
                } else if (!inBoundsNullMap['BL'] && inBoundsNullMap['BR']) {
                    if (inBoundsNullMap['CR']) { // 右空
                        wentTo = 'BR2';
//                        wentTo = 'C';
                    } else {
                        wentTo = 'C';
                    }
                }

                switch (wentTo) {
                    case 'C':
                        var dest_loc = Core.idx2loc(idx0);
                        if (idx != idx0) {
                            inner_pos_list.push(dest_loc);
                        }
                        break;
                    case 'BL1':
                        var dest_loc = Core.getAdjacent(idx0, 'BL').loc;
                        var dest_idx = Core.loc2idx(dest_loc);
                        inner_pos_list.push(cc.p(loc0.x, loc0.y - two3rd));
                        inner_pos_list.push(dest_loc);
                        tempCellMap[dest_idx] = tempCellMap[idx0];
                        tempCellMap[idx0] = null;
                        idx0 = dest_idx;
                        break;
                    case 'BR1':
                        var dest_loc = Core.getAdjacent(idx0, 'BR').loc;
                        var dest_idx = Core.loc2idx(dest_loc);
                        inner_pos_list.push(cc.p(loc0.x, loc0.y - two3rd));
                        inner_pos_list.push(dest_loc);
                        tempCellMap[dest_idx] = tempCellMap[idx0];
                        tempCellMap[idx0] = null;
                        idx0 = dest_idx;
                        break;
                    case 'BL2':
                        var dest_loc = Core.getAdjacent(idx0, 'BL').loc;
                        var dest_idx = Core.loc2idx(dest_loc);
                        inner_pos_list.push(cc.p(loc0.x - 1, loc0.y - one3rd));
                        inner_pos_list.push(dest_loc);
                        tempCellMap[dest_idx] = tempCellMap[idx0];
                        tempCellMap[idx0] = null;
                        idx0 = dest_idx;
                        break;
                    case 'BR2':
                    var dest_loc = Core.getAdjacent(idx0, 'BR').loc;
                    var dest_idx = Core.loc2idx(dest_loc);
                    inner_pos_list.push(cc.p(loc0.x + 1, loc0.y - one3rd));
                    inner_pos_list.push(dest_loc);
                    tempCellMap[dest_idx] = tempCellMap[idx0];
                    tempCellMap[idx0] = null;
                    idx0 = dest_idx;
                    break;
                    case 'B':
                        var dest_loc = Core.getAdjacent(idx0, 'B').loc;
                        var dest_idx = Core.loc2idx(dest_loc);
                        inner_pos_list.push(dest_loc);
                        tempCellMap[dest_idx] = tempCellMap[idx0];
                        tempCellMap[idx0] = null;
                        idx0 = dest_idx;
                        break;

                    default :
                }
            } while (prev_idx0 != idx0);

            if (inner_pos_list.length > 1) {
                outer_pos_list.push(inner_pos_list);
            }
        }
        return outer_pos_list;
    },


    getAdjacentInBoundsNull: function (idx, direction, cellMap) {
        var adj_idx = C.getAdjacent(idx, direction).idx;
        var candrop = false;
        if (adj_idx == null) {
            candrop = false;
        } else {
            if (cellMap == null) {
                candrop = !C.cellMap[adj_idx];
            } else {
                candrop = !cellMap[adj_idx];
            }
        }
        return candrop
    },

    // return: {'CL':false, 'BL':false, 'BR':true, 'CR':false} - BR 位置是空
    getAdjacentInBoundsNullAround: function (idx, cellMap) {
        var result = {};
        var direction_list = ['CL', 'BL', 'B', 'BR', 'CR'];
        for (var i = 0; i < direction_list.length; i++) {
            var direction = direction_list[i];
            result[direction] = C.getAdjacentInBoundsNull(idx, direction, cellMap);
        }
        return result;
    }
};

var C = Core;