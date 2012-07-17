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
		this.switchToIframe();		
		try{
			for (final WebElement element: this.findElements(XpathUtilsHighlights.getCreatedHighlight()))
			{
				this.switchToIframe();	
				element.click();
				this.switchToDefault();
				this.removeHighlight();
			}
		}
		catch(Exception e){
		}
		finally{
			selenium[1].stop();
		}
	}
	
	public void createHighlight(){
		this.switchToIframe();
		this.selectText(0, 0, 10);
		this.switchToDefault();
		this.findElement(XpathUtilsHighlights.getCreateHighlightButton()).click();
	}
	
	public void removeHighlight(){
		this.findElement(XpathUtilsHighlights.getRemoveHighlight()).click();
	}
}
