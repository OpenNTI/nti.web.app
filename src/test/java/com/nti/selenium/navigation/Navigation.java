package com.nti.selenium.navigation;

import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.XpathUtils;
import com.nti.selenium.login.Login;

public class Navigation extends Login {
	
	protected XpathUtilsNav xpath;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.login();
		this.xpath = new XpathUtilsNav();
	}
	
	public void openLevel(final String xpath) {
		this.switchToDefault();
		this.findElement(xpath).click();
	}
	
	public void openLevelClick(final String xpath){
		this.switchToDefault();
		this.waitForElement(xpath, timeout);
		this.findElement(xpath).click();
	}
	
	public void openLibrary() {
		this.switchToDefault();
		this.waitForLoading(timeout);
		this.openLevel(this.xpath.getLibrary());
	}
	
	public void openBook() {
		this.switchToDefault();
		this.waitForElement(this.xpath.getBook(), timeout);
		this.openLevel(this.xpath.getBook());
	}
	
	public void openChapter() {
		this.switchToDefault();
		this.openLevelClick(this.xpath.getChapter());
	}
	
	public void openSection() {
		this.switchToDefault();
		this.openLevelClick(this.xpath.getSection());
		this.openBook();
		this.waitForLoading(timeout);
	}
	
	public void clickArrowBackButton() {
		this.switchToDefault();
		this.findElement(this.xpath.getBackArrow()).click();
		this.waitForLoading(timeout);
	}
	
	public void clickArrowForwardButton() {
		this.switchToDefault();
		this.findElement(this.xpath.getForwardArrow()).click();
		this.waitForLoading(timeout);
	}
	
	public void clickRelatedItem(String item){
		this.xpath.setRelatedItem("Division");
		this.switchToIframe();
		this.findElement(this.xpath.getRelatedItem()).click();
		this.waitForLoading(timeout);
	}
	
	public void navigateTo(final String book, final String chapter, final String section) {
		
		this.xpath.setLocation(book, chapter, section);
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
	
	public void setLocation(final String book, final String chapter, final String section) {
		this.xpath.setLocation(book, chapter, section);
	}
	
	public WebElement getNavTestText(final String xpath) {
		this.switchToIframe();
		return this.findElement(xpath);
	}
	
}
