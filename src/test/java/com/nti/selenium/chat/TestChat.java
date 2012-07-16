package com.nti.selenium.chat;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestChat extends Chat {

	@Test
	public void testFirst(){
		this.startChat();
		this.waitForElement(XpathUtilsChat.getChatWindow("Test"));
		String ID = this.findElement(XpathUtilsChat.getChatWindow("Test")).getAttribute("id");
		assertTrue(ID.matches("chat-window-.*"));
	}
	
}
