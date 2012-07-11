package com.nti.selenium.miscellaneous;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsMiscellaneous extends XpathUtilsNav{
	
	public static String getHome() {
		return xpathBuilder("span", "id", "button-1013-btnIconEl");
	}
	
	public static String atHomePanel(){
		return xpathBuilder("div", "id", "view-ctr");
	}
	
}
