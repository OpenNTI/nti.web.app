package com.nti.selenium.login;

import com.nti.selenium.Base;

public class Login extends Base{
	
	public void wait_(final int secs) {
		try {
			Thread.sleep(secs * 1000);
		} catch (final InterruptedException e) {
			e.printStackTrace();
		}
	}
	
	public boolean waitForLoading(final int timeout)
	{
		while(this.waitForElement("xpath=//title[@id='loading']", 1) && timeout > 0)
		{
			timeout--;
			this.wait_(1);
		}
		return timeout > 0;
	}
	
	public boolean waitForElement(final String xpath, final int timeout){
		while(!selenium.isElementPresent(xpath) && timeout > 0)
		{
			this.wait_(1);
			timeout--;
		}
		this.wait_(1);
		return timeout > 0;
	}
	
	public void typeKeys(final String xpath, final String text){
		final char[] keys = text.toCharArray();
		for(int i = 0; i < keys.length; i++)
		{
			key = keys[i];
			selenium.type(xpath, ""+key);
		}
	}
	
	public void login(final String username, final String password) {
		
		final String usernameXpath = "xpath=//input[@name='username']";
		final String passwordXpath = "xpath=//input[@name='password']";
		final String buttonXpath = "xpath=//button[@id='submit']";
		
		selenium.waitForPageToLoad("10000");
		this.waitForElement(usernameXpath, this.timeout);
		selenium.type(usernameXpath, username);
		this.waitForElement(passwordXpath, this.timeout);
		selenium.type(passwordXpath, password);
		this.waitForElement(buttonXpath, this.timeout);
		selenium.click(buttonXpath);
		this.waitForLoading(this.timeout);
	}
	
	protected void do_logout() {
		
		final String optionsXpath = "xpath=//div[@class='my-account-wrapper']";
		final String logoutButtonXpath = "xpath=//div[text()='Sign out']";
		
		this.waitForElement(optionsXpath, this.timeout);
		selenium.click(optionsXpath);
		this.waitForElement(logoutButtonXpath, this.timeout);
		selenium.click(logoutButtonXpath);
		this.waitForLoading(this.timeout);
	}
	
	public void login(final String password){
		this.login(credentials.get(0).get(0), password);
	}
	
	public void login() {
		this.login(credentials.get(0).get(1));
	}
	
	public void logout() {
		this.login();
		this.do_logout();
		this.wait_(3);
	}
	
}
