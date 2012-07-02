package com.nti.selenium.login;

import org.junit.Before;

import com.nti.selenium.Base;

public class Login extends Base {
	
	protected XpathUtilsLogin xpath;
	
	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.xpath = new XpathUtilsLogin();
	}
	
	protected void doLogin(final String username, final String password) {
		this.waitForElement(this.xpath.getUsername(), timeout);
		this.findElement(this.xpath.getUsername()).sendKeys(username);
		this.waitForElement(this.xpath.getPassword(), timeout);
		this.findElement(this.xpath.getPassword()).sendKeys(password);
		this.waitForElement(this.xpath.getLoginButton(), timeout);
		this.findElement(this.xpath.getLoginButton()).click();
		this.waitForLoading(timeout);
	}
	
	protected void doLogout() {
		this.waitForElement(this.xpath.getOptions(), timeout);
		this.findElement(this.xpath.getOptions()).click();
		this.waitForElement(this.xpath.getLogoutButton(), timeout);
		this.findElement(this.xpath.getLogoutButton()).click();
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
