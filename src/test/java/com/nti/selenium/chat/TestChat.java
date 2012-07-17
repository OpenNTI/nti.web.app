package com.nti.selenium.chat;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestChat extends Chat {

	@Test
	public void testBasicChat(){
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser("Test"));
		String ID1 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID1.matches("chat-window-.*"));
		this.setActiverDriver(this.driver[2]);
		assertFalse(this.elementExists(XpathUtilsChat.getChatUser("Test")));
	}
	
	@Test
	public void testSendMessageInChat(){
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser("Test"));
		String ID1 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID1.matches("chat-window-.*"));
		this.sendMessage("hello");
		this.waitForElement(XpathUtilsChat.getMyMessage("hello"));
		assertTrue(this.elementExists(XpathUtilsChat.getMyMessage("hello")));
		this.setActiverDriver(this.driver[2]);
		String ID2 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID2.matches("chat-window-.*"));
		assertTrue(this.elementExists(XpathUtilsChat.getOtherMessage("hello")));
	}
	
	@Test
	public void testOpenAddUserPanel(){
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser("Test"));
		String ID1 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID1.matches("chat-window-.*"));
		this.clickAddUserButton("Test");
		assertTrue(this.elementExists(XpathUtilsChat.getAddUserExpandList()));
	}
	
	@Test
	public void testCloseAddUserPanel(){
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser("Test"));
		String ID1 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID1.matches("chat-window-.*"));
		this.clickAddUserButton("Test");
		assertTrue(this.elementExists(XpathUtilsChat.getAddUserExpandList()));
		this.clickAddUserButton("Test");
		assertTrue(this.elementExists(XpathUtilsChat.getAddUserHiddenList()));
	}
	
	@Test
	public void testMinimizeChat(){
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser("Test"));
		String ID1 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID1.matches("chat-window-.*"));
		this.clickMinimizeButton("Test");
		assertEquals("", this.findElement(XpathUtilsChat.getConfirmChatMinimized("Test")).getAttribute("style"));
	}
	
	@Test
	public void testExpandChat(){
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser("Test"));
		String ID1 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID1.matches("chat-window-.*"));
		this.clickMinimizeButton("Test");
		assertEquals("", this.findElement(XpathUtilsChat.getConfirmChatMinimized("Test")).getAttribute("style"));
		this.clickMinimizedChat("Test");
		assertEquals("display: none;", this.findElement(XpathUtilsChat.getConfirmChatMinimized("Test")).getAttribute("style"));
	}
	
	@Test
	public void testCloseChat(){
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser("Test"));
		String ID1 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID1.matches("chat-window-.*"));
		this.clickChatCloseButton("Test");
		assertFalse(this.elementExists(XpathUtilsChat.getChatUser("Test")));
	}
	
	@Test
	public void testCloseMinimizedChat(){
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser("Test"));
		String ID1 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID1.matches("chat-window-.*"));
		this.clickMinimizeButton("Test");
		assertEquals("", this.findElement(XpathUtilsChat.getConfirmChatMinimized("Test")).getAttribute("style"));
		this.clickMinimizedChatCloseButton("Test");
		assertFalse(this.elementExists(XpathUtilsChat.getChatUser("Test")));
	}
	
}
