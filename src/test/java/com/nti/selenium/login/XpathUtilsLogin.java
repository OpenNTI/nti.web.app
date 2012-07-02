package com.nti.selenium.login;

import com.nti.selenium.XpathUtils;

public class XpathUtilsLogin extends XpathUtils {
	
	public String getLoading(){
		return xpathAttributeBuilder("title", "id", "loading");
	}
	
	public String getUsername(){
		return xpathAttributeBuilder("input", "name", "username");
	}
	
	public String getPassword(){
		return xpathAttributeBuilder("input", "name", "password");
	}
	
	public String getLoginButton(){
		return xpathAttributeBuilder("button", "id", "submit");
	}
	
	public String getOptions(){
		return xpathAttributeBuilder("div", "class", "my-account-wrapper");
	}
	
	public String getLogoutButton(){
		return xpathTextBuilder("div", "Sign out");
	}
	
	public String getLoginProblemMessage(){
		return xpathTextBuilder("div", "Please try again, there was a problem logging in.");
	}
	
}
