package com.nti.selenium.navigation;

import com.nti.selenium.login.XpathUtilsLogin;

public class XpathUtilsNav extends XpathUtilsLogin{
	
	public static String getLibrary() {
		return xpathAttributeBuilder("span", "id", "button-1014-btnIconEl");
	}
	
	public static String getBook(final String book) {
		return xpathAttributeAndTextBuilder("div", "class", "title", book);
	}
	
	public static String getChapter(final String chapter) {
		return xpathTextBuilder("div", chapter);
	}
	
	public static String getSection(final String section) {
		return xpathTextBuilder("div", section);
	}
	
	public static String getFractionIndexPage() {
		return xpathAttributeAndTextBuilder("span", "class", "label", "Fractions");
	}
	
	public static String getChallengeProblem() {
		return xpathAttributeAndTextBuilder("span", "class", "headingtext", "Challenge Problems");
	}
	
	public static String getWhatIsAFraction() {
		return xpathAttributeAndTextBuilder("span", "class", "label", "What is a Fraction?");
	}
	
	public static String getBackArrow(){
		return xpathAttributeBuilder("button", "id", "button-1032-btnEl");
	}
	
	public static String getForwardArrow(){
		return xpathAttributeBuilder("button", "id", "button-1033-btnEl");
	}
	
	public static String getRelatedItem(final String relatedItem){
		return xpathAttributeAndTextBuilder("a", "class", "related", relatedItem);
	}
	
	public static String getDivisionPage(final String relatedItem) {
		return xpathAttributeAndTextBuilder("span", "class", "label", relatedItem);
	}
}
