APPNAME="TD"

# options

buildexternalsfromsource=
PARALLEL_BUILD_FLAG=

usage(){
cat << EOF
usage: $0 [options]

Build C/C++ code for $APPNAME using Android NDK

OPTIONS:
-s	Build externals from source
-p  Run make with -j8 option to take advantage of multiple processors
-h	this help
EOF
}

while getopts "sph" OPTION; do
case "$OPTION" in
s)
buildexternalsfromsource=1
;;
p)
PARALLEL_BUILD_FLAG=\-j8
;;
h)
usage
exit 0
;;
esac
done

# exit this script if any commmand fails
set -e

# paths

if [ -z "${NDK_ROOT+aaa}" ];then
echo "please define NDK_ROOT"
exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# ... use paths relative to current directory
# COCOS2DX_ROOT="$DIR/../../.."
# APP_ROOT="$DIR/.."
# APP_ANDROID_ROOT="$DIR"
# BINDINGS_JS_ROOT="$APP_ROOT/../../scripting/javascript/bindings/js"
COCOS2DX_ROOT="$DIR/../../_PomeloLibrary/GameFoundation"
APP_ROOT="$DIR/../.."
APP_ANDROID_ROOT="$DIR"
APP_SCRIPTS_ROOT="$APP_ROOT/Scripts/Scripts"
APP_ASSETS_ROOT="$APP_ROOT/_AssetsLibrary/Assets_Standard/Assets"
BINDINGS_JS_ROOT="$APP_ROOT/_PomeloLibrary/GameFoundation/scripting/javascript/bindings/js"
NATIVE_CODE_ROOT="$APP_ROOT/Classes"
SOOMLA_JS_ROOT="$APP_ROOT/_PomeloLibrary/GameFoundation/extensions/cocos2dx-store/js/"
# PT_GAME_SDK_ROOT="$APP_ANDROID_ROOT/PTGameSDK"

echo
echo "Paths"
echo "    NDK_ROOT = $NDK_ROOT"
echo "    COCOS2DX_ROOT = $COCOS2DX_ROOT"
echo "    APP_ROOT = $APP_ROOT"
echo "    APP_ANDROID_ROOT = $APP_ANDROID_ROOT"
echo

# Debug
set -x

# make sure assets is exist
if [ -d "$APP_ANDROID_ROOT"/assets ]; then
    rm -rf "$APP_ANDROID_ROOT"/assets
fi

mkdir "$APP_ANDROID_ROOT"/assets
mkdir "$APP_ANDROID_ROOT"/assets/Scripts
mkdir "$APP_ANDROID_ROOT"/assets/res

# compile Scripts
python "$COCOS2DX_ROOT/console/cocos2d.py" jscompile -s "$APP_SCRIPTS_ROOT" -d "$APP_ROOT/Scripts/jsc_game"
python "$COCOS2DX_ROOT/console/cocos2d.py" jscompile -s "$BINDINGS_JS_ROOT" -d "$APP_ROOT/Scripts/jsc_bindings"
python "$COCOS2DX_ROOT/console/cocos2d.py" jscompile -s "$COCOS2DX_ROOT/extensions/cocos2dx-store/js" -d "$APP_ROOT/Scripts/jsc_store"

# copy Resources/* into assets' root
cp -rf "$APP_ASSETS_ROOT"/* "$APP_ANDROID_ROOT"/assets

# copy bindings/*.js into assets' root
# cp -f "$BINDINGS_JS_ROOT"/* "$APP_ANDROID_ROOT"/assets

# copy Scripts/Scripts/*.js into assets' root
# cp -f "$APP_SCRIPTS_ROOT"/* "$APP_ANDROID_ROOT"/assets
cp -rf "$APP_ROOT/Scripts/jsc_game"/* "$APP_ANDROID_ROOT"/assets/Scripts
cp -rf "$APP_ROOT/Scripts/jsc_bindings"/* "$APP_ANDROID_ROOT"/assets
cp -rf "$APP_ROOT/Scripts/jsc_store"/* "$APP_ANDROID_ROOT"/assets
cp -rf "$COCOS2DX_ROOT/external/EasyNDK/JSBHelper.jsc" "$APP_ANDROID_ROOT"/assets

# copy soomla js-file into assets' root
cp -f "$SOOMLA_JS_ROOT"/* "$APP_ANDROID_ROOT"/assets

# cp -rf "$BINDINGS_JS_ROOT/../jsc"/* "$APP_ANDROID_ROOT"/assets
# cp -rf "$COCOS2DX_ROOT/extensions/cocos2dx-store/jsc"/* "$APP_ANDROID_ROOT"/assets

# copy PT_SDK assets
# cp -rf "$PT_GAME_SDK_ROOT/assets"/* "$APP_ANDROID_ROOT"/assets

# clean
rm -rf "$APP_ROOT/Scripts/jsc_game"
rm -rf "$APP_ROOT/Scripts/jsc_bindings"
rm -rf "$APP_ROOT/Scripts/jsc_store"

echo "Using prebuilt externals"
echo

set -x

"$NDK_ROOT"/ndk-build $PARALLEL_BUILD_FLAG -C "$APP_ANDROID_ROOT" $* \
    "NDK_MODULE_PATH=${COCOS2DX_ROOT}:${COCOS2DX_ROOT}/cocos2dx/platform/third_party/android/prebuilt" \
    NDK_LOG=0 V=0
