package com.nti.selenium.search;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsSearch extends XpathUtilsNav{

	public static String getSearch() {
		return xpathBuilder("span", "id", "button-1016-btnIconEl");
	}
	
	public static String getSearchField(){
		return buildString(xpathBuilder("div", "class", "search-field"), "//input");
	}
	
	public static String getBookSearchResults(){
		return xpathBuilder("div", "class", "label", "Books");
	}
	
	public static String getBookResultTitle(String title){
		return xpathBuilder("div", "class", "title", title);
	}
	
	public static String getBookResultSection(String sectionName){
		return xpathBuilder("div", "class", "section", sectionName);	
	}
	
	public static String getBooks(){
		return buildString(xpathBuilder("div", "class", "body"), "//div");
	}
	
	public static String getSectionTitle(String name){
		return xpathBuilder("span", "class", "label", name);
	}
	
}
