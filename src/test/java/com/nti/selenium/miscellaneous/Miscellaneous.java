package com.nti.selenium.miscellaneous;

import org.junit.Before;

import com.nti.selenium.navigation.Navigation;

public class Miscellaneous extends Navigation{

	@Before
	public void setUp() throws Exception{
		super.setUp();
	}
	
	public void clickHomeButton(){
		this.findElement(XpathUtilsMiscellaneous.getHome()).click();
	}
	
}
