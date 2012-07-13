package com.nti.selenium.myaccount;

import com.nti.selenium.login.Login;
import com.nti.selenium.login.XpathUtilsLogin;

public class MyAccount extends Login{

	public void clickOptionsMyAccountButton(){
		this.findElement(XpathUtilsLogin.getOptions()).click();
		this.waitForElement(XpathUtilsMyAccount.getMyAccountButton());
		this.findElement(XpathUtilsMyAccount.getMyAccountButton()).click();
	}
	
	public void clickChangePasswordLink(){
		this.findElement(XpathUtilsMyAccount.getChangePasswordLink()).click();
	}
	
	public void enterTextInAccepting(String name){
		this.findElements(XpathUtilsMyAccount.getMyAccountOtherPeopleInput()).get(2).sendKeys(name);
	}
	
	public void enterTextInIgnoring(String name){
		this.findElements(XpathUtilsMyAccount.getMyAccountOtherPeopleInput()).get(3).sendKeys(name);
	}
	
	public void clickAcceptingDropDownArrow(){
		this.findElements(XpathUtilsMyAccount.getMyAccountOtherPeopleDropDownArrow()).get(2).click();
	}
	
	public void clickIgnoringDropDownArrow(){
		this.findElements(XpathUtilsMyAccount.getMyAccountOtherPeopleDropDownArrow()).get(3).click();
	}
	
	public void clickContact(String name){
		this.findElement(XpathUtilsMyAccount.findNameOptions(name)).click();
	}
	
	public void removeContact(String name){
		this.findElement(XpathUtilsMyAccount.findNameTokenXButton(name)).click();
	}
	
	public void clickEveryoneOption(){
		this.findElement(XpathUtilsMyAccount.getMyAccountOtherPeopleEveryoneOption()).click();
	}
	
	public void clickSaveButton(){
		this.findElement(XpathUtilsMyAccount.getSaveButton()).click();
	}
	
	public void clickCancelButton(){
		this.findElement(XpathUtilsMyAccount.getCancelButton()).click();
	}
	
}
