package com.nti.selenium.login;


import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class TestLogin extends Login{

	@Test
	public void testLogin(){
		this.login();
		assertEquals(selenium.getTitle(), "NextThought App");
	}
	
	@Test
	public void testIncorrectUserLogin(){
		this.login("incorrect_user", "incorrect_password");
		assertEquals(selenium.getTitle(), "NextThought Login");
	}
	
	@Test
	public void testIncorrectPasswordLogin(){
		this.login(credentials[0].getUserName(), "incorrect_password");
		assertEquals(selenium.getTitle(), "NextThought Login");
		assertTrue(selenium.isElementPresent("xpath=//div[@id='message']"));
		assertTrue(selenium.isElementPresent("xpath=//div[@class='message']"));
		assertTrue(selenium.isElementPresent("xpath=//div[text()='Please try again, there was a problem logging in.']"));
	}
	
	@Test
	public void testLogout(){
		this.logout();
		assertEquals(selenium.getTitle(), "NextThought Login");
	}
	
}
