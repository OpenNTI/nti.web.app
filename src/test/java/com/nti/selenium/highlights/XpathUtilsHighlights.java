package com.nti.selenium.highlights;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsHighlights extends XpathUtilsNav {

	public static String getCreateHighlightButton(){
		return xpathBuilder("div", "Save Highlight");
	}
	
	public static String getRemoveHighlightButton(){
		return xpathBuilder("div", "Delete Highlight");
	}
	
	public static String getShareWithButton(){
		return xpathBuilder("div", "Share With...");
	}
	
	public static String getCreatedHighlight(){
		return buildString(xpathBuilder("p", "class", "par"),
						   xpathBuilder("span", "data-non-anchorable", "true"));
	}	
	
	public static String getShareThisTitle(){
		return xpathBuilder("div", "class", "title"," Share this...");
	}
	
	public static String getShareHighlightInputField(){
		return xpathBuilder("input", "placeholder", "Search...");
	}
	
	public static String getShareHighlightInputFieldDropDownArrow(){
		return xpathBuilder("div", "class", "x-trigger-index-1 x-form-trigger x-menu x-form-trigger-last x-unselectable x-menu-click x-form-trigger-click");
	}
	
	public static String getSearchedForUser(String username){
		return buildString(xpathBuilder("div", "class", "card-body"),
						   xpathBuilder("div", "class", "name", username));
	}
	
	public static String getEveryoneDropDownItem(){
		return xpathBuilder("div", "Everyone");
	}
	
	public static String getGroupDropDownItem(String groupName){
		return xpathBuilder("div", groupName);
	}
	
	public static String getEveryoneTokenLabel(){
		return xpathBuilder("div", "class", "nt-token-label", "Everyone");
	}
	
	public static String getGroupUsernameTokenLabel(String userNameGroupName){
		return xpathBuilder("span", "class", "nt-token-label", userNameGroupName);
	}
	
	public static String getEveryoneTokenLabelCloseButton(){
		return buildString(getEveryoneTokenLabel(),
						   "/..",
						   xpathBuilder("span", "class", "nt-token-nib nt-token-nib-end"));
	}
	
	public static String getGroupTokenLabelCloseButton(String userXpathGroupXpath){
		return buildString(userXpathGroupXpath,
						   "/..",
						   xpathBuilder("span", "class", "nt-token-nib nt-token-nib-end"));
	}
	
	public static String getShareHighlightSaveButton(){
		return buildString(xpathBuilder("button"),
						   xpathBuilder("span", "Save"));
	}
	
	public static String getShareHighlightCancelButton(){
		return buildString(xpathBuilder("button"),
				   xpathBuilder("span", "Cancel"));
	}
	
}
