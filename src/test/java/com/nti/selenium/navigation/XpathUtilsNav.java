package com.nti.selenium.navigation;

import com.nti.selenium.login.XpathUtilsLogin;

public class XpathUtilsNav extends XpathUtilsLogin{

	private String book;
	private String chapter;
	private String section;
	private String relatedItem;
	
	public void setLocation(String book, String chapter, String section){
		this.book = book;
		this.chapter = chapter;
		this.section = section;
	}
	
	public void setRelatedItem(String relatedItem){
		this.relatedItem = relatedItem;
	}
	
	public String getLibrary() {
		return xpathAttributeBuilder("span", "id", "button-1014-btnIconEl");
	}
	
	public String getBook() {
		return xpathAttributeAndTextBuilder("div", "class", "title", this.book);
	}
	
	public String getChapter() {
		return xpathTextBuilder("div", this.chapter);
	}
	
	public String getSection(){
		return xpathTextBuilder("div", this.section);
	}
	
	public String getFractionIndexPage() {
		return xpathAttributeAndTextBuilder("span", "class", "label", "Fractions");
	}
	
	public String getChallengeProblem() {
		return xpathAttributeAndTextBuilder("span", "class", "headingtext", "Challenge Problems");
	}
	
	public String getWhatIsAFraction() {
		return xpathAttributeAndTextBuilder("span", "class", "label", "What is a Fraction?");
	}
	
	public String getBackArrow(){
		return xpathAttributeBuilder("button", "id", "button-1032-btnEl");
	}
	
	public String getForwardArrow(){
		return xpathAttributeBuilder("button", "id", "button-1033-btnEl");
	}
	
	public String getRelatedItem(){
		return xpathAttributeAndTextBuilder("a", "class", "related", this.relatedItem);
	}
	
	public String getDivisionPage(){
		return xpathAttributeAndTextBuilder("span", "class", "label", this.relatedItem);
	}
	
}
