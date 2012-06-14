package com.nti.selenium.login;

import com.nti.selenium.Base;

public class Login extends Base{
	
	public void wait_(final int secs) {
		try {
			Thread.sleep(secs);
		} catch (final InterruptedException e) {
			e.printStackTrace();
		}
	}
	
	public boolean waitForLoading(final int timeout)
	{
		double timer = 0;
		while(selenium.isElementPresent("xpath=//title[@id='loading']") && timer <= timeout)
		{
			timer++;
			this.wait_(1000);
		}
		this.wait_(1000);
		return timer < timeout;
	}
	
	public boolean waitForElement(final String xpath, final int timeout){
		int timer = 0;
		while((!selenium.isElementPresent(xpath)) && timer < timeout)
		{
			timer++;
			this.wait_(1000);
		}
		this.wait_(1000);
		return timer <= timeout;
	}
	
	protected void doLogin(String username, String password){
		
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
	
	protected void doLogout(){
		
		final String optionsXpath = "xpath=//div[@class='my-account-wrapper']";
		final String logoutButtonXpath = "xpath=//div[text()='Sign out']";
		
		this.waitForElement(optionsXpath, this.timeout);
		selenium.click(optionsXpath);
		this.waitForElement(logoutButtonXpath, this.timeout);
		selenium.click(logoutButtonXpath);
		this.waitForLoading(this.timeout);
	}

	public void login(String username, String password){
		this.doLogin(username, password);
	}
	
	public void login() {
		String[] credential = credentials.getFirstUser();
		this.doLogin(credential[0], credential[1]);
	}
	
	public void logout() {
		this.login();
		this.doLogout();
	}
	
}
