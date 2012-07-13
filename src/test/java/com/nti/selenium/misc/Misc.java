package com.nti.selenium.misc;

import org.junit.Before;

import com.nti.selenium.login.XpathUtilsLogin;
import com.nti.selenium.navigation.Navigation;

public class Misc extends Navigation {

	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
	}
	
	public void clickHomeButton() {
		this.findElement(XpathUtilsMisc.getHome()).click();
	}
	
	public void clickShowMeDropDown() {
		this.findElements(XpathUtilsMisc.dropDownShowMe()).get(1).click();
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
