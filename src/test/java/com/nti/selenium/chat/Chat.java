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
		
		for (int i=2; i<=3; i++)
		{
			this.driver[i] = Chat.createDriver(Chat.browser);
			this.selenium[i] = new WebDriverBackedSelenium(driver[i], url);
			this.selenium[i].open(url);
			this.setActiveSelenium(this.selenium[i]);
			this.setActiverDriver(this.driver[i]);
			this.doLogin(credentials[i-1].getUserName(), credentials[i-1].getPassword());
		}
		
		for (int i=1; i<=3; i++)
		{
			this.setActiverDriver(this.driver[i]);
			final String[] friends = new String[2];
			for (int j=1, k=0 ; j <=3; j++)
			{
				if (j != i) {
					friends[k++] = searchUserNames[i-1];
				}
			}
			this.groups[i] = this.addPeopleToGroup(friends);
		}

 		this.setActiverDriver(driver[1]);
 		this.setActiveSelenium(selenium[1]);
	}
	
	@After
	public void tearDown() {
		super.tearDown();
		for (int i=2; i<=3; i++)
		{
			this.setActiverDriver(this.driver[i]);
			try{ 
				this.removeGroups();
			} catch (final Exception e) { 
				System.out.println("Unable to remove groups/deleting test");
				System.out.println(e.getMessage());
			} finally {
				selenium[i].stop(); 
			}
		}
	}
	
	public void startChat() {
		this.findElement(XpathUtilsChat.getGroupsTab()).click();
		this.waitForElement(XpathUtilsChat.getIndividualGroups());
		final List<WebElement> elements = this.findElements(XpathUtilsChat.getIndividualGroups());
		elements.get(elements.size()-1).click();
	}
	
	public void sendMessage(final String message) {
		this.findElement(XpathUtilsChat.getChatInputField()).sendKeys(XpathUtilsChat.buildString(message, "\r"));
	}
	
	public void clickAddUserButton(final String chatName) {
		this.findElement(XpathUtilsChat.getAddPersonButton(chatName)).click();
	}
	
	public void clickMinimizeButton(final String chatName) {
		this.findElement(XpathUtilsChat.getMinimizeButton(chatName)).click();
	}
	
	public void clickMinimizedChat(final String chatName) {
		this.findElement(XpathUtilsChat.getMinimizedChat(chatName)).click();
	}
	
	public void clickChatCloseButton(final String chatName) {
		this.findElement(XpathUtilsChat.getCloseChatButton(chatName)).click();
	}
	
	public void clickMinimizedChatCloseButton(String chatName) {
		this.findElement(XpathUtilsChat.getCloseChatMinimized(chatName)).click();
	}
	
	public void startGroupChat(final String groupName) {
		this.findElement(XpathUtilsChat.getGroupsTab()).click();
		this.waitForElement(XpathUtilsChat.getIndividualGroups());
		this.findElement(XpathUtilsChat.getGroupChatButton(groupName)).click();
	}
}
