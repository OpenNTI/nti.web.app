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
	
}
