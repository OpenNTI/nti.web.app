package com.nti.selenium.search;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsSearch extends XpathUtilsNav{

	public static String getSearch() {
		return xpathAttributeBuilder("span", "id", "button-1016-btnIconEl");
	}
	
	public static String getSearchField(){
		return buildString(xpathAttributeBuilder("div", "class", "search-field"), "//input");
	}
	
	public static String getBookSearchResults(){
		return buildString(xpathAttributeAndTextBuilder("div", "class", "label", "Books"));
	}
	
}
