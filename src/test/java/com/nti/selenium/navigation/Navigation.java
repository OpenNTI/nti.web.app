package com.nti.selenium.navigation;

import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.Xpath;
import com.nti.selenium.login.Login;

public class Navigation extends Login {
	
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
		this.waitForElement(xpath, timeout);
		this.findElement(xpath).click();
	}
	
	public void openLibrary() {
		this.switchToDefault();
		this.waitForLoading(timeout);
		this.openLevel(Xpath.library);
	}
	
	public void openBook() {
		this.switchToDefault();
		this.waitForElement(Xpath.book, timeout);
		this.openLevel(Xpath.book);
	}
	
	public void openChapter() {
		this.switchToDefault();
		this.openLevelClick(Xpath.chapter);
	}
	
	public void openSection() {
		this.switchToDefault();
		this.openLevelClick(Xpath.section);
		this.openBook();
		this.waitForLoading(timeout);
	}
	
	public void clickArrowBackButton() {
		this.switchToDefault();
		this.findElement(Xpath.backArrow).click();
		this.waitForLoading(timeout);
	}
	
	public void clickArrowForwardButton() {
		this.switchToDefault();
		this.findElement(Xpath.forwardArrow).click();
		this.waitForLoading(timeout);
	}
	
	public void navigateTo(final String book, final String chapter, final String section) {
		
		Xpath.setLocation(book, chapter, section);
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
		Xpath.setLocation(book, chapter, section);
	}
	
	public WebElement getNavTestText(final String xpath) {
		this.switchToIframe();
		return this.findElement(xpath);
	}
}
