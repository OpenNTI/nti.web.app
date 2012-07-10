package com.nti.selenium.redaction;

import java.util.List;

import org.junit.Before;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import com.nti.selenium.navigation.Navigation;

public class Redaction extends Navigation { 
	
	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("HOWES v. FIELDS", "MIRANDA v. ARIZONA", "Index");
	}
	
	public void createRedaction(){
		
		
	int index = 0; 
	int start = 0; 
	int end = 10; 
	this.wait_(5);
	System.out.println("Waiting");
	String script = "function selectElementContents (el,start, end) {var sel = window.getSelection(); var range = window.document.createRange();  range.setStart(el,start); range.setEnd(el,end); sel.removeAllRanges(); sel.addRange(range);} selectElementContents(window.document.getElementsByTagName ('p')" + "[" + Integer.toString(index) + "].firstChild," + Integer.toString(start) + "," + Integer.toString(end) + ")";
	((JavascriptExecutor)this.driver).executeScript(script);    	
	List<WebElement> elements = this.findElements("//div[@class='page-contents']//p");
	elements.get(0).click();
	elements = this.findElements("//div[text() = 'Redact Highlight']"); 
	elements.get(0).click();
	
	}
}