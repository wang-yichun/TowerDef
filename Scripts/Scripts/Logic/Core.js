/**
 * Created by leadprogrammer on 14-8-2.
 */

var Core = {

    nx: 20, // 格子数量 x 轴
    ny: 12, // 格子数量 y 轴
    n: null, // 格子总数
    gridx: 20, // 格子宽度
    gridy: 20, // 格子高度
    boardx: null, // 总宽度
    boardy: null, // 总高度
    diffx: null, // 偏移 x 轴 : 格子(0,0)点与 layer(0,0)点的距离
    diffy: null, // 偏移 y 轴 : 格子(0,0)点与 layer(0,0)点的距离

    cellMap: [], // create 出来放在层上的 node 都 放在这里

    traverse_list_loc: [],
    initTraverseList: function () {
        for (var y = 0; y < C.ny; y++) {
            for (var x = 0; x < C.nx; x++) {
                C.traverse_list_loc.push(cc.p(x, y));
            }
        }
    },

    initCore: function () {
        this.n = this.nx * this.ny;
        this.boardx = this.nx * this.gridx;
        this.boardy = this.ny * this.gridy;
        this.diffx = -this.boardx / 2 + this.gridx / 2;
        this.diffy = -this.boardy / 2 + this.gridy / 2;
        this.initTraverseList();
    },

    /**
     * pos: 屏幕坐标
     * loc: 格子坐标
     * idx: node_list中的索引
     */
    idx2loc: function (idx) {
        var x = idx % C.nx;
        var y = Math.floor(idx / C.ny);
        return cc.p(x, y);
    },
    idx2pos: function (idx) {
        var loc = C.idx2loc(idx);
        return C.loc2pos(loc);
    },
    loc2idx: function (loc) {
        return loc.y * C.nx + loc.x;
    },
    loc2pos: function (loc) {
        var x = loc.x * C.gridx + C.diffx;
        var y = loc.y * C.gridy + C.diffy;
        return cc.p(x, y);
    },
    pos2loc: function (pos) {
        var px = pos.x - C.diffx + C.gridx / 2;
        var py = pos.y - C.diffy + C.gridy / 2;
        var lx = Math.floor(px / C.gridx);
        var ly = Math.floor(py / C.gridy);
        return cc.p(lx, ly);
    },
    pos2idx: function (pos) {
        return C.loc2idx(C.pos2loc(pos));
    },

    isInBound: function (loc) {
        if (loc.x < 0) return false;
        if (loc.y < 0) return false;
        if (loc.x >= C.nx) return false;
        if (loc.y >= C.ny) return false;
        return true;
    },

    createCellByLoc: function (loc) {
        var idx = C.loc2idx(loc);
        var pos1 = C.loc2pos(loc);

        var node = cc.DrawNode.create();
        node.drawDot(cc.p(0, 0), C.gridx / 2, cc.c4f(1, 1, 1, 1));

        node.setPosition(pos1);

        gLayer_DrawTest['grid_container'].addChild(node);

        C.cellMap[idx] = {
            loc: idx,
            node: node,
            code: 0
        };
    },

    changeCellColorByLoc: function (loc) {
        if (C.isInBound(loc)) {
            var idx = C.loc2idx(loc);
            var cell = C.cellMap[idx];
            var node = cell.node;
            cell.code++;
            cell.code = cell.code % 2;
            if (cell.code == 0) {
                node.clear();
                node.drawDot(cc.p(0, 0), C.gridx / 2, cc.c4f(1, 1, 1, 1));
            } else {
                node.clear();
                node.drawDot(cc.p(0, 0), C.gridx / 2, cc.c4f(1, 0, 0, 1));
            }
        }
    }
};

var C = Core;