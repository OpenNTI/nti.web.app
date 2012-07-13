package com.nti.selenium.misc;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsMisc extends XpathUtilsNav{
	
	public static String getHome() {
		return xpathBuilder("span", "id", "button-1013-btnIconEl");
	}
	
	public static String atHomePanel() {
		return xpathBuilder("div", "id", "view-ctr");
	}
	
	public static String dropDownShowMe() {
		return buildString(xpathBuilder("div", "class", "shrink-wrap"), 
				   xpathBuilder("div", "class", "menu"), 
				   xpathBuilder("span"));
	}
	
	public static String dropDownList() {
		return buildString(xpathBuilder("div", "class", "x-box-inner x-box-scroller-top"),
						   "/..",
						   xpathBuilder("div"),
						   xpathBuilder("div"));
	}
	
	public static String getMyAccountButton() {
		return xpathBuilder("div", "My Account");
	}
	
	public static String getPrivacyButton() {
		return xpathBuilder("div", "Privacy");
	}
	
	public static String getPrivacyWindowStatus() {
		return buildString(xpathBuilder("span", "Privacy"),
						   "/../../../../../..");
	}
	
	public static String getPrivacyCloseButton() {
		return xpathBuilder("img", "class", "tool close");
	}
	
}
