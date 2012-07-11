package com.nti.selenium.highlights;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestHighlights extends Highlights {

//	@Test
//	public void testHighlight(){
//		this.switchToIframe();
//		this.selectText(0, 0, 10);
//		this.switchToDefault();
//		assertTrue(this.elementExists(XpathUtilsHighlights.getCreateHighlight()));
//	}
//	
//	@Test
//	public void testCreateHighlight(){
//		this.createHighlight();
//		assertTrue(this.elementExists(XpathUtilsHighlights.getCreateHighlightImage()));
//	}
	
	@Test
	public void testRemoveHighlight(){
		this.createHighlight();
		assertTrue(this.elementExists(XpathUtilsHighlights.getCreateHighlightImage()));
//		this.wait_(3);
		this.removeHighlight();
//		assertFalse(this.elementExists(XpathUtilsHighlights.getCreateHighlightImage()));
	}
	
}
