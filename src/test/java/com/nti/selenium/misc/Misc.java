package com.nti.selenium.misc;

import org.junit.Before;

import com.nti.selenium.navigation.Navigation;

public class Misc extends Navigation{

	@Before
	public void setUp() throws Exception{
		super.setUp();
	}
	
	public void clickHomeButton(){
		this.findElement(XpathUtilsMisc.getHome()).click();
	}
	
}
