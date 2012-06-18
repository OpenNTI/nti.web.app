package com.nti.selenium;

import java.lang.StringBuilder;

import java.io.File;
import java.io.IOException;
import java.io.FileInputStream;
import java.util.Properties;
import java.net.URL;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.DefaultSelenium;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import org.openqa.selenium.server.SeleniumServer;

public class Base {

	protected static final int timeout = 10;
	
	protected static int port;
	protected static String url;
	protected static String books;
	protected static String driver;
	protected static String bookName;
	protected static Selenium selenium;
	protected static String sectionName;
	protected static String chapterName;
	protected static String dataserver;
	protected static Credentials[] credentials;
	protected static final Properties propertiesFile = new Properties();
	
	protected String xpathBuilder = null;
	protected SeleniumServer seleniumServer = null;
	
	@BeforeClass
	public static void oneTimeSetUp() {
		
		try {
			final URL main = Base.class.getResource("Base.class");
			final File mp = new File(main.getPath());
			final String webAppPath = mp.getParent() + "/";
			final String localPath = "config/main.properties";
			
			propertiesFile.load(new FileInputStream(webAppPath + localPath));
			url = propertiesFile.getProperty("url");
			sectionName = propertiesFile.getProperty("sectionName");
			bookName = propertiesFile.getProperty("bookName");
			driver = propertiesFile.getProperty("driver");
			books = propertiesFile.getProperty("books");
			chapterName = propertiesFile.getProperty("chapterName");
			dataserver = propertiesFile.getProperty("dataserver");
			port = Integer.parseInt(propertiesFile.getProperty("port"));
			credentials = readCredentials(propertiesFile.getProperty("users"));
			selenium = new DefaultSelenium(dataserver, port, driver, url);
			
		} catch (final IOException e) {
			System.out.println("couldnt find the config file");
			System.exit(1);
		}
	}
	
	public static Credentials[] readCredentials(final String source){
		final String[] users = source.split(",");
		credentials = new Credentials[users.length];
		for(int i = 0; i < users.length; i++)
		{
			// TODO: set password correctly
			credentials[i] = new Credentials(users[i], users[i]);
		}
		return credentials;
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
	
	public String buildString(String[] strings){
		StringBuilder builder = new StringBuilder();
		for(String str: strings){
			builder.append(str);
		}
		return builder.toString();
	}
	
	public String xpathAttributeBuilder(String tag, String attribute, String value){
		String[] xpathElements = {"xpath=//", tag, "[@", attribute, "='", value, "']"};
		return this.buildString(xpathElements);
	}
	
	public String xpathTextBuilder(String tag, String text){
		String[] xpathElements = {"xpath=//", tag, "[text()='", text, "']"};
		return this.buildString(xpathElements);
	}
	
	public String xpathAttributeAndTextBuilder(String tag, String attribute, String value, String text){
		String[] xpathElements = {"xpath=//", tag, "[@", attribute, "='", value, "' and text()='", text, "']"};
		return this.buildString(xpathElements);
	}
	
}
