package com.nti.selenium.highlights;

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
		this.switchToIframe();
		try {
			this.findElements("//span[text()='Highlight In Section']");
			this.wait_(3);
		} catch(final Exception e){
			System.out.println("errored");
		}
		
		for (final WebElement element: this.findElements(XpathUtilsHighlights.getHighlightInList()))
		{
			this.wait_(3);
			element.click();
			this.removeHighlight();
		}
		selenium[1].stop();
	}
	
	public void createHighlight(){
		this.switchToIframe();
		this.selectText(0, 0, 10);
		this.switchToDefault();
		this.findElement(XpathUtilsHighlights.getCreateHighlight()).click();
	}
	
	public void removeHighlight(){
		System.out.println("ima test");
	}
}
