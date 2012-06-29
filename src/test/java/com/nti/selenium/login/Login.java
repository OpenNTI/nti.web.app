package com.nti.selenium.login;

import com.nti.selenium.Base;
import com.nti.selenium.Xpath;

public class Login extends Base {
	
	protected void doLogin(final String username, final String password) {
		this.waitForElement(Xpath.username, timeout);
		this.findElement(Xpath.username).sendKeys(username);
		this.waitForElement(Xpath.password, timeout);
		this.findElement(Xpath.password).sendKeys(password);
		this.waitForElement(Xpath.loginButton, timeout);
		this.findElement(Xpath.loginButton).click();
		this.waitForLoading(timeout);
	}
	
	protected void doLogout() {
		this.waitForElement(Xpath.options, timeout);
		this.findElement(Xpath.options).click();
		this.waitForElement(Xpath.logoutButton, timeout);
		this.findElement(Xpath.logoutButton).click();
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
