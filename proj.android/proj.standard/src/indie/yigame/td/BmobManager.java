package indie.yigame.td;

import org.json.JSONException;
import org.json.JSONObject;

import com.easyjsb.classes.AndroidJSBHelper;

import cn.bmob.v3.Bmob;
import cn.bmob.v3.listener.SaveListener;
import android.app.Activity;
import android.util.Log;

public class BmobManager {
	public static String tag = "BmobManager";
	Activity activity;

	private static BmobManager s_BmobManager = null;
	private BmobManager() {}
	public static BmobManager getInstance() {
		if (s_BmobManager == null) {
			s_BmobManager = new BmobManager();
		}
		return s_BmobManager;
	}
	
	public void init(Activity activity, String application_id) {
		this.activity = activity;
		Bmob.initialize(activity, application_id);
	}

	public void funcCall(JSONObject para) throws JSONException {
		String function_name = para.getString("function_name");
		if (function_name.compareTo("addPerson") == 0) {
			this.addPerson(para);
		}
	}
	
	public void addPerson(final JSONObject para) throws JSONException {
		final Person p2 = new Person();
		p2.setName(para.getJSONObject("para").getString("name"));
		p2.setAddress(para.getJSONObject("para").getString("address"));
		p2.save(activity, new SaveListener() {
			@Override
			public void onSuccess() {
				try {
					Log.i(tag, ("添加数据成功，返回objectId为：" + p2.getObjectId()));
					JSONObject obj = new JSONObject();
					obj.put("object_id", p2.getObjectId());
					AndroidJSBHelper.SendMessageToJS(activity, para.getString("callback_name"), obj);
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}

			@Override
			public void onFailure(int code, String msg) {
				Log.i(tag, ("添加数据失败 msg：" + msg));
			}
		});
	}
}
