package com.nti.selenium.chat;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.nti.selenium.XpathUtils;
import com.nti.selenium.login.Login;
import com.nti.selenium.login.XpathUtilsLogin;
import com.thoughtworks.selenium.Selenium;

public class Chat extends Login {

	WebDriver driver2;
	Selenium selenium2;
	
	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.driver2 = new FirefoxDriver();
		this.selenium2 = new WebDriverBackedSelenium(driver2, url);
		this.selenium2.open(url);
		this.doLogin("pacifique.mahoro@nextthought.com", "pacifique.mahoro");
		this.doLoginSecondDriver("logan.testi@nextthought.com", "logan.testi");
	}
	
	@After
	public void tearDown(){
		this.selenium.stop();
		this.selenium2.stop();
	}
	
	protected void doLoginSecondDriver(final String username, final String password) {
		this.waitForElement2(XpathUtilsLogin.getUsername());
		this.findElement2(XpathUtilsLogin.getUsername()).sendKeys(username);
		this.waitForElement2(XpathUtilsLogin.getPassword());
		this.findElement2(XpathUtilsLogin.getPassword()).sendKeys(password);
		this.waitForElement2(XpathUtilsLogin.getLoginButton());
		this.findElement2(XpathUtilsLogin.getLoginButton()).click();
		this.waitForLoading2();
	}
	
	private WebElement findElement2(final String xpath) throws NoSuchElementException {
		return this.driver2.findElement(By.xpath(xpath));
	}
	
	private boolean elementExists2(final String xpath) {
		try{
			this.findElement2(xpath);
			return true;
		} catch (final NoSuchElementException e) {
			return false;
		}
	}
	
	private boolean waitForLoading2() {
		return waitForLoading(DEFAULT_TIMEOUT);
	}
	
	private boolean waitForElement2(final String xpath) {
		return this.waitForElement2(xpath, DEFAULT_TIMEOUT);
	}
	
	private boolean waitForElement2(final String xpath, final int timeout) {
		int timer = 0;
		while(!this.elementExists2(xpath) && timer < timeout)
		{
			timer++;
			this.wait_(1);
		}
		this.wait_(1);
		return timer <= timeout;
	}
	
}
