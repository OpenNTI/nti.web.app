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
		this.driver[2] = Chat.createDriver(Chat.browser);
		this.selenium[2] = new WebDriverBackedSelenium(driver[2], url);
		this.selenium[2].open(url);
		this.setActiveSelenium(selenium[2]);
		this.setActiverDriver(this.driver[2]);
		this.doLogin(credentials[1].getUserName(), credentials[1].getPassword());
		this.driver[3] = Chat.createDriver(Chat.browser);
		this.selenium[3] = new WebDriverBackedSelenium(driver[3], url);
		this.selenium[3].open(url);
		this.setActiveSelenium(selenium[3]);
		this.setActiverDriver(this.driver[3]);
		this.doLogin(credentials[2].getUserName(), credentials[2].getPassword());
		this.setActiverDriver(this.driver[1]);
		this.groups[1] = this.addPeopleToGroup(searchUserNames[1], searchUserNames[2]);
		this.setActiverDriver(this.driver[2]);
		this.groups[2] = this.addPeopleToGroup(searchUserNames[0], searchUserNames[2]);
		this.setActiverDriver(this.driver[3]);
		this.groups[3] = this.addPeopleToGroup(searchUserNames[0], searchUserNames[1]);
 		this.setActiverDriver(driver[1]);
 		this.setActiveSelenium(selenium[1]);
	}
	
	@After
	public void tearDown() {
		super.tearDown();
		this.setActiverDriver(this.driver[2]);
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
			selenium[2].stop(); 
		}
		this.setActiverDriver(this.driver[3]);
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
			selenium[3].stop(); 
		}
	}
	
	public void startChat(){
		this.findElement(XpathUtilsChat.getGroupsTab()).click();
		this.waitForElement(XpathUtilsChat.getIndividualGroups());
		List<WebElement> elements = this.findElements(XpathUtilsChat.getIndividualGroups());
		elements.get(elements.size()-1).click();
	}
	
	public void sendMessage(String message){
		this.findElement(XpathUtilsChat.getChatInputField()).sendKeys(XpathUtilsChat.buildString(message, "\r"));
	}
	
	public void clickAddUserButton(String chatName){
		this.findElement(XpathUtilsChat.getAddPersonButton(chatName)).click();
	}
	
	public void clickMinimizeButton(String chatName){
		this.findElement(XpathUtilsChat.getMinimizeButton(chatName)).click();
	}
	
	public void clickMinimizedChat(String chatName){
		this.findElement(XpathUtilsChat.getMinimizedChat(chatName)).click();
	}
	
	public void clickChatCloseButton(String chatName){
		this.findElement(XpathUtilsChat.getCloseChatButton(chatName)).click();
	}
	
	public void clickMinimizedChatCloseButton(String chatName){
		this.findElement(XpathUtilsChat.getCloseChatMinimized(chatName)).click();
	}
	
	public void startGroupChat(String groupName){
		this.findElement(XpathUtilsChat.getGroupsTab()).click();
		this.waitForElement(XpathUtilsChat.getIndividualGroups());
		this.findElement(XpathUtilsChat.getGroupChatButton(groupName)).click();
	}
	
}
