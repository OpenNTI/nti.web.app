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

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

public class Base {

	protected static final int timeout = 10;
	
	protected static String url;
	protected static String books;
	protected static String sectionName;
	protected static String chapterName;
	protected static Credentials[] credentials;
	protected static final Properties propertiesFile = new Properties();
	
	protected WebDriver driver;
	protected Selenium selenium;
	protected String xpathBuilder = null;
	
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
			books = propertiesFile.getProperty("books");
			chapterName = propertiesFile.getProperty("chapterName");
			credentials = readCredentials(propertiesFile.getProperty("users"));
			
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
			credentials[i] = new Credentials(users[i], users[i]);
		}
		return credentials;
	}
	
	@Before
	public void setUp() throws Exception{
		driver = new FirefoxDriver();
		selenium = new WebDriverBackedSelenium(driver, url);
		selenium.open(url);
	}
	
	@After
	public void tearDown() throws Exception{
		selenium.stop();
	}
	
	public String buildString(final String... strings) {
		StringBuilder builder = new StringBuilder();
		for(final String str: strings)
		{
			builder.append(str);
		}
		return builder.toString();
	}
	
	public String xpathAttributeBuilder(final String tag, final String attribute, final String value){
		final String[] xpathElements = {"//", tag, "[@", attribute, "='", value, "']"};
		return this.buildString(xpathElements);
	}
	
	public String xpathTextBuilder(final String tag, final String text) {
		final String[] xpathElements = {"//", tag, "[text()='", text, "']"};
		return this.buildString(xpathElements);
	}
	
	public String xpathAttributeAndTextBuilder(final String tag, final String attribute, final String value, final String text) {
		final String[] xpathElements = {"//", tag, "[@", attribute, "='", value, "' and text()='", text, "']"};
		return this.buildString(xpathElements);
	}
	
	public String xpathAddonBuilder(final String tag, final String attribute, final String value){
		String[] xpathElements = {"//", tag, "[@", attribute, "='", value, "']"};
		return this.buildString(xpathElements);
	}
	
	public String findContentFrameBodyElement() {
		return "return document.querySelector('#readerPanel-body iframe');";
	}
	
	public WebElement findContentElement(final String xpath) {
		WebElement iframe = (WebElement)((JavascriptExecutor) driver).executeScript(findContentFrameBodyElement());
		return driver.switchTo().frame(iframe).findElement(By.xpath(xpath));
	}
	
	public WebElement getElement(final String xpath) {
		try{
			return driver.findElement(By.xpath(xpath));
		} catch(final Exception e) {
			return null;
		}
	}
	
}
