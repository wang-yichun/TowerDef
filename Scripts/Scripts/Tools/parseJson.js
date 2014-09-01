/**
 * Created by leadprogrammer on 8/18/14.
 */

var parseJson = function (json_file) {
    var text = cc.FileUtils.getInstance().getStringFromFile(json_file);
    var json = JSON.parse(text);
    return json;
};