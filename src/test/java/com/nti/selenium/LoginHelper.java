package com.nti.selenium;

public class LoginHelper extends Base{
	
	public void wait_(final int secs) {
		try {
			Thread.currentThread();
			Thread.sleep(secs * 1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
	
	public boolean waitForLoading(int timeout)
	{
		while(this.waitForElement("xpath=//title[@id='loading']", 1) && timeout > 0)
		{
			timeout--;
			this.wait_(1);
		}
		return timeout > 0;
	}
	
	public boolean waitForElement(final String xpath, int timeout){
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
		for(final char key: keys)
		{
			selenium.type(xpath, ""+key);
		}
	}
	
	public void login(String username, String password){
		
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
	
	private void _logout(){
		
		String optionsXpath = "xpath=//div[@class='my-account-wrapper']";
		String logoutButtonXpath = "xpath=//div[text()='Sign out']";
		
		this.waitForElement(optionsXpath, this.timeout);
		selenium.click(optionsXpath);
		this.waitForElement(logoutButtonXpath, this.timeout);
		selenium.click(logoutButtonXpath);
		this.waitForLoading(this.timeout);
	}
	
	public void login(String password){
		this.login(credentials.get(0).get(0), password);
	}
	
	public void login(){
		this.login(credentials.get(0).get(1));
	}
	
	public void logout(){
		this.login();
		this._logout();
		this.wait_(3);
	}
	
}
