package com.nti.selenium.misc;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebElement;

import com.nti.selenium.login.XpathUtilsLogin;
import com.nti.selenium.navigation.XpathUtilsNav;

public class TestMisc extends Misc{

	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
	}
	
	// home button test
	
	@Test
	public void testClickNextThoughtButton(){
		this.clickHomeButton();
		assertTrue(this.elementExists(XpathUtilsMisc.atHomePanel()));
	}
	
	// navigation tests
	
	@Test
	public void testClickChapterDropDown(){
		this.clickChapterDropDown();
		assertTrue(this.getListCount() > 0);
	}
	
	@Test
	public void testClickOnChapter(){
		this.clickChapterDropDown();
		assertTrue(this.getListCount() > 0);
		String title = this.getListItemTitle(0);
		this.clickListItem(0);
		assertEquals(title, this.getNavTestText(XpathUtilsNav.getSectionPageTitle(title)).getText());
	}
	
	@Test
	public void testClickSectionDropDown(){
		this.clickSectionDropDown();
		assertTrue(this.getListCount() > 0);
	}
	
	@Test
	public void testClickOnSection(){
		this.clickSectionDropDown();
		assertTrue(this.getListCount() > 0);
		String title = this.getListItemTitle(0);
		this.clickListItem(0);
		assertEquals(title, this.getNavTestText(XpathUtilsNav.getSectionPageTitle(title)).getText());
	}
	
	// Show me tests
	
	@Test
	public void testClickShowMeDropDown(){
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
	}
	
	@Test
	public void testClickOnDropDownItem(){
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
		this.clickListItem("Highlights");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Highlights"));
	}
	
	@Test
	public void testClickMultipleDropDownItems(){
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
		assertFalse(this.isChecked("Notes"));
		this.clickListItem("Highlights");
		this.clickListItem("Notes");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Highlights"));
		assertTrue(this.isChecked("Notes"));
	}
	
	@Test
	public void testClickOnDropDownItemSwitchBackToEverything(){
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
		this.clickListItem("Highlights");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Highlights"));
		this.clickListItem("Everything");
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
	}
	
	@Test
	public void testClickSelectAllItems(){
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
		assertFalse(this.isChecked("Notes"));
		assertFalse(this.isChecked("Transcripts"));
		assertFalse(this.isChecked("Quiz Results"));
		this.clickListItem("Highlights");
		this.clickListItem("Notes");
		this.clickListItem("Transcripts");
		this.clickListItem("Quiz Results");
		assertTrue(this.isChecked("Highlights"));
		assertTrue(this.isChecked("Notes"));
		assertTrue(this.isChecked("Transcripts"));
		assertTrue(this.isChecked("Quiz Results"));
	}
	
	@Test
	public void testClickMe(){
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everyone"));
		assertFalse(this.isChecked("Me"));
		this.clickListItem("Me");
		assertFalse(this.isChecked("Everyone"));
		assertTrue(this.isChecked("Me"));
	}
	
	@Test
	public void testClickMeBackToEveryone(){
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everyone"));
		assertFalse(this.isChecked("Me"));
		this.clickListItem("Me");
		assertFalse(this.isChecked("Everyone"));
		assertTrue(this.isChecked("Me"));
		this.clickListItem("Everyone");
		assertTrue(this.isChecked("Everyone"));
		assertFalse(this.isChecked("Me"));
	}
	
	// My Acount tests
	
	@Test
	public void testClickMyAccount(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMisc.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMisc.getAliasInput()));
	}
	
	@Test
	public void testInputRealName(){
		this.clickOptionsMyAccountButton();
		this.findElement(XpathUtilsMisc.getRealNameInput()).sendKeys("Test");
		this.wait_(3);
	}
	
	@Test
	public void testInputAlias(){
		this.clickOptionsMyAccountButton();
		this.findElement(XpathUtilsMisc.getAliasInput()).sendKeys("Test");
		this.wait_(3);
	}
	
	@Test
	public void testClickChangePasswordLink(){
		this.clickOptionsMyAccountButton();
		this.clickChangePasswordLink();
		assertTrue(this.elementExists(XpathUtilsMisc.getChangePasswordInput()));
		assertTrue(this.elementExists(XpathUtilsMisc.getVerifyPasswordInput()));
	}
	
	@Test
	public void testEnterTextInChangePasswordInput(){
		this.clickOptionsMyAccountButton();
		this.clickChangePasswordLink();
		this.findElement(XpathUtilsMisc.getChangePasswordInput()).sendKeys("new password");
	}
	
	@Test
	public void testEnterTextInVerifyPasswordInput(){
		this.clickOptionsMyAccountButton();
		this.clickChangePasswordLink();
		this.findElement(XpathUtilsMisc.getVerifyPasswordInput()).sendKeys("new password");
	}
	
	@Test
	public void testEnterTextInAccepting(){
		this.clickOptionsMyAccountButton();
		this.enterTextInAccepting("carlos");
		this.waitForElement(XpathUtilsMisc.findNameOptions("Carlos Sanchez"));
		assertTrue(this.elementExists(XpathUtilsMisc.findNameOptions("Carlos Sanchez")));
	}
	
	@Test
	public void testAcceptingContact(){
		this.clickOptionsMyAccountButton();
		this.enterTextInAccepting("carlos");
		this.waitForElement(XpathUtilsMisc.findNameOptions("Carlos Sanchez"));
		this.clickContact("Carlos Sanchez");
		assertTrue(this.elementExists(XpathUtilsMisc.findNameToken("Carlos Sanchez")));
	}
	
	@Test
	public void testClickAcceptingDropDownArrow(){
		this.clickOptionsMyAccountButton();
		this.clickAcceptingDropDownArrow();
		assertTrue(this.elementExists(XpathUtilsMisc.getMyAccountOtherPeopleEveryoneOption()));
	}
	
	@Test
	public void testAcceptingEveryone(){
		this.clickOptionsMyAccountButton();
		this.clickAcceptingDropDownArrow();
		this.waitForElement(XpathUtilsMisc.getMyAccountOtherPeopleEveryoneOption());
		this.clickEveryoneOption();
		assertTrue(this.elementExists(XpathUtilsMisc.findNameToken("Everyone")));
	}
	
	
	@Test
	public void testEnterTextInIgnoring(){
		this.clickOptionsMyAccountButton();
		this.enterTextInIgnoring("carlos");
		this.waitForElement(XpathUtilsMisc.findNameOptions("Carlos Sanchez"));
		assertTrue(this.elementExists(XpathUtilsMisc.findNameOptions("Carlos Sanchez")));
	}
	
	@Test
	public void testIgnoringContact(){
		this.clickOptionsMyAccountButton();
		this.enterTextInIgnoring("carlos");
		this.waitForElement(XpathUtilsMisc.findNameOptions("Carlos Sanchez"));
		this.clickContact("Carlos Sanchez");
		assertTrue(this.elementExists(XpathUtilsMisc.findNameToken("Carlos Sanchez")));
	}
	
	@Test
	public void testClickIgnoringDropDownArrow(){
		this.clickOptionsMyAccountButton();
		this.clickIgnoringDropDownArrow();
		assertTrue(this.elementExists(XpathUtilsMisc.getMyAccountOtherPeopleEveryoneOption()));
	}
	
	@Test
	public void testIgnoringEveryone(){
		this.clickOptionsMyAccountButton();
		this.clickIgnoringDropDownArrow();
		this.waitForElement(XpathUtilsMisc.getMyAccountOtherPeopleEveryoneOption());
		this.clickEveryoneOption();
		assertTrue(this.elementExists(XpathUtilsMisc.findNameToken("Everyone")));
	}
	
}
