/**
 * Created by leadprogrammer on 14-8-6.
 */

var fix = {
    Sequence: {
        create: function (para) {
            if (sys.platform == 'browser') {
                return cc.Sequence.create(para);
            } else {
                var paraArray = Object.prototype.toString.call(para) === '[object Array]' ? para : arguments;
                var sequence = cc.Sequence.create(paraArray[0]);
                for (var i = 1; i < paraArray.length; i++) {
                    sequence = cc.Sequence.create(sequence, paraArray[i]);
                }
                return sequence;
            }
        }
    }
};