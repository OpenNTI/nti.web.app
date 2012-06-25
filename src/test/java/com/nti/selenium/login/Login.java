package com.nti.selenium.login;

import com.nti.selenium.Base;

public class Login extends Base {
	
	protected void doLogin(final String username, final String password) {
		
		final String usernameXpath = this.xpathAttributeBuilder("input", "name", "username");
		final String passwordXpath = this.xpathAttributeBuilder("input", "name", "password");
		final String buttonXpath = this.xpathAttributeBuilder("button", "id", "submit");
		
		this.waitForElement(usernameXpath, timeout);
		this.findElement(usernameXpath).sendKeys(username);
		this.waitForElement(passwordXpath, timeout);
		this.findElement(passwordXpath).sendKeys(password);
		this.waitForElement(buttonXpath, timeout);
		this.findElement(buttonXpath).click();
		this.waitForLoading(timeout);
	}
	
	protected void doLogout(){
		final String optionsXpath = this.xpathAttributeBuilder("div", "class", "my-account-wrapper");
		final String logoutButtonXpath = this.xpathTextBuilder("div", "Sign out");
	
		this.waitForElement(optionsXpath, timeout);
		this.findElement(optionsXpath).click();
		this.waitForElement(logoutButtonXpath, timeout);
		this.findElement(logoutButtonXpath).click();
		this.waitForLoading(timeout);
	}

	public void login(final String username, final String password) {
		this.doLogin(username, password);
	}
	
	public void login() {
		final String username = credentials[0].getUserName();
		final String password = credentials[0].getPassword();
		this.doLogin(username, password);
	}
	
	public void logout() {
		this.login();
		this.doLogout();
	}
}
