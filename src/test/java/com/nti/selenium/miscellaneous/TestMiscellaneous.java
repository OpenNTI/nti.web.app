package com.nti.selenium.miscellaneous;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestMiscellaneous extends Miscellaneous{

	@Test
	public void testClickNextThoughtButton(){
		this.clickHomeButton();
		assertTrue(this.elementExists(XpathUtilsMiscellaneous.atHomePanel()));
	}
	
}
