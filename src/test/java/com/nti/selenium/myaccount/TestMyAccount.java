package com.nti.selenium.myaccount;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestMyAccount extends MyAccount{

	@Test
	public void testClickMyAccount(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
	}
	
	@Test
	public void testInputRealName(){
		this.clickOptionsMyAccountButton();
		this.findElement(XpathUtilsMyAccount.getRealNameInput()).sendKeys("Test");
		this.wait_(3);
	}
	
	@Test
	public void testInputAlias(){
		this.clickOptionsMyAccountButton();
		this.findElement(XpathUtilsMyAccount.getAliasInput()).sendKeys("Test");
		this.wait_(3);
	}
	
	@Test
	public void testClickChangePasswordLink(){
		this.clickOptionsMyAccountButton();
		this.clickChangePasswordLink();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getChangePasswordInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getVerifyPasswordInput()));
	}
	
	@Test
	public void testEnterTextInChangePasswordInput(){
		this.clickOptionsMyAccountButton();
		this.clickChangePasswordLink();
		this.findElement(XpathUtilsMyAccount.getChangePasswordInput()).sendKeys("new password");
	}
	
	@Test
	public void testEnterTextInVerifyPasswordInput(){
		this.clickOptionsMyAccountButton();
		this.clickChangePasswordLink();
		this.findElement(XpathUtilsMyAccount.getVerifyPasswordInput()).sendKeys("new password");
	}
	
	@Test
	public void testEnterTextInAccepting(){
		this.clickOptionsMyAccountButton();
		this.enterTextInAccepting("carlos");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez"));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez")));
	}
	
	@Test
	public void testClickAcceptingDropDownArrow(){
		this.clickOptionsMyAccountButton();
		this.clickAcceptingDropDownArrow();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption()));
	}
	
	@Test
	public void testAcceptingContact(){
		this.clickOptionsMyAccountButton();
		this.enterTextInAccepting("carlos");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez"));
		this.clickContact("Carlos Sanchez");
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Carlos Sanchez")));
	}
	
	@Test
	public void testAcceptingMultipleContacts(){
		this.clickOptionsMyAccountButton();
		this.enterTextInAccepting("carlos");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez"));
		this.clickContact("Carlos Sanchez");
		this.enterTextInAccepting("chris");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Chris Utz"));
		this.clickContact("Chris Utz");
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Carlos Sanchez")));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Chris Utz")));
	}
	
	@Test
	public void testAcceptingRemoveContact(){
		this.clickOptionsMyAccountButton();
		this.enterTextInAccepting("carlos");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez"));
		this.clickContact("Carlos Sanchez");
		this.removeContact("Carlos Sanchez");
		assertFalse(this.elementExists(XpathUtilsMyAccount.findNameToken("Carlos Sanchez")));
	}
	
	@Test
	public void testAcceptingEveryone(){
		this.clickOptionsMyAccountButton();
		this.clickAcceptingDropDownArrow();
		this.waitForElement(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption());
		this.clickEveryoneOption();
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Everyone")));
	}
	
	@Test
	public void testEnterTextInIgnoring(){
		this.clickOptionsMyAccountButton();
		this.enterTextInIgnoring("carlos");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez"));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez")));
	}
	
	@Test
	public void testClickIgnoringDropDownArrow(){
		this.clickOptionsMyAccountButton();
		this.clickIgnoringDropDownArrow();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption()));
	}
	
	@Test
	public void testIgnoringContact(){
		this.clickOptionsMyAccountButton();
		this.enterTextInIgnoring("carlos");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez"));
		this.clickContact("Carlos Sanchez");
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Carlos Sanchez")));
	}
	
	@Test
	public void testIgnoringMultipleContacts(){
		this.clickOptionsMyAccountButton();
		this.enterTextInAccepting("carlos");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez"));
		this.clickContact("Carlos Sanchez");
		this.enterTextInAccepting("chris");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Chris Utz"));
		this.clickContact("Chris Utz");
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Carlos Sanchez")));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Chris Utz")));
	}
	
	@Test
	public void testIgnoringEveryone(){
		this.clickOptionsMyAccountButton();
		this.clickIgnoringDropDownArrow();
		this.waitForElement(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption());
		this.clickEveryoneOption();
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Everyone")));
	}
	
	@Test
	public void testIgnoringRemoveContact(){
		this.clickOptionsMyAccountButton();
		this.enterTextInIgnoring("carlos");
		this.waitForElement(XpathUtilsMyAccount.findNameOptions("Carlos Sanchez"));
		this.clickContact("Carlos Sanchez");
		this.removeContact("Carlos Sanchez");
		assertFalse(this.elementExists(XpathUtilsMyAccount.findNameToken("Carlos Sanchez")));
	}
	
	@Test
	public void testSaveButton(){
		this.clickOptionsMyAccountButton();
		this.clickSaveButton();
		assertFalse(this.elementExists(XpathUtilsMyAccount.getSaveButton()));
	}
	
	@Test
	public void testCancelButton(){
		this.clickOptionsMyAccountButton();
		this.clickCancelButton();
		assertFalse(this.elementExists(XpathUtilsMyAccount.getCancelButton()));
	}
	
}
