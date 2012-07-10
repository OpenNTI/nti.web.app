package com.nti.selenium.search;

import org.junit.Before;

import com.nti.selenium.navigation.Navigation;

public class Search extends Navigation{

	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
		this.findElement(XpathUtilsSearch.getSearch()).click();
	}
	
}
