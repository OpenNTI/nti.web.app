package com.nti.selenium.chat;

import com.nti.selenium.login.XpathUtilsLogin;

public class XpathUtilsChat extends XpathUtilsLogin {
	
	public static String getPeopleTab(){
		return xpathBuilder("span", "People");
	}
	
	public static String getGroupsTab(){
		return xpathBuilder("span", "Groups");
	}
	
	public static String getIndividualGroups(){
		return xpathBuilder("div", "class", "x-container contact-card x-container-default");
	}
	
	public static String getChatUser(String userInChat){
		return buildString(xpathBuilder("div", "class", "header-body"),
						   xpathBuilder("span", userInChat),
						   "/../../..");
	}
	
	public static String getChatInputField(){
		return buildString(xpathBuilder("div", "class", "x-component chat-entry x-box-item x-component-chat-entry"),
						   xpathBuilder("div"),
						   xpathBuilder("div"),
						   xpathBuilder("input", "type", "text"));
	}
	
	public static String getMyMessage(String message){
		return buildString(xpathBuilder("div", "class", "log-entry me"),
						   xpathBuilder("div", "class", "body-text", message));
	}
	
	public static String getOtherMessage(String message){
		return buildString(xpathBuilder("div", "class", "log-entry "),
						   xpathBuilder("div", "class", "body-text", message));
	}
	
}