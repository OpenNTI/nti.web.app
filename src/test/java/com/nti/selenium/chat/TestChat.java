package com.nti.selenium.chat;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestChat extends Chat {

	private String userTested = "Test";
	
	@Test
	public void testBasicChat() {
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser(this.userTested));
		final String id1 = this.findElement(XpathUtilsChat.getChatUser(this.userTested)).getAttribute("id");
		assertTrue(id1.matches("chat-window-.*"));
		this.setActiverDriver(this.driver[2]);
		assertFalse(this.elementExists(XpathUtilsChat.getChatUser(this.userTested)));
	}
	
	@Test
	public void testSendMessageInChat() {
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser(this.userTested));
		final String id1 = this.findElement(XpathUtilsChat.getChatUser(this.userTested)).getAttribute("id");
		assertTrue(id1.matches("chat-window-.*"));
		this.sendMessage("hello");
		this.waitForElement(XpathUtilsChat.getMyMessage("hello"));
		assertTrue(this.elementExists(XpathUtilsChat.getMyMessage("hello")));
		this.setActiverDriver(this.driver[2]);
		final String id2 = this.findElement(XpathUtilsChat.getChatUser(this.userTested)).getAttribute("id");
		assertTrue(id2.matches("chat-window-.*"));
		assertTrue(this.elementExists(XpathUtilsChat.getOtherMessage("hello")));
	}
	
	@Test
	public void testOpenAddUserPanel() {
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser(this.userTested));
		final String id1 = this.findElement(XpathUtilsChat.getChatUser(this.userTested)).getAttribute("id");
		assertTrue(id1.matches("chat-window-.*"));
		this.clickAddUserButton(this.userTested);
		assertTrue(this.elementExists(XpathUtilsChat.getAddUserExpandList()));
	}
	
	@Test
	public void testCloseAddUserPanel() {
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser(this.userTested));
		final String id1 = this.findElement(XpathUtilsChat.getChatUser(this.userTested)).getAttribute("id");
		assertTrue(id1.matches("chat-window-.*"));
		this.clickAddUserButton(this.userTested);
		assertTrue(this.elementExists(XpathUtilsChat.getAddUserExpandList()));
		this.clickAddUserButton(this.userTested);
		assertTrue(this.elementExists(XpathUtilsChat.getAddUserHiddenList()));
	}
	
	@Test
	public void testMinimizeChat() {
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser(this.userTested));
		final String id1 = this.findElement(XpathUtilsChat.getChatUser(this.userTested)).getAttribute("id");
		assertTrue(id1.matches("chat-window-.*"));
		this.clickMinimizeButton(this.userTested);
		assertEquals("", this.findElement(XpathUtilsChat.getConfirmChatMinimized(this.userTested)).getAttribute("style"));
	}
	
	@Test
	public void testExpandChat() {
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser(this.userTested));
		final String id1 = this.findElement(XpathUtilsChat.getChatUser(this.userTested)).getAttribute("id");
		assertTrue(id1.matches("chat-window-.*"));
		this.clickMinimizeButton(this.userTested);
		assertEquals("", this.findElement(XpathUtilsChat.getConfirmChatMinimized(this.userTested)).getAttribute("style"));
		this.clickMinimizedChat(this.userTested);
		assertEquals("display: none;", this.findElement(XpathUtilsChat.getConfirmChatMinimized(this.userTested)).getAttribute("style"));
	}
	
	@Test
	public void testCloseChat() {
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser(this.userTested));
		final String id1 = this.findElement(XpathUtilsChat.getChatUser(this.userTested)).getAttribute("id");
		assertTrue(id1.matches("chat-window-.*"));
		this.clickChatCloseButton(this.userTested);
		assertFalse(this.elementExists(XpathUtilsChat.getChatUser(this.userTested)));
	}
	
	@Test
	public void testCloseMinimizedChat() {
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatUser(this.userTested));
		final String id1 = this.findElement(XpathUtilsChat.getChatUser(this.userTested)).getAttribute("id");
		assertTrue(id1.matches("chat-window-.*"));
		this.clickMinimizeButton(this.userTested);
		assertEquals("", this.findElement(XpathUtilsChat.getConfirmChatMinimized(this.userTested)).getAttribute("style"));
		this.clickMinimizedChatCloseButton(this.userTested);
		assertFalse(this.elementExists(XpathUtilsChat.getChatUser(this.userTested)));
	}
	
	@Test
	public void testGroupChat() {
		String groupName = XpathUtilsChat.buildString(this.groups[1], " (2)"); 
		this.startGroupChat(groupName);
		this.waitForElement(XpathUtilsChat.getChatUser("Group Chat (2)"));
		final String id1 = this.findElement(XpathUtilsChat.getChatUser(XpathUtilsChat.buildString("Group Chat (2)"))).getAttribute("id");
		assertTrue(id1.matches("chat-window-.*"));
	}
	
}
