package com.nti.selenium.navigation;

import org.junit.After;
import org.junit.Before;

import com.nti.selenium.login.Login;

public class Navigation extends Login {

	String book;
	String chapter;
	String section;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.login();
	}
	
	public String getLibraryXpath(){
		return this.xpathAttributeBuilder("span", "id", "button-1014-btnIconEl");
	}
	
	public String getBookXpath(){
		return this.xpathAttributeAndTextBuilder("div", "class", "title", book);
	}
	
	public String getChapterXpath(){
		return this.xpathTextBuilder("div", chapter);
	}
	
	public String getSectionXpath(){
		return this.xpathTextBuilder("div", section);
	}
	
	public String getFractionIndexPageXpath(){
		return this.xpathAttributeAndTextBuilder("span", "class", "label", "Fractions");
	}
	
	public void openLevel(String xpath) {
		this.waitForElement(xpath, timeout);
		selenium.mouseOver(xpath);
		selenium.mouseDown(xpath);
		selenium.mouseUp(xpath);
	}
	
	public void openLevelClick(String xpath){
		this.waitForElement(xpath, timeout);
		selenium.click(xpath);
	}
	
	public void openLibrary() {
		this.openLevel(this.getLibraryXpath());
		this.waitForElement(this.getBookXpath(), timeout);
	}
	
	public void openBook() {
		this.openLevel(this.getBookXpath());
		this.waitForElement(this.getChapterXpath(), timeout);
	}
	
	public void openChapter(){
		this.openLevelClick(this.getChapterXpath());
		this.waitForElement(this.getSectionXpath(), timeout);
	}
	
	public void openSection(){
		this.openLevelClick(this.getSectionXpath());
		this.waitForElement(this.getFractionIndexPageXpath(), timeout);
	}
	
	public void navigateTo(final String book,final String chapter, final String section) {
		
		this.book = book;
		this.chapter = chapter;
		this.section = section;
		
		if(book == null){
			return;
		} else if(chapter == null && section == null) {
			this.openLibrary();
			this.openBook();
		} else if(chapter == null && section != null) {
			this.openLibrary();
			this.openBook();
			this.openSection();
		} else if(chapter != null && section == null) {
			this.openLibrary();
			this.openBook();
			this.openChapter();
		} else {
			this.openLibrary();
			this.openBook();
			this.openChapter();
			this.openSection();
		}
	}
	
	public void setBook(String book){
		this.book = book;
	}
	
	public void setChapter(String chapter){
		this.chapter = chapter;
	}
	
	public void setSection(String section){
		this.section = section;
	}
	
	public void getPageSectionTitle(){
		
	}
	
	public void openSearch(){
		
	}
	
	public void pagerMover(){
		
	}
	
	public void menuJumper(){
		
	}
	
}
