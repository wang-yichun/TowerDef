package com.easyjsb.classes;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

public class AndroidJSBHelper
{
	private static String TAG = "[AndroidJSBHelper]";
	private static Object callHandler = null;
	private static Handler NDKHelperHandler = null;
	
	private static native void JSCallHandler(String json);
	private static String __CALLED_METHOD__ = "calling_method_name";
	private static String __CALLED_METHOD_PARAMS__ = "calling_method_params";
	private final static int __MSG_FROM_CPP__ = 5; 
	

	public static void SendMessageToJS(final Context cnx, final String methodToCall, final JSONObject paramList){
//		Log.i(TAG, "into SendMessageToJS");
		
		((Cocos2dxActivity)cnx).runOnGLThread(new Runnable(){
			@Override
			public void run()
			{
				JSONObject obj = new JSONObject();
				try
				{
					obj.put(__CALLED_METHOD__, methodToCall);
					obj.put(__CALLED_METHOD_PARAMS__, paramList);
					JSCallHandler(obj.toString());
				}
				catch (Exception e)
				{
					e.printStackTrace();
				}
			}
		});
		

	}
	
	
}
