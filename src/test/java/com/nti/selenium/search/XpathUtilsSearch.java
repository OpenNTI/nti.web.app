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
		return xpathAttributeAndTextBuilder("div", "class", "label", "Books");
	}
	
	public static String getBookResultTitle(String title){
		return xpathAttributeAndTextBuilder("div", "class", "title", title);
	}
	
	public static String getBookResultSection(String sectionName){
		return xpathAttributeAndTextBuilder("div", "class", "section", sectionName);	
	}
	
	public static String getBooks(){
		return buildString(xpathAttributeBuilder("div", "class", "body"), "//div");
	}
	
	public static String getSectionTitle(String name){
		return xpathAttributeAndTextBuilder("span", "class", "label", name);
	}
	
}
