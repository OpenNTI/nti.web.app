package com.nti.selenium.chat;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.WebDriverBackedSelenium;

import com.nti.selenium.groups.Groups;

public class Chat extends Groups {
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		credentials = this.getUsersEmails(3);
		searchUserNames = this.getSearchUserNames(3);
		this.driver2 = Chat.createDriver(Chat.browser);
		this.selenium2 = new WebDriverBackedSelenium(driver2, url);
		this.selenium2.open(url);
		this.setActiverDriver(this.driver2);
		this.doLogin(credentials[1].getUserName(), credentials[1].getPassword());
		this.wait_(3);
		this.setActiverDriver(this.driver1);
		this.addPeopleToGroup(searchUserNames[1]);
		this.wait_(3);
		this.setActiverDriver(this.driver2);
		this.addPeopleToGroup(searchUserNames[0]);
		this.setActiverDriver(driver1);
		this.findElement("//span[text()='Groups']").click();
		this.findElements("//div[@class='x-container contact-card x-container-default']").get(0).click();
		this.wait_(5);
		this.findElements("//div[@class='x-container contact-card x-container-default']").get(0).click();
	}
	
	@After
	public void tearDown() {
		this.selenium1.stop();
		this.selenium2.stop();
	}
	
}
