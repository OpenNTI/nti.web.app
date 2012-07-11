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
	
	public static String getSections(){
		return xpathBuilder("span", "class", "label");
	}
	
	public static String getSectionTitle(String section){
		return xpathBuilder("span", "class", "label", section);
	}
	
	public static String getSeeAllButton(){
		return xpathBuilder("div", "class", "see-all");
	}
	
	public static String getSearchTextBoxExpandArrow(){
		return xpathBuilder("a", "class", "trigger x-menu");
	}
	
	public static String getSearchTextBoxExpandMenu(){
		return xpathBuilder("div", "id", "search-advanced-menu-1070-targetEl");
	}
	
}
