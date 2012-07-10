package com.nti.selenium.navigation;

import com.nti.selenium.login.XpathUtilsLogin;

public class XpathUtilsNav extends XpathUtilsLogin {
	
	public static String getLibrary() {
		return xpathBuilder("span", "id", "button-1014-btnIconEl");
	}
	
	public static String getBook(final String book) {
		return xpathBuilder("div", "class", "title", book);
	}
	
	public static String getChapter(final String chapter) {
		return xpathBuilder("div", chapter);
	}
	
	public static String getSection(final String section) {
		return xpathBuilder("div", section);
	}
	
	public static String getFractionIndexPage() {
		return xpathBuilder("span", "class", "label", "Fractions");
	}
	
	public static String getChallengeProblem() {
		return xpathBuilder("span", "class", "headingtext", "Challenge Problems");
	}
	
	public static String getWhatIsAFraction() {
		return xpathBuilder("span", "class", "label", "What is a Fraction?");
	}
	
	public static String getBackArrow(){
		return xpathBuilder("button", "id", "button-1032-btnEl");
	}
	
	public static String getForwardArrow(){
		return xpathBuilder("button", "id", "button-1033-btnEl");
	}
	
	public static String getRelatedItem(final String relatedItem){
		return xpathBuilder("a", "class", "related", relatedItem);
	}
	
	public static String getDivisionPage(final String relatedItem) {
		return xpathBuilder("span", "class", "label", relatedItem);
	}
	
}
