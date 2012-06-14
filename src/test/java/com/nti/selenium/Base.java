package com.nti.selenium;

import java.io.File
import java.io.IOException;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.Properties;
import java.net.URL;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.DefaultSelenium;
import org.openqa.selenium.server.SeleniumServer;

public class Base {

	protected static final int timeout = 10;
	
	protected static String url;
	protected static String books;
	protected static String driver;
	protected static String bookName;
	protected static Selenium selenium;
	protected static String sectionName;
	protected static String chapterName;
	protected static Credentials credentials;
	protected static Properties propertiesFile;
	
	protected SeleniumServer seleniumServer;
	
	@BeforeClass
	public static void oneTimeSetUp() {
		final propertiesFile = new Properties();
		try {
			final URL main = Base.class.getResource("Base.class");
			final File mp = new File(url.getPath());
			final String webAppPath = mp.getParent() + "/"
			final String localPath = "../config/main.properties";
			
			// set properties
			// TODO: Close Stream we need commons-io
			propertiesFile.load(new FileInputStream(webAppPath + localPath));
			url = propertiesFile.getProperty("url");
			sectionName = propertiesFile.getProperty("sectionName");
			bookName = propertiesFile.getProperty("bookName");
			driver = propertiesFile.getProperty("driver");
			books = propertiesFile.getProperty("books");
			chapterName = propertiesFile.getProperty("chapterName");
			credentials = new Credentials(propertiesFile);
			
			// TODO: Make sure we get the host/port from the config file
			selenium = new DefaultSelenium("localhost", 4444, driver, url);
		} catch (final IOException e) {
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
