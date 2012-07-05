package com.nti.selenium.login;

import com.nti.selenium.XpathUtils;

public class XpathUtilsLogin extends XpathUtils {
	
	public static String getLoginPageLoading() {
		return xpathAttributeBuilder("title", "id", "loading");
	}
	
	public static String getUsername() {
		return xpathAttributeBuilder("input", "name", "username");
	}
	
	public static String getPassword() {
		return xpathAttributeBuilder("input", "name", "password");
	}
	
	public static String getLoginButton() {
		return xpathAttributeBuilder("button", "id", "submit");
	}
	
	public static String getOptions() {
		return xpathAttributeBuilder("div", "class", "my-account-wrapper");
	}
	
	public static String getLogoutButton(){
		return xpathTextBuilder("div", "Sign out");
	}
	
	public static String getLoginProblemMessage() {
		return xpathTextBuilder("div", "Please try again, there was a problem logging in.");
	}
	
}
