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
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.findElement(XpathUtilsMyAccount.getRealNameInput()).sendKeys("Test");
	}
	
	@Test
	public void testInputAlias(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.findElement(XpathUtilsMyAccount.getAliasInput()).sendKeys("Test");
	}
	
	@Test
	public void testClickChangePasswordLink(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.clickChangePasswordLink();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getChangePasswordInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getVerifyPasswordInput()));
	}
	
	@Test
	public void testEnterTextInChangePasswordInput(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.clickChangePasswordLink();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getChangePasswordInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getVerifyPasswordInput()));
		this.findElement(XpathUtilsMyAccount.getChangePasswordInput()).sendKeys("new password");
	}
	
	@Test
	public void testEnterTextInVerifyPasswordInput(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.clickChangePasswordLink();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getChangePasswordInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getVerifyPasswordInput()));
		this.findElement(XpathUtilsMyAccount.getVerifyPasswordInput()).sendKeys("new password");
	}
	
	@Test
	public void testEnterTextInAccepting(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.enterTextInAccepting(this.searchUserNames[0]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0])));
	}
	
	@Test
	public void testClickAcceptingDropDownArrow(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.clickAcceptingDropDownArrow();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption()));
	}
	
	@Test
	public void testAcceptingContact(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.enterTextInAccepting(this.searchUserNames[0]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0])));
		this.clickContact(this.searchUserNames[0]);
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[0])));
	}
	
	@Test
	public void testAcceptingMultipleContacts(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.enterTextInAccepting(this.searchUserNames[0]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0])));
		this.clickContact(this.searchUserNames[0]);
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[0])));
		this.enterTextInAccepting(this.searchUserNames[1]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[1]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[1])));
		this.clickContact(this.searchUserNames[1]);
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[1])));
	}
	
	@Test
	public void testAcceptingRemoveContact(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.enterTextInAccepting(this.searchUserNames[0]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0])));
		this.clickContact(this.searchUserNames[0]);
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[0])));
		this.removeContact(this.searchUserNames[0]);
		assertFalse(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[0])));
	}
	
	@Test
	public void testAcceptingEveryone(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.clickAcceptingDropDownArrow();
		this.waitForElement(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption());
		assertTrue(this.elementExists(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption()));
		this.clickEveryoneOption();
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Everyone")));
	}
	
	@Test
	public void testEnterTextInIgnoring(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.enterTextInIgnoring(this.searchUserNames[0]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0])));
	}
	
	@Test
	public void testClickIgnoringDropDownArrow(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.clickIgnoringDropDownArrow();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption()));
	}
	
	@Test
	public void testIgnoringContact(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.enterTextInIgnoring(this.searchUserNames[0]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0])));
		this.clickContact(this.searchUserNames[0]);
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[0])));
	}
	
	@Test
	public void testIgnoringMultipleContacts(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.enterTextInAccepting(this.searchUserNames[0]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0])));
		this.clickContact(this.searchUserNames[0]);
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[0])));
		this.enterTextInAccepting(this.searchUserNames[1]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[1]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[1])));
		this.clickContact(this.searchUserNames[1]);
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[1])));
	}
	
	@Test
	public void testIgnoringEveryone(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.clickIgnoringDropDownArrow();
		this.waitForElement(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption());
		this.clickEveryoneOption();
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken("Everyone")));
	}
	
	@Test
	public void testIgnoringRemoveContact(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.enterTextInIgnoring(this.searchUserNames[0]);
		this.waitForElement(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0]));
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameOptions(this.searchUserNames[0])));
		this.clickContact(this.searchUserNames[0]);
		assertTrue(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[0])));
		this.removeContact(this.searchUserNames[0]);
		assertFalse(this.elementExists(XpathUtilsMyAccount.findNameToken(this.searchUserNames[0])));
	}
	
	@Test
	public void testSaveButton(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.clickSaveButton();
		assertFalse(this.elementExists(XpathUtilsMyAccount.getSaveButton()));
	}
	
	@Test
	public void testCancelButton(){
		this.clickOptionsMyAccountButton();
		assertTrue(this.elementExists(XpathUtilsMyAccount.getRealNameInput()));
		assertTrue(this.elementExists(XpathUtilsMyAccount.getAliasInput()));
		this.clickCancelButton();
		assertFalse(this.elementExists(XpathUtilsMyAccount.getCancelButton()));
	}
	
}
