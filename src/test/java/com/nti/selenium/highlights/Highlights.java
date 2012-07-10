package com.nti.selenium.highlights;


import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.navigation.Navigation;

public class Highlights extends Navigation {

	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
	}
	
	@After
	public void tearDown(){
		this.findElement(XpathUtilsHighlights.getCreateHighlightImage()).click();
//		this.wait_(3);
		this.switchToIframe();
		try{
//			this.findElement("//div[text()='skdfjnsldf']");
			this.findElements("//span[text()='Highlight In Section']");
			this.wait_(3);
			System.out.println("size = ");
		} catch(Exception e){
			System.out.println("errored");
		}
		
		for(WebElement element: this.findElements(XpathUtilsHighlights.getHighlightInList())){
			this.wait_(3);
			element.click();
			this.removeHighlight();
		}
		selenium.stop();
	}
	
	public void createHighlight(){
		this.switchToIframe();
		this.selectText(0, 0, 10);
		this.switchToDefault();
		this.findElement(XpathUtilsHighlights.getCreateHighlight()).click();
	}
	
	public void removeHighlight(){
		System.out.println("ima test");
//		this.findElement(XpathUtilsHighlights.getCreateHighlightImage()).click();
//		this.switchToDefault();
//		this.findElement(XpathUtilsHighlights.getRemoveHighlight()).click();
	}
	
}
