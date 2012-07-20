package com.nti.selenium.login;

import com.nti.selenium.XpathUtils;

public class XpathUtilsLogin extends XpathUtils {
	
	public static String getLoginPageLoading() {
		return xpathBuilder("title", "id", "loading");
	}
	
	public static String getUserName() {
		return xpathBuilder("input", "name", "username");
	}
	
	public static String getPassword() {
		return xpathBuilder("input", "name", "password");
	}
	
	public static String getLoginButton() {
		return xpathBuilder("button", "id", "submit");
	}
	
	public static String getOptions() {
		return xpathBuilder("div", "class", "my-account-wrapper");
	}
	
	public static String getLogoutButton(){
		return xpathBuilder("div", "Sign out");
	}
	
	public static String getLoginProblemMessage() {
		return xpathBuilder("div", "Please try again, there was a problem logging in.");
	}
	
}
