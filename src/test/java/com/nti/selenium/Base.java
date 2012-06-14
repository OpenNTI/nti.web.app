package com.nti.selenium;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Properties;

import org.junit.BeforeClass;
import org.junit.Before;
import org.junit.After;
//import org.junit.AfterClass;
//import static org.junit.Assert.assertEquals;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.DefaultSelenium;
import org.openqa.selenium.server.SeleniumServer;

public class Base{

	protected SeleniumServer seleniumServer;
	protected int timeout = 10;
	
	protected static Selenium selenium;
	protected static Properties propertiesFile;
	protected static String url;
	protected static String sectionName;
	protected static String bookName;
	protected static String driver;
	protected static String books;
	protected static String chapterName;
	protected static Credentials credentials;
	
	@BeforeClass
	public static void oneTimeSetUp(){
		propertiesFile = new Properties();
		try {
			String webAppPath = System.getProperty("user.dir");
			String localPath = "/src/test/java/com/nti/selenium/config/main.properties";
			
			propertiesFile.load(new FileInputStream(webAppPath + localPath));
			url = propertiesFile.getProperty("url");
			sectionName = propertiesFile.getProperty("sectionName");
			bookName = propertiesFile.getProperty("bookName");
			driver = propertiesFile.getProperty("driver");
			books = propertiesFile.getProperty("books");
			chapterName = propertiesFile.getProperty("chapterName");
			credentials = new Credentials(propertiesFile);
			selenium = new DefaultSelenium("localhost", 4444, driver, url);
		} catch (IOException e) {
			System.out.println("couldnt find the config file");
		}
	}
	
	@Before
	public void setUp() throws Exception{
		this.seleniumServer = new SeleniumServer();
		this.seleniumServer.start();
		selenium.start();
		selenium.open(url);
	}
	
	@After
	public void tearDown() throws Exception{
		selenium.stop();
		this.seleniumServer.stop();
	}
	
}
