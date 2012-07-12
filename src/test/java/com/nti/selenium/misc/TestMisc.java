package com.nti.selenium.misc;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestMisc extends Misc{

	@Test
	public void testClickNextThoughtButton(){
		this.clickHomeButton();
		assertTrue(this.elementExists(XpathUtilsMisc.atHomePanel()));
	}
	
}
