package com.nti.selenium.login;

import org.openqa.selenium.By;

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
		while((driver.findElement(By.xpath(xpath)) == null) && timer < timeout)
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
		
		By x = By.xpath(usernameXpath);
		driver.findElement(x);
		
//		selenium.waitForPageToLoad("10000");
		this.waitForElement(usernameXpath, timeout);
		driver.findElement(By.xpath(usernameXpath)).sendKeys(username);
		this.waitForElement(passwordXpath, timeout);
		driver.findElement(By.xpath(passwordXpath)).sendKeys(password);
		this.waitForElement(buttonXpath, timeout);
		driver.findElement(By.xpath(buttonXpath)).click();
		this.waitForLoading(timeout);
	}
	
	protected void doLogout(){
		
		final String optionsXpath = "xpath=//div[@class='my-account-wrapper']";
		final String logoutButtonXpath = "xpath=//div[text()='Sign out']";
		
		this.waitForElement(optionsXpath, timeout);
		selenium.click(optionsXpath);
		this.waitForElement(logoutButtonXpath, timeout);
		selenium.click(logoutButtonXpath);
		this.waitForLoading(timeout);
		wait_(1000);
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
