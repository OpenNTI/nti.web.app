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
		this.openBook();
		assertTrue(selenium.isElementPresent(this.getXPathChapter()));
	}

	@Test
	public void testOpenChapter() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		this.openBook();
		this.openChapter();
		assertTrue(selenium.isElementPresent(this.getXPathSection()));
	}
	
	@Test
	public void testOpenSection() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.waitForLoading();
		assertEquals("Fractions", this.getNavTestText(XpathUtilsNav.getFractionIndexPage()).getText());
	}
	
	@Test
	public void testBackArrow() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickArrowBackButton();
		assertEquals("Challenge Problems", this.getNavTestText(XpathUtilsNav.getChallengeProblem()).getText());
	}
	
	@Test
	public void testForwardArrow() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickArrowForwardButton();
		assertEquals("What is a Fraction?", this.getNavTestText(XpathUtilsNav.getWhatIsAFraction()).getText());
	}
	
	@Test
	public void testClickRelatedItems(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickRelatedItem("Division");
		assertTrue(this.elementExists(this.getXPathDivisionPage()));
	}
	
}
