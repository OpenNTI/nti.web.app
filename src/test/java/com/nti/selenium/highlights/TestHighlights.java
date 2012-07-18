package com.nti.selenium.highlights;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestHighlights extends Highlights {

	@Test
	public void testHighlight(){
		this.switchToIframe();
		this.selectText(0, 0, 10);
		this.switchToDefault();
		assertTrue(this.elementExists(XpathUtilsHighlights.getCreateHighlightButton()));
	}
	
	@Test
	public void testCreateHighlight(){
		this.createHighlight();
		this.selenium[1].refresh();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
		this.switchToIframe();
		assertEquals("In Section ", this.findElement(XpathUtilsHighlights.getCreatedHighlight()).getText());
	}
	
	@Test
	public void testRemoveHighlight(){
		this.createHighlight();
		this.switchToIframe();
		assertTrue(this.elementExists(XpathUtilsHighlights.getCreatedHighlight()));
		this.removeHighlight(XpathUtilsHighlights.getCreatedHighlight());
		assertFalse(this.elementExists(XpathUtilsHighlights.getCreatedHighlight()));
	}
	
	@Test
	public void testShareHighlightPopUpOption(){
		this.createHighlight();
		this.switchToIframe();
		assertTrue(this.elementExists(XpathUtilsHighlights.getCreatedHighlight()));
		this.switchToIframe();
		this.findElement(XpathUtilsHighlights.getCreatedHighlight()).click();
		this.switchToDefault();
		assertTrue(this.elementExists(XpathUtilsHighlights.getShareWithButton()));
	}
	
	@Test
	public void testShareHighlight(){
		this.createHighlight();
		this.switchToIframe();
		assertTrue(this.elementExists(XpathUtilsHighlights.getCreatedHighlight()));
		this.shareHighlight(XpathUtilsHighlights.getCreatedHighlight());
		assertTrue(this.elementExists(XpathUtilsHighlights.getShareThisTitle()));
	}
	
	@Test
	public void testShareHighlightSearchForUser(){
		String username = this.searchUserNames[1]; 
		this.createHighlight();
		this.switchToIframe();
		assertTrue(this.elementExists(XpathUtilsHighlights.getCreatedHighlight()));
		this.shareHighlight(XpathUtilsHighlights.getCreatedHighlight());
		assertTrue(this.elementExists(XpathUtilsHighlights.getShareThisTitle()));
		this.inputSearchForUser(username);
		this.waitForElement(XpathUtilsHighlights.getSearchedForUser(username));
		assertTrue(this.elementExists(XpathUtilsHighlights.getSearchedForUser(username)));
	}
	
	@Test
	public void testShareHighlightAddUser(){
		String username = this.searchUserNames[1]; 
		this.createHighlight();
		this.switchToIframe();
		assertTrue(this.elementExists(XpathUtilsHighlights.getCreatedHighlight()));
		this.shareHighlight(XpathUtilsHighlights.getCreatedHighlight());
		assertTrue(this.elementExists(XpathUtilsHighlights.getShareThisTitle()));
		this.inputSearchForUser(username);
		this.waitForElement(XpathUtilsHighlights.getSearchedForUser(username));
		assertTrue(this.elementExists(XpathUtilsHighlights.getSearchedForUser(username)));
		this.clickSearchResult(username);
		this.waitForElement(XpathUtilsHighlights.getGroupUsernameTokenLabel(username));
		assertTrue(this.elementExists(XpathUtilsHighlights.getGroupUsernameTokenLabel(username)));
	}
	
	@Test
	public void testShareHighlightRemoveUser(){
		String username = this.searchUserNames[1]; 
		this.createHighlight();
		this.switchToIframe();
		assertTrue(this.elementExists(XpathUtilsHighlights.getCreatedHighlight()));
		this.shareHighlight(XpathUtilsHighlights.getCreatedHighlight());
		assertTrue(this.elementExists(XpathUtilsHighlights.getShareThisTitle()));
		this.inputSearchForUser(username);
		this.waitForElement(XpathUtilsHighlights.getSearchedForUser(username));
		assertTrue(this.elementExists(XpathUtilsHighlights.getSearchedForUser(username)));
		this.clickSearchResult(username);
		this.waitForElement(XpathUtilsHighlights.getGroupUsernameTokenLabel(username));
		assertTrue(this.elementExists(XpathUtilsHighlights.getGroupUsernameTokenLabel(username)));
		this.clickCloseUserGroupToken(XpathUtilsHighlights.getGroupUsernameTokenLabel(username));
		assertFalse(this.elementExists(XpathUtilsHighlights.getGroupUsernameTokenLabel(username)));
	}
	
}
