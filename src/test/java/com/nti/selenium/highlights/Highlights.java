package com.nti.selenium.highlights;


import org.junit.Before;

import com.nti.selenium.navigation.Navigation;

public class Highlights extends Navigation {

	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
	}
	
	public void createHighlight(){
		this.switchToIframe();
		this.selectText(0, 0, 10);
		this.switchToDefault();
		this.findElement(XpathUtilsHighlights.getCreateHighlight()).click();
	}
	
}
