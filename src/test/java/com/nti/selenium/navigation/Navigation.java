package com.nti.selenium.navigation;

import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.login.Login;
import com.nti.selenium.search.XpathUtilsSearch;

public class Navigation extends Login {
	
	private String book = null;
	private String chapter = null;
	private String section = null;
	private String relatedItem = null;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.login();
	}
	
	public void openLevel(final String xpath) {
		this.switchToDefault();
		this.findElement(xpath).click();
	}
	
	public void openLevelClick(final String xpath){
		this.switchToDefault();
		this.waitForElement(xpath);
		this.findElement(xpath).click();
	}
	
	public void openLibrary() {
		this.switchToDefault();
		this.waitForLoading();
		this.openLevel(XpathUtilsNav.getLibrary());
	}
	
	public void openBook() {
		this.switchToDefault();
		this.waitForElement(this.getXPathBook());
		this.openLevel(this.getXPathBook());
	}
	
	public void openChapter() {
		this.switchToDefault();
		this.openLevelClick(this.getXPathChapter());
	}
	
	public void openSection() {
		this.switchToDefault();
		this.openLevelClick(this.getXPathSection());
		this.openBook();
		this.waitForLoading();
	}
	
	public void clickArrowBackButton() {
		this.switchToDefault();
		this.findElement(XpathUtilsNav.getBackArrow()).click();
		this.waitForLoading();
	}
	
	public void clickArrowForwardButton() {
		this.switchToDefault();
		this.findElement(XpathUtilsNav.getForwardArrow()).click();
		this.waitForLoading();
	}
	
	public void clickRelatedItem(final String item){
		this.setRelatedItem(item);
		this.switchToIframe();
		this.findElement(this.getXPathRelatedItem()).click();
		this.waitForLoading();
	}
	
	public void navigateTo(final String book, final String chapter, final String section) {
		this.setLocation(book, chapter, section);
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
	
	public WebElement getNavTestText(final String xpath) {
		this.switchToIframe();
		return this.findElement(xpath);
	}
	
	public void setRelatedItem(final String relatedItem) {
		this.relatedItem = relatedItem;
	}
	
	public void setLocation(final String book, final String chapter, final String section) {
		this.book = book;
		this.chapter = chapter;
		this.section = section;
	}
	
	public String getXPathBook() {
		return XpathUtilsNav.getBook(this.book);
	}
	
	public String getXPathChapter() {
		return XpathUtilsNav.getChapter(this.chapter);
	}
	
	public String getXPathSection() {
		return XpathUtilsNav.getSection(this.section);
	}
	
	public String getXPathRelatedItem() {
		return XpathUtilsNav.getRelatedItem(this.relatedItem);
	}
	
	public String getXPathDivisionPage() {
		return XpathUtilsNav.getSectionPageTitle(this.relatedItem);
	}
	
	public boolean isChecked(String name){
		WebElement element = this.findElement(XpathUtilsSearch.getSearchTextBoxExpandMenuItem(name));
		String clazz = element.getAttribute("class");
		return !(clazz.matches(".*unchecked.*"));
	}
	
}
