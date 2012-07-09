package com.nti.selenium.login;

import org.junit.Before;

import com.nti.selenium.Base;

public class Login extends Base {
	
	@Before
	public void setUp() throws Exception{
		super.setUp();
	}
	
	protected void doLogin(final String username, final String password) {
		this.waitForElement(XpathUtilsLogin.getUsername());
		this.findElement(XpathUtilsLogin.getUsername()).sendKeys(username);
		this.waitForElement(XpathUtilsLogin.getPassword());
		this.findElement(XpathUtilsLogin.getPassword()).sendKeys(password);
		this.waitForElement(XpathUtilsLogin.getLoginButton());
		this.selenium.click(XpathUtilsLogin.getLoginButton());
//		this.findElement(XpathUtilsLogin.getLoginButton()).click();
		this.waitForLoading();
	}
	
	protected void doLogout() {
		this.waitForElement(XpathUtilsLogin.getOptions());
		this.findElement(XpathUtilsLogin.getOptions()).click();
		this.waitForElement(XpathUtilsLogin.getLogoutButton());
		this.findElement(XpathUtilsLogin.getLogoutButton()).click();
		this.waitForLoading();
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
