package com.nti.selenium.chat;

import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.WebElement;

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
		this.setActiveSelenium(selenium2);
		this.setActiverDriver(this.driver2);
		this.doLogin(credentials[1].getUserName(), credentials[1].getPassword());
		this.driver3 = Chat.createDriver(Chat.browser);
		this.selenium3 = new WebDriverBackedSelenium(driver3, url);
		this.selenium3.open(url);
		this.setActiveSelenium(selenium3);
		this.setActiverDriver(this.driver3);
		this.doLogin(credentials[2].getUserName(), credentials[2].getPassword());
		this.setActiverDriver(this.driver1);
		this.addPeopleToGroup(searchUserNames[1], searchUserNames[2]);
		this.setActiverDriver(this.driver2);
		this.addPeopleToGroup(searchUserNames[0], searchUserNames[2]);
		this.setActiverDriver(this.driver3);
		this.addPeopleToGroup(searchUserNames[0], searchUserNames[1]);
 		this.setActiverDriver(driver1);
 		this.setActiveSelenium(selenium1);
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
		this.setActiverDriver(this.driver3);
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
			selenium3.stop(); 
		}
	}
	
	public void startChat(){
		this.findElement(XpathUtilsChat.getGroupsTab()).click();
		this.waitForElement(XpathUtilsChat.getIndividualGroups());
		List<WebElement> elements = this.findElements(XpathUtilsChat.getIndividualGroups());
		elements.get(elements.size()-1).click();
	}
	
	public void sendMessage(String message){
		this.findElement(XpathUtilsChat.getChatInputField()).sendKeys(message + "\r");
	}
	
}
