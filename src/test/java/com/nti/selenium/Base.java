package com.nti.selenium;


import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.Properties;

import org.apache.commons.io.IOUtils;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.thoughtworks.selenium.Selenium;

public class Base {

	protected static final int DEFAULT_TIMEOUT = 10;
	
	protected static String url;
	protected static String books;
	protected static String sectionName;
	protected static String chapterName;
	protected static String browser;
	protected static Credentials[] credentials;
	protected static final Properties propertiesFile = new Properties();
	
	protected WebDriver driver;
	protected Selenium selenium;
	protected boolean isDefault = true;
	protected String xpathBuilder = null;
	
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
	
	public WebElement findElement(final String xpath) throws NoSuchElementException {
		return this.driver.findElement(By.xpath(xpath));
	}
	
	public List<WebElement> findElements(final String xpath) throws NoSuchElementException {
		return this.driver.findElements(By.xpath(xpath));
	}
	
	public boolean elementExists(final String xpath) {
		try{
			this.findElement(xpath);
			return true;
		} catch (final NoSuchElementException e) {
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
	
	public boolean waitForLoading() {
		return waitForLoading(DEFAULT_TIMEOUT);
	}
	
	public boolean waitForLoading(final int timeout) {
		int timer = 0;
		while(this.elementExists(XpathUtils.getBasePageLoading())  && timer <= timeout)
		{
			timer++;
			this.wait_(1);
		}
		this.wait_(1);
		return timer < timeout;
	}
	
	public boolean waitForElement(final String xpath) {
		return this.waitForElement(xpath, DEFAULT_TIMEOUT);
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
	
	public void selectText(int index, int start, int end){ 
		String script = XpathUtils.buildString("function selectElementContents (el,start, end) {var sel = window.getSelection(); ",
				"var range = window.document.createRange();  range.setStart(el,start); range.setEnd(el,end); ",
				"sel.removeAllRanges(); sel.addRange(range);} selectElementContents(window.document.getElementsByTagName ('p')", 
				"[", Integer.toString(index), "].firstChild,", Integer.toString(start), ",", Integer.toString(end), ")");
		((JavascriptExecutor)this.driver).executeScript(script);    	
		List<WebElement> elements = this.findElements(this.getPageContent());
		elements.get(0).click();
	}
	
	public void selectText2(int index, int start, int end){ 
		String script = XpathUtils.buildString("function selectElementContents (el,start, end) {var sel = window.getSelection(); ",
				"var range = window.document.createRange();  range.setStart(el,start); range.setEnd(el,end); ",
				"sel.removeAllRanges(); sel.addRange(range);} selectElementContents(window.document.getElementsByTagName ('i')", 
				"[", Integer.toString(index), "].firstChild,", Integer.toString(start), ",", Integer.toString(end), ")");
		((JavascriptExecutor)this.driver).executeScript(script);   
		WebElement element = this.findElement("//i"); 
		element.click();
		//List<WebElement> elements = this.findElements(this.getPageContent());
		//elements.get(0).click();
	}
	public String getPageContent(){
		return XpathUtils.xpathAttributeBuilder("div", "class", "page-contents");
	}
	
}
