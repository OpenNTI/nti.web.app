package com.nti.selenium.highlights;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import com.nti.selenium.navigation.Navigation;

public class Highlights extends Navigation {

	protected String[] searchUserNames;
	
	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
		this.searchUserNames = this.getSearchUserNames(2);
	}
	
	@After
	public void tearDown() {
		this.switchToIframe();		
		try {
			while (this.findElements(XpathUtilsHighlights.getCreatedHighlight()).size() > 0)
			{
				this.removeHighlight(this.findElements(XpathUtilsHighlights.getCreatedHighlight()).get(0));
			}
		} catch(final NoSuchElementException e) {
		} finally {
			selenium[1].stop();
		}
	}
	
	public void createHighlight() {
		this.switchToIframe();
		this.selectText(0, 0, 10);
		this.switchToDefault();
		this.findElement(XpathUtilsHighlights.getCreateHighlightButton()).click();
	}
	
	public void removeHighlight(final String xpath) {
		final WebElement element = this.findElement(xpath);
		this.switchToIframe();	
		element.click();
		this.switchToDefault();
		this.findElement(XpathUtilsHighlights.getRemoveHighlightButton()).click();
	}
	
	public void removeHighlight(WebElement element) {
		this.switchToIframe();	
		element.click();
		this.switchToDefault();
		this.findElement(XpathUtilsHighlights.getRemoveHighlightButton()).click();
	}
	
	public void shareHighlight(final String xpath) {
		this.switchToIframe();
		this.findElement(xpath).click();
		this.switchToDefault();
		this.findElement(XpathUtilsHighlights.getShareWithButton()).click();
	}
	
	public void inputSearchForUser(final String username) {
		this.findElement(XpathUtilsHighlights.getShareHighlightInputField()).sendKeys(username);
	}
	
	public void clickSearchResult(final String username) {
		this.findElement(XpathUtilsHighlights.getSearchedForUser(username)).click();
	}
	
	public void clickDropDownArrow() {
		this.findElement(XpathUtilsHighlights.getShareHighlightInputFieldDropDownArrow()).click();
	}
	
	public void clickEveryoneDropDownItem() {
		this.findElement(XpathUtilsHighlights.getEveryoneDropDownItem()).click();
	}
	
	public void clickGroupDropDownItem(final String groupName) {
		this.findElement(XpathUtilsHighlights.getGroupDropDownItem(groupName)).click();
	}
	
	public void clickCloseEveryoneToken() {
		this.findElement(XpathUtilsHighlights.getEveryoneTokenLabelCloseButton()).click();
	}
	
	public void clickCloseUserGroupToken(final String userNameGroupName) {
		this.findElement(XpathUtilsHighlights.getGroupTokenLabelCloseButton(userNameGroupName)).click();
	}
	
	public void clickSaveButton() {
		this.findElement(XpathUtilsHighlights.getShareHighlightSaveButton()).click();
	}
	
	public void clickCancelButton() {
		this.findElement(XpathUtilsHighlights.getShareHighlightCancelButton()).click();
	}
}
