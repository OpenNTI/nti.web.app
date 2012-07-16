package com.nti.selenium.login;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Test;

public class TestLogin extends Login {

	@Test
	public void testLogin(){
		this.login();
		assertEquals(selenium1.getTitle(), "NextThought App");
	}
	
//	@Test
//	public void testIncorrectUserLogin() {
//		try{
//			this.login("incorrect_user", "incorrect_password");
//			fail("Should have errored for lack of password field");
//		} catch (final Exception e) {
//		} finally {
//			assertEquals(selenium1.getTitle(), "NextThought Login");
//		}
//	}
//	
//	@Test
//	public void testIncorrectPasswordLogin(){
//		this.login(credentials[0].getUserName(), "incorrect_password");
//		assertEquals(selenium1.getTitle(), "NextThought Login");
//		assertTrue(selenium1.isElementPresent(XpathUtilsLogin.getLoginProblemMessage()));
//	}
//	
//	@Test
//	public void testLogout(){
//		this.logout();
//		assertEquals(selenium1.getTitle(), "NextThought Login");
//	}
}
