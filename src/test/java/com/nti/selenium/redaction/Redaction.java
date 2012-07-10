package com.nti.selenium.redaction;

import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import com.nti.selenium.navigation.Navigation;

public class Redaction extends Navigation { 
	
	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Criminal Procedure", "MIRANDA v. ARIZONA.", "Opinion of the Court");
	}
	

	@After 
	public void tearDown(){ 
	List <WebElement> elements = this.findElements(XpathUtilsRedaction.getRedaction());
	elements.get(0).click(); 
	WebElement element = this.findElement(XpathUtilsRedaction.setDeleteRedaction());
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
		List <WebElement> elements = this.findElements(XpathUtilsRedaction.getRedaction()); 
		elements.get(0).click();
		this.switchToDefault();
		WebElement element = this.findElement(XpathUtilsRedaction.setShareRedaction());
		element.click();
		
		element = this.findElement(XpathUtilsRedaction.setEnterUsername()); 
		element.click();
		element.sendKeys("Pacifique");
		element.sendKeys (Keys.ENTER);
	}
}