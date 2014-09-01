/**
 * Created by leadprogrammer on 14-8-6.
 */

var DefaultNode = cc.Node.extend({
    ctor: function () {
        this._super();
        cc.associateWithNative(this, cc.Node);
    }
});