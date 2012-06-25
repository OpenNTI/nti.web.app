package com.nti.selenium.login;

import com.nti.selenium.Base;

public class Login extends Base {
	
	public void wait_(final double secs) {
		try {
			millis = secs*1000;
			Thread.sleep(millis);
		} catch (final InterruptedException e) {
		}
	}
	
	public boolean waitForLoading(final int timeout)
	{
		int timer = 0;
		while(this.getElement("xpath=//title[@id='loading']") != null && timer <= timeout)
		{
			timer++;
			this.wait_(1);
		}
		this.wait_(1);
		return timer < timeout;
	}
	
	public boolean waitForElement(final String xpath, final int timeout){
		int timer = 0;
		while(this.getElement(xpath) == null && timer < timeout)
		{
			timer++;
			this.wait_(1);
		}
		this.wait_(1);
		return timer <= timeout;
	}
	
	protected void doLogin(final String username, final String password) {
		
		final String usernameXpath = this.xpathAttributeBuilder("input", "name", "username");
		final String passwordXpath = this.xpathAttributeBuilder("input", "name", "password");
		final String buttonXpath = this.xpathAttributeBuilder("button", "id", "submit");
		
		this.waitForElement(usernameXpath, timeout);
		this.getElement(usernameXpath).sendKeys(username);
		this.waitForElement(passwordXpath, timeout);
		this.getElement(passwordXpath).sendKeys(password);
		this.waitForElement(buttonXpath, timeout);
		this.getElement(buttonXpath).click();
		this.waitForLoading(timeout);
	}
	
	protected void doLogout(){
		
		final String optionsXpath = this.xpathAttributeBuilder("div", "class", "my-account-wrapper");
		final String logoutButtonXpath = this.xpathTextBuilder("div", "Sign out");
	
		this.waitForElement(optionsXpath, timeout);
		this.getElement(optionsXpath).click();
		this.waitForElement(logoutButtonXpath, timeout);
		this.getElement(logoutButtonXpath).click();
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
