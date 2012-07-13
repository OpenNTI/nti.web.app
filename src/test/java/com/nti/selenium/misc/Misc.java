package com.nti.selenium.misc;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.login.XpathUtilsLogin;
import com.nti.selenium.navigation.Navigation;

public class Misc extends Navigation {

	@Before
	public void setUp() throws Exception{
		super.setUp();
	}
	
	public void clickHomeButton() {
		this.findElement(XpathUtilsMisc.getHome()).click();
	}
	
	public void clickChapterDropDown() {
		this.findElement(XpathUtilsMisc.dropDownChapter()).click();
	}
	
	public void clickSectionDropDown() {
		this.findElements(XpathUtilsMisc.dropDownSection()).get(0).click();
	}
	
	public void clickShowMeDropDown() {
		this.findElements(XpathUtilsMisc.dropDownShowMe()).get(1).click();
	}
	
	private WebElement[] getElementArray(final WebElement... allElements) {
		final List<WebElement> chapterElements = new ArrayList<WebElement>();
		this.wait_(1);
		for (final WebElement element: allElements)
		{
			if (element.getAttribute("id").matches("menu(check)?item-\\d{4,}")){
				chapterElements.add(element);
			}
		}
		return chapterElements.toArray(new WebElement[chapterElements.size()]);
	}
	
	public int getListCount() {
		final List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		final WebElement[] elements = new WebElement[allElements.size()];
		return this.getElementArray(allElements.toArray(elements)).length;
	}
	
	public String getListItemTitle(final int chapterNum) {
		final List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		final WebElement[] elements = new WebElement[allElements.size()];
		final WebElement element = this.getElementArray(allElements.toArray(elements))[chapterNum];
		return element.getText();
	}
	
	public void clickListItem(final String itemName) {
		final List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		final WebElement[] elements = new WebElement[allElements.size()];
		final WebElement[] selectableElements = this.getElementArray(allElements.toArray(elements));
		for (final WebElement element: selectableElements)
		{
			if(element.getText().equals(itemName)){
				element.click();
				break;
			}
		}
		this.waitForLoading();
	}
	
	public void clickListItem(final int chapterNum) {
		final List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		final WebElement[] elements = new WebElement[allElements.size()];
		final WebElement element = this.getElementArray(allElements.toArray(elements))[chapterNum];
		element.click();
		this.waitForLoading();
	}
	
	public void clickOptionsMyAccountButton() {
		this.findElement(XpathUtilsLogin.getOptions()).click();
		this.waitForElement(XpathUtilsMisc.getMyAccountButton());
		this.findElement(XpathUtilsMisc.getMyAccountButton()).click();
	}
	
	public void clickChangePasswordLink() {
		this.findElement(XpathUtilsMisc.getChangePasswordLink()).click();
	}
	
	public void enterTextInAccepting(final String name) {
		this.findElements(XpathUtilsMisc.getMyAccountOtherPeopleInput()).get(2).sendKeys(name);
	}
	
	public void enterTextInIgnoring(final String name) {
		this.findElements(XpathUtilsMisc.getMyAccountOtherPeopleInput()).get(3).sendKeys(name);
	}
	
	public void clickAcceptingDropDownArrow() {
		this.findElements(XpathUtilsMisc.getMyAccountOtherPeopleDropDownArrow()).get(2).click();
	}
	
	public void clickIgnoringDropDownArrow() {
		this.findElements(XpathUtilsMisc.getMyAccountOtherPeopleDropDownArrow()).get(3).click();
	}
	
	public void clickContact(final String name) { 
		this.findElement(XpathUtilsMisc.findNameOptions(name)).click();
	}
	
	public void removeContact(final String name) {
		this.findElement(XpathUtilsMisc.findNameTokenXButton(name)).click();
	}
	
	public void clickEveryoneOption() {
		this.findElement(XpathUtilsMisc.getMyAccountOtherPeopleEveryoneOption()).click();
	}
	
	public void clickSaveButton() {
		this.findElement(XpathUtilsMisc.getSaveButton()).click();
	}
	
	public void clickCancelButton() {
		this.findElement(XpathUtilsMisc.getCancelButton()).click();
	}
	
	public void clickOptionsPrivacyButton() {
		this.findElement(XpathUtilsLogin.getOptions()).click();
		this.waitForElement(XpathUtilsMisc.getMyAccountButton());
		this.findElement(XpathUtilsMisc.getPrivacyButton()).click();
	}
	
	public void clickOptionsPrivacyCloseButton() {
		this.findElement(XpathUtilsMisc.getPrivacyCloseButton()).click();
	}
	
	public boolean isPrivacyWindowVisable() {
		final String clazz = this.findElement(XpathUtilsMisc.getPrivacyWindowStatus()).getAttribute("class");
		return clazz.matches(".*x-hide-offsets");
	}
}
