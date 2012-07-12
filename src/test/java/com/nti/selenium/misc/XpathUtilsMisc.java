package com.nti.selenium.misc;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsMisc extends XpathUtilsNav{
	
	public static String getHome() {
		return xpathBuilder("span", "id", "button-1013-btnIconEl");
	}
	
	public static String atHomePanel(){
		return xpathBuilder("div", "id", "view-ctr");
	}
	
	public static String dropDownChapter(){
		return buildString(xpathBuilder("div", "class", "shrink-wrap"), 
						   xpathBuilder("div", "class", "label"), 
						   xpathBuilder("span"));
	}
	
	public static String dropDownSection(){
		return buildString(xpathBuilder("div", "class", "shrink-wrap"), 
						   xpathBuilder("div", "class", "menu"), 
						   xpathBuilder("span"));
	}
	
	public static String dropDownShowMe(){
		return buildString(xpathBuilder("div", "class", "shrink-wrap"), 
				   xpathBuilder("div", "class", "menu"), 
				   xpathBuilder("span"));
	}
	
	public static String dropDownList(){
		return buildString(xpathBuilder("div", "class", "x-box-inner x-box-scroller-top"),
						   "/..",
						   xpathBuilder("div"),
						   xpathBuilder("div"));
	}
	
}
