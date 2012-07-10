package com.nti.selenium.highlights;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestHighlights extends Highlights{

	@Test
	public void testhighlight(){
		this.switchToIframe();
		this.selectText(0, 0, 10);
		this.switchToDefault();
		assertTrue(this.elementExists(XpathUtilsHighlights.getPopUpBox()));
	}
	
}
