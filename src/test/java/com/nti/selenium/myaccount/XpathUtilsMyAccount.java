package com.nti.selenium.myaccount;

import com.nti.selenium.login.XpathUtilsLogin;

public class XpathUtilsMyAccount extends XpathUtilsLogin{

	public static String getMyAccountButton() {
		return xpathBuilder("div", "My Account");
	}
	
	public static String getRealNameInput() {
		return xpathBuilder("input", "name", "realname");
	}
	
	public static String getAliasInput() {
		return xpathBuilder("input", "name", "alias");
	}
	
	public static String getChangePasswordLink() {
		return xpathBuilder("a", "Change password");
	}
	
	public static String getChangePasswordInput() {
		return xpathBuilder("input", "name", "password");
	}
	
	public static String getVerifyPasswordInput() {
		return xpathBuilder("input", "name", "password-verify");
	}
	
	public static String getMyAccountOtherPeopleInput() {
		return buildString(xpathBuilder("td", "class", "x-form-trigger-input-cell"),
						   xpathBuilder("input"));
	}
	
	public static String getMyAccountOtherPeopleDropDownArrow() {
		return buildString(xpathBuilder("td", "class", "x-trigger-cell"),
						   xpathBuilder("div", "role", "button"));
	}
	
	public static String getMyAccountOtherPeopleEveryoneOption() {
		return xpathBuilder("div", "Everyone");
	}
	
	public static String findNameOptions(String name) {
		return xpathBuilder("div", "class", "name", name);
	}

	public static String findNameToken(String name) {
		return xpathBuilder("span", "class", "nt-token-label", name);
	}
	
	public static String findNameTokenXButton(String name) {
		return buildString(xpathBuilder("span", "class", "nt-token-label", name),
						   "/..",
						   xpathBuilder("span", "class", "nt-token-nib nt-token-nib-end"));
	}
	
	public static String getSaveButton() {
		return xpathBuilder("span", "Save");
	}
	
	public static String getCancelButton() {
		return xpathBuilder("span", "Cancel");
	}
	
}
