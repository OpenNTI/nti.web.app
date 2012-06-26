package com.nti.selenium;

import java.lang.StringBuilder;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.FileInputStream;
import org.openqa.selenium.NoSuchElementException;
import java.util.Properties;
import java.net.URL;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import java.util.List;
import com.thoughtworks.selenium.Selenium;

import org.apache.commons.io.IOUtils;

public class Base {

	protected static final int timeout = 15;
	
	protected static String url;
	protected static String books;
	protected static String sectionName;
	protected static String chapterName;
	protected static String browser;
	protected static Credentials[] credentials;
	protected static final Properties propertiesFile = new Properties();
	
	protected WebDriver driver;
	protected Selenium selenium;
	protected String xpathBuilder = null;
	protected boolean isDefault = true;
	
	@BeforeClass
	public static void oneTimeSetUp() {
		
		InputStream is = null;
		try {
			final URL main = Base.class.getResource("Base.class");
			final File mp = new File(main.getPath());
			final String webAppPath = mp.getParent() + "/";
			final String localPath = "config/main.properties";
			
			is = new FileInputStream(webAppPath + localPath);
			propertiesFile.load(is);
			browser = propertiesFile.getProperty("browser");
			url = propertiesFile.getProperty("url");
			sectionName = propertiesFile.getProperty("sectionName");
			books = propertiesFile.getProperty("books");
			chapterName = propertiesFile.getProperty("chapterName");
			credentials = readCredentials(propertiesFile.getProperty("users"));
			
			
		} catch (final IOException e) {
			System.out.println("couldnt find the config file");
			System.exit(1);
		} finally {
			IOUtils.closeQuietly(is);
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
		if(browser.equals("chrome")){
			// TODO: ChromeDriver setup
		}
		else if(browser.equals("what ever other browsers we need")){
			//TODO: add those browers
		}
		else{
			driver = new FirefoxDriver(); 
		}
		selenium = new WebDriverBackedSelenium(driver, url);
		selenium.open(url);
	}
	
	@After
	public void tearDown() throws Exception{
		selenium.stop();
	}
	
	public String buildString(final String... strings) {
		final StringBuilder builder = new StringBuilder();
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
	
	public String xpathAttributeAndTextBuilder(	final String tag,
												final String attribute,
												final String value,
												final String text) {
		final String[] xpathElements = {"//", tag, "[@", attribute, "='", value, "' and text()='", text, "']"};
		return this.buildString(xpathElements);
	}
	
	public String xpathAddonBuilder(final String tag, final String attribute, final String value){
		final String[] xpathElements = {"//", tag, "[@", attribute, "='", value, "']"};
		return this.buildString(xpathElements);
	}
	
	public String findContentFrameBodyElement() {
		return "return document.querySelector('#readerPanel-body iframe');";
	}
	
	public void switchToIframe() {
		if (isDefault) {
			final JavascriptExecutor executor = (JavascriptExecutor) driver;
			final WebElement iframe = (WebElement)executor.executeScript(findContentFrameBodyElement());
			this.driver.switchTo().frame(iframe);
			isDefault = false;
		}
	}
	
	public void switchToDefault() {
		if (!isDefault) {
			this.driver.switchTo().defaultContent();
			isDefault = true;
		}
	}
	
	public WebElement findElement(final String xpath) throws NoSuchElementException{
		return this.driver.findElement(By.xpath(xpath));
	}
	
	public List<WebElement> findElements(final String xpath) throws NoSuchElementException{
		return this.driver.findElements(By.xpath(xpath));
	}
	
	public boolean elementExists(final String xpath) {
		try{
			this.findElement(xpath);
			return true;
		} catch(NoSuchElementException e) {
			return false;
		}
	}
	
	public void wait_(final int secs) {
		try {
			final long millis = secs*1000;
			Thread.sleep(millis);
		} catch (final InterruptedException e) {
		}
	}
	
	public boolean waitForLoading(final int timeout) {
		int timer = 0;
		while(this.elementExists(this.xpathAddonBuilder("title", "id", "loading"))  && timer <= timeout)
		{
			timer++;
			this.wait_(1);
		}
		this.wait_(1);
		return timer < timeout;
	}
	
	public boolean waitForElement(final String xpath, final int timeout) {
		int timer = 0;
		while(!this.elementExists(xpath) && timer < timeout)
		{
			timer++;
			this.wait_(1);
		}
		this.wait_(1);
		return timer <= timeout;
	}
	
}
