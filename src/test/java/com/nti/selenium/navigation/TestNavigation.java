package com.nti.selenium.navigation;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestNavigation extends Navigation {

	@Test
	public void testOpenLibrary() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		assertTrue(selenium.isElementPresent(this.getXPathBook()));
	}
	
	@Test
	public void testOpenBook() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		assertTrue(selenium.isElementPresent(this.getXPathBook()));
		this.openBook();
		assertTrue(selenium.isElementPresent(this.getXPathChapter()));
	}

	@Test
	public void testOpenChapter() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		assertTrue(selenium.isElementPresent(this.getXPathBook()));
		this.openBook();
		assertTrue(selenium.isElementPresent(this.getXPathChapter()));
		this.openChapter();
		assertTrue(selenium.isElementPresent(this.getXPathSection()));
	}
	
	@Test
	public void testOpenSection() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		assertEquals("Fractions", this.getNavTestText(XpathUtilsNav.getFractionIndexPage()).getText());
	}
	
	@Test
	public void testBackArrow() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		assertEquals("Fractions", this.getNavTestText(XpathUtilsNav.getFractionIndexPage()).getText());
		this.clickArrowBackButton();
		assertEquals("Challenge Problems", this.getNavTestText(XpathUtilsNav.getChallengeProblem()).getText());
	}
	
	@Test
	public void testForwardArrow() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		assertEquals("Fractions", this.getNavTestText(XpathUtilsNav.getFractionIndexPage()).getText());
		this.clickArrowForwardButton();
		assertEquals("What is a Fraction?", this.getNavTestText(XpathUtilsNav.getWhatIsAFraction()).getText());
	}
	
	@Test
	public void testClickRelatedItems(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		assertEquals("Fractions", this.getNavTestText(XpathUtilsNav.getFractionIndexPage()).getText());
		this.clickRelatedItem("Division");
		assertTrue(this.elementExists(this.getXPathDivisionPage()));
	}
	
	@Test
	public void testClickChapterDropDown(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		assertEquals("Fractions", this.getNavTestText(XpathUtilsNav.getFractionIndexPage()).getText());
		this.wait_(3);
		this.clickChapterDropDown();
		assertTrue(this.getListCount() > 0);
	}
	
	@Test
	public void testClickOnChapter(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		assertEquals("Fractions", this.getNavTestText(XpathUtilsNav.getFractionIndexPage()).getText());
		this.clickChapterDropDown();
		assertTrue(this.getListCount() > 0);
		String title = this.getListItemTitle(0);
		this.clickListItem(0);
		assertEquals(title, this.getNavTestText(XpathUtilsNav.getSectionPageTitle(title)).getText());
	}
	
	@Test
	public void testClickSectionDropDown(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		assertEquals("Fractions", this.getNavTestText(XpathUtilsNav.getFractionIndexPage()).getText());
		this.clickSectionDropDown();
		assertTrue(this.getListCount() > 0);
	}
	
	@Test
	public void testClickOnSection(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		assertEquals("Fractions", this.getNavTestText(XpathUtilsNav.getFractionIndexPage()).getText());
		this.clickSectionDropDown();
		assertTrue(this.getListCount() > 0);
		String title = this.getListItemTitle(0);
		this.clickListItem(0);
		assertEquals(title, this.getNavTestText(XpathUtilsNav.getSectionPageTitle(title)).getText());
	}
	
}
