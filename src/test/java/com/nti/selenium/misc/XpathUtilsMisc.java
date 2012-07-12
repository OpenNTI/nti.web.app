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
	
	public static String getMyAccountButton(){
		return xpathBuilder("div", "My Account");
	}
	
	public static String getRealNameInput(){
		return xpathBuilder("input", "name", "realname");
	}
	
	public static String getAliasInput(){
		return xpathBuilder("input", "name", "alias");
	}
	
	public static String getChangePasswordLink(){
		return xpathBuilder("a", "Change password");
	}
	
	public static String getChangePasswordInput(){
		return xpathBuilder("input", "name", "password");
	}
	
	public static String getVerifyPasswordInput(){
		return xpathBuilder("input", "name", "password-verify");
	}
	
	public static String getMyAccountOtherPeopleInput(){
		return buildString(xpathBuilder("td", "class", "x-form-trigger-input-cell"),
						   xpathBuilder("input"));
	}
	
	public static String getMyAccountOtherPeopleDropDownArrow(){
		return buildString(xpathBuilder("td", "class", "x-trigger-cell"),
						   xpathBuilder("div", "role", "button"));
	}
	
	public static String getMyAccountOtherPeopleEveryoneOption(){
		return xpathBuilder("div", "Everyone");
	}
	
	public static String findNameOptions(String name){
		return xpathBuilder("div", "class", "name", name);
	}

	public static String findNameToken(String name){
		return xpathBuilder("span", "class", "nt-token-label", name);
	}
	
	public static String getPrivacyButton(){
		return xpathBuilder("div", "Privacy");
	}
	
//	public static String getTextField(){
//		return xpathBuilder("div", "class", "x-container user-list-field x-fit-item x-container-user-list");
//	}
	
}
