package com.nti.selenium.misc;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

public class TestMisc extends Misc{

	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
	}

	@Test
	public void testClickNextThoughtButton() {
		this.clickHomeButton();
		assertTrue(this.elementExists(XpathUtilsMisc.atHomePanel()));
	}

	@Test
	public void testClickShowMeDropDown() {
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
	}
	
	@Test
	public void testClickOnDropDownItem() {
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
		this.clickListItem("Highlights");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Highlights"));
	}
	
	@Test
	public void testClickMultipleDropDownItems() {
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
		assertFalse(this.isChecked("Notes"));
		this.clickListItem("Highlights");
		this.clickListItem("Notes");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Highlights"));
		assertTrue(this.isChecked("Notes"));
	}
	
	@Test
	public void testClickOnDropDownItemSwitchBackToEverything() {
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
		this.clickListItem("Highlights");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Highlights"));
		this.clickListItem("Everything");
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
	}
	
	@Test
	public void testClickSelectAllItems() {
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Highlights"));
		assertFalse(this.isChecked("Notes"));
		assertFalse(this.isChecked("Transcripts"));
		assertFalse(this.isChecked("Quiz Results"));
		this.clickListItem("Highlights");
		this.clickListItem("Notes");
		this.clickListItem("Transcripts");
		this.clickListItem("Quiz Results");
		assertTrue(this.isChecked("Highlights"));
		assertTrue(this.isChecked("Notes"));
		assertTrue(this.isChecked("Transcripts"));
		assertTrue(this.isChecked("Quiz Results"));
	}
	
	@Test
	public void testClickMe() {
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everyone"));
		assertFalse(this.isChecked("Me"));
		this.clickListItem("Me");
		assertFalse(this.isChecked("Everyone"));
		assertTrue(this.isChecked("Me"));
	}
	
	@Test
	public void testClickMeBackToEveryone() {
		this.clickShowMeDropDown();
		assertTrue(this.getListCount() > 0);
		assertTrue(this.isChecked("Everyone"));
		assertFalse(this.isChecked("Me"));
		this.clickListItem("Me");
		assertFalse(this.isChecked("Everyone"));
		assertTrue(this.isChecked("Me"));
		this.clickListItem("Everyone");
		assertTrue(this.isChecked("Everyone"));
		assertFalse(this.isChecked("Me"));
	}

	@Test
	public void testOpenPrivacy() {
		this.clickOptionsPrivacyButton();
		assertFalse(this.isPrivacyWindowVisable());
	}
	
	@Test
	public void testClosePrivacy() {
		this.clickOptionsPrivacyButton();
		assertFalse(this.isPrivacyWindowVisable());
		this.clickOptionsPrivacyCloseButton();
		assertTrue(this.isPrivacyWindowVisable());
	}
	
}
