package com.nti.selenium.redaction;

import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import com.nti.selenium.navigation.Navigation;

public class Redaction extends Navigation { 
	
	String[] searchUserNames;
	
	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Criminal Procedure", "MIRANDA v. ARIZONA.", "Opinion of the Court");
		this.searchUserNames = this.getSearchUserNames(1);
	}
	
	@After 
	public void tearDown(){ 
		final List <WebElement> elements = this.findElements(XpathUtilsRedaction.getRedaction());
		elements.get(0).click(); 
		final WebElement element = this.findElement(XpathUtilsRedaction.setDeleteRedaction());
		element.click(); 
	}
	
	public void createRedaction(){
		this.switchToIframe(); 
		this.selectText2(0,0,5);
		this.switchToDefault();
		this.findElement(XpathUtilsRedaction.setCreateRedaction()).click();
		
	//	int index = 0; 
	//	int start = 0; 
	//	int end = 10; 
	//	this.wait_(5);
	//	System.out.println("Waiting");
	//	String script = "function selectElementContents (el,start, end) {var sel = window.getSelection(); var range = window.document.createRange();  range.setStart(el,start); range.setEnd(el,end); sel.removeAllRanges(); sel.addRange(range);} selectElementContents(window.document.getElementsByTagName ('i')" + "[" + Integer.toString(index) + "].firstChild," + Integer.toString(start) + "," + Integer.toString(end) + ")";
	//	((JavascriptExecutor)this.driver).executeScript(script);    	
	//	List <WebElement> elements = this.findElements("//div[@class='page-contents']//i");
	//	elements.get(0).click();
	//	this.wait_(10);
	//	this.switchToDefault();
	//	WebElement element = this.findElement(XpathUtilsRedaction.setCreateRedaction());
	//	element.click();
		this.wait_(10);
	}
	
	public void shareRedaction(){
		this.createRedaction(); 
		//this.switchToIframe();
		final List <WebElement> elements = this.findElements(XpathUtilsRedaction.getRedaction()); 
		elements.get(0).click();
		this.switchToDefault();
		
		WebElement element = this.findElement(XpathUtilsRedaction.setShareRedaction());
		element.click();
		
		element = this.findElement(XpathUtilsRedaction.setEnterUsername()); 
		element.click();
		element.sendKeys(this.searchUserNames[0]);
		element.sendKeys (Keys.ENTER);
	}
}