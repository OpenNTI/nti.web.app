package com.nti.selenium.chat;

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
		this.setActiverDriver(driver2);
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
		this.setActiverDriver(driver2);
		String ID2 = this.findElement(XpathUtilsChat.getChatUser("Test")).getAttribute("id");
		assertTrue(ID2.matches("chat-window-.*"));
		assertTrue(this.elementExists(XpathUtilsChat.getOtherMessage("hello")));
	}
	
}
