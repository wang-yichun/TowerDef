/****************************************************************************
Copyright (c) 2010-2012 cocos2d-x.org

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 ****************************************************************************/
package indie.yigame.td;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.json.JSONException;
import org.json.JSONObject;

import cn.bmob.v3.Bmob;

import com.easyjsb.classes.AndroidJSBHelper;
import com.easyndk.classes.AndroidNDKHelper;
import com.soomla.cocos2dx.store.StoreControllerBridge;
import com.soomla.store.SoomlaApp;
import com.tendcloud.tenddata.TalkingDataGA;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.content.DialogInterface;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.WindowManager;

@SuppressLint("SimpleDateFormat")
public class TD extends Cocos2dxActivity {

	String APP_ID = "1234"; // talking-data
	String CHANNEL_ID = "channel1234";

	private static String TAG = "TD";

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		AndroidNDKHelper.SetNDKReciever(this);
		TalkingDataGA.init(getApplicationContext(), APP_ID, CHANNEL_ID);
		getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

		BmobManager.getInstance().init(this, "945b472b400690d2698d9a1ce146d053");
	}

	@Override
	protected void onResume() {
		super.onResume();
		TalkingDataGA.onResume(this);
	}

	@Override
	protected void onStop() {
		super.onStop();
	}

	@Override
	protected void onPause() {
		super.onPause();
		TalkingDataGA.onPause(this);
	}

	protected void onDestroy() {
		super.onDestroy();
	};

	@Override
	public Cocos2dxGLSurfaceView onCreateView() {
		Cocos2dxGLSurfaceView glSurfaceView = super.onCreateView();
		glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

		StoreControllerBridge.setGLView(glSurfaceView);

		SoomlaApp.setExternalContext(getApplicationContext());

		return glSurfaceView;
	}

	public boolean dispatchKeyEvent(KeyEvent event) {
		Log.i(TAG, "78.4 " + event.getKeyCode());
		if (event.getKeyCode() == KeyEvent.KEYCODE_BACK && event.getAction() != KeyEvent.ACTION_UP) {
			dialog();
			return true;
		}
		return super.dispatchKeyEvent(event);
	}

	static boolean dialog_on = false;

	protected void dialog() {
		// if (dialog_on == true)
		// return;

		AlertDialog.Builder builder = new Builder(TD.this);
		builder.setMessage("确定要退出吗?");
		builder.setTitle("提示");
		builder.setPositiveButton("确认", new android.content.DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				TD.dialog_on = false;
				dialog.dismiss();
				TD.this.finish();
				android.os.Process.killProcess(android.os.Process.myPid());
			}
		});
		builder.setNegativeButton("取消", new android.content.DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				TD.dialog_on = false;
				dialog.dismiss();
			}
		});
		builder.create().show();
		dialog_on = true;
	}

	public void helloNative(JSONObject para) {
		JSONObject obj = new JSONObject();
		try {
			Log.i(TAG, "helloNative prms: " + para.toString(2));
			obj.put("message", "I am message from native Android");
			AndroidJSBHelper.SendMessageToJS(this, para.getString("callback_name"), obj);
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	public void nativeFunc(JSONObject para) {
		try {
			String class_name = para.getString("class_name");
			if (class_name.compareTo("BmobManager") == 0) {
				BmobManager.getInstance().funcCall(para);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	static {
		System.loadLibrary("cocos2djs");
	}
}