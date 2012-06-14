package com.nti.selenium;

import com.thoughtworks.selenium.Selenium;

public class LoginHelper {
	
	Selenium selenium;
	
	public LoginHelper(final Selenium selenium) {
		this.selenium = selenium;
	}
	
	public void wait_(final int secs) {
		Thread.currentThread().sleep(secs * 1000)
	}
	
	public boolean waitForLoading(final int timeout)
	{
		while(this.waitForElement("xpath=//title[@id='loading']", 1) && timeout > 0)
		{
			timeout--;
			this.wait_(1)
		}
		return timeout > 0;
	}
	
	public boolean waitForElement(final String xpath, final int timeout){
		while(!this.selenium.isElementPresent(xpath) && timemout > 0)
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
			this.selenium.type(xpath, ""+key);
		}
	}
	
	public void login() {
		
		final int timeout = 10;
		
		final String usernameXpath = "xpath=//input[@name='username']";
		final String passwordXpath = "xpath=//input[@name='password']";
		final String buttonXpath = "xpath=//button[@id='submit']";
		
		this.selenium.waitForPageToLoad("10000");
		this.waitForElement(usernameXpath, timeout);
		this.selenium.type(usernameXpath, "logan.testi@nextthought.com");
		this.waitForElement(passwordXpath, timeout);
		this.selenium.type(passwordXpath, "logan.testi");
		this.waitForElement(buttonXpath, timeout);
		this.selenium.click(buttonXpath);
		this.waitForLoading(timeout);
	}
	
}
