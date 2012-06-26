package com.nti.selenium.navigation;

import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.login.Login;

public class Navigation extends Login {

	private String book;
	private String chapter;
	private String section;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.login();
	}
	
	public String getLibraryXpath() {
		return this.xpathAttributeBuilder("span", "id", "button-1014-btnIconEl");
	}
	
	public String getBookXpath() {
		return this.xpathAttributeAndTextBuilder("div", "class", "title", book);
	}
	
	public String getChapterXpath() {
		return this.xpathTextBuilder("div", chapter);
	}
	
	public String getSectionXpath(){
		return this.xpathTextBuilder("div", section);
	}
	
	public String getFractionIndexPageXpath() {
		return this.xpathAttributeAndTextBuilder("span", "class", "label", "Fractions");
	}
	
	public String getChallengeProblemXpath() {
		return this.xpathAttributeAndTextBuilder("span", "class", "headingtext", "Challenge Problems");
	}
	
	public String getWhatIsAFractionXpath() {
		return this.xpathAttributeAndTextBuilder("span", "class", "label", "What is a Fraction?");
	}
	
	public void openLevel(String xpath) {
		this.switchToDefault();
		this.findElement(xpath).click();
	}
	
	public void openLevelClick(String xpath){
		this.switchToDefault();
		this.waitForElement(xpath, timeout);
		this.findElement(xpath).click();
	}
	
	public void openLibrary() {
		this.switchToDefault();
		this.waitForLoading(timeout);
		this.openLevel(this.getLibraryXpath());
	}
	
	public void openBook() {
		this.switchToDefault();
		this.waitForElement(this.getBookXpath(), timeout);
		this.openLevel(this.getBookXpath());
	}
	
	public void openChapter(){
		this.switchToDefault();
		this.openLevelClick(this.getChapterXpath());
	}
	
	public void openSection(){
		this.switchToDefault();
		this.openLevelClick(this.getSectionXpath());
		this.openBook();
		this.waitForLoading(timeout);
	}
	
	public void clickArrowBackButton(){
		this.switchToDefault();
		String arrowXpath = this.xpathAttributeBuilder("button", "id", "button-1032-btnEl");
		this.findElement(arrowXpath).click();
		this.waitForLoading(timeout);
	}
	
	public void clickArrowForwardButton(){
		this.switchToDefault();
		String arrowXpath = this.xpathAttributeBuilder("button", "id", "button-1033-btnEl");
		this.findElement(arrowXpath).click();
		this.waitForLoading(timeout);
	}
	
	public void navigateTo(final String book,final String chapter, final String section) {
		
		this.book = book;
		this.chapter = chapter;
		this.section = section;
		this.switchToDefault();
		
		if (book == null) {
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
	
	public void setBook(final String book) {
		this.book = book;
	}
	
	public void setChapter(final String chapter) {
		this.chapter = chapter;
	}
	
	public void setSection(final String section) {
		this.section = section;
	}
	
	public WebElement getNavTestText(final String xpath) {
		this.switchToIframe();
		return this.findElement(xpath);
	}
	
}
