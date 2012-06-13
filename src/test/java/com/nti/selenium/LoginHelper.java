package com.nti.selenium;

import com.thoughtworks.selenium.Selenium;

public class LoginHelper {
	
	Selenium selenium;
	
	public LoginHelper(Selenium selenium){
		this.selenium = selenium;
	}
	
	public void wait_(int timeToWait){
		long time = System.currentTimeMillis() + timeToWait * 1000;
		while(time > System.currentTimeMillis()){
		}
	}
	
	public boolean waitForLoading(int timeout){
		while(this.waitForElement("xpath=//title[text()='NextThought App']", 1)){
			timeout--;
			if(timeout <= 0){
				return false;
			}
		}
		return true;
	}
	
	public boolean waitForElement(String xpath, int timeout){
		while(!this.selenium.isElementPresent(xpath)){
			this.wait_(1);
			timeout--;
			if(timeout <= 0){
				return false;
			}
		}
		this.wait_(1);
		return true;
	}
	
	public void typeKeys(String xpath, String text){
		char[] keys = text.toCharArray();
		for(char key: keys){
			this.selenium.type(xpath, ""+key);
		}
	}
	
	public void login(){
		
		int timeout = 10;
		
		String usernameXpath = "xpath=//input[@name='username']";
		String passwordXpath = "xpath=//input[@name='password']";
		String buttonXpath = "xpath=//button[@id='submit']";
		
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
