package com.nti.selenium;


import org.junit.BeforeClass;
import org.junit.Before;
import org.junit.Test;
import org.junit.After;
import org.junit.AfterClass;
import static org.junit.Assert.assertEquals;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.DefaultSelenium;
import junit.framework.TestCase;
import org.openqa.selenium.server.SeleniumServer;

public class LoginTest extends TestCase{
	
	private static final String Max_Wait_TIME_IN_MS = "60000";
	private static final String BASE_URL = "http://localhost:8081/NextThoughtWebApp/";
	private Selenium selenium = new DefaultSelenium("localhost", 4444, "*firefox", BASE_URL);
	
	private SeleniumServer seleniumServer;
	private LoginHelper loginHelper = new LoginHelper(selenium);
	
	@BeforeClass
	public static void oneTimeSetUp(){
		System.out.println("set up class");
	}
	
	@AfterClass
	public static void oneTimeTearDown(){
		System.out.println("tear down class");
	}
	
	@Before
	public void setUp() throws Exception{
		this.seleniumServer = new SeleniumServer();
		this.seleniumServer.start();
		this.selenium.start();
		
		this.selenium.open("http://localhost:8081/NextThoughtWebApp/");
	}
	
	@After
	public void tearDown() throws Exception{
		this.selenium.stop();
		this.seleniumServer.stop();
	}
	
	@Test
	public void testHello(){
		this.loginHelper.login();
	}

	@Test
	public void testHello1(){
		this.loginHelper.login();
	}
	
	@Test
	public void testHello2(){
		this.loginHelper.login();
	}
	
	@Test
	public void testHello3(){
		this.loginHelper.login();
	}
	
	@Test
	public void testHello4(){
		this.loginHelper.login();
	}
	
	@Test
	public void testHello5(){
		this.loginHelper.login();
	}
	
	@Test
	public void testHello6(){
		this.loginHelper.login();
	}
	
	@Test
	public void testHello7(){
		this.loginHelper.login();
	}
	
	@Test
	public void testHello8(){
		this.loginHelper.login();
	}
	
	@Test
	public void testHello9(){
		this.loginHelper.login();
	}
	
	@Test
	public void testHello0(){
		this.loginHelper.login();
	}
	
}
