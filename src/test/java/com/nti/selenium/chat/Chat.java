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
		this.setActiverDriver(this.driver1);
		this.addPeopleToGroup(searchUserNames[1]);
		this.setActiverDriver(this.driver2);
		this.addPeopleToGroup(searchUserNames[0]);
		this.setActiverDriver(driver1);
		this.findElement(XpathUtilsChat.getGroupsTab()).click();
		this.waitForElement(XpathUtilsChat.getIndividualGroups());
		this.findElements(XpathUtilsChat.getIndividualGroups()).get(0).click();
		System.out.println("end setup");
	}
	
	@After
	public void tearDown() {
		super.tearDown();
		this.setActiverDriver(this.driver2);
		try{ 
			this.removeGroups();
		}
		catch (Exception e)
		{ 
			System.out.println("Unable to remove groups/deleting test");
			System.out.println(e.getMessage());
		}
		finally 
		{
			selenium2.stop(); 
		}
	}
	
}
