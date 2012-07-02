package com.nti.selenium.navigation;

import org.junit.Test;

import com.nti.selenium.XpathUtils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class TestNavigation extends Navigation {

	@Test
	public void testOpenLibrary() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		assertTrue(selenium.isElementPresent(this.xpath.getBook()));
	}
	
	@Test
	public void testOpenBook() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		this.openBook();
		assertTrue(selenium.isElementPresent(this.xpath.getChapter()));
	}

	@Test
	public void testOpenChapter() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		this.openBook();
		this.openChapter();
		assertTrue(selenium.isElementPresent(this.xpath.getSection()));
	}
	
	@Test
	public void testOpenSection() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.waitForLoading(timeout);
		assertEquals("Fractions", this.getNavTestText(this.xpath.getFractionIndexPage()).getText());
	}
	
	@Test
	public void testBackArrow() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickArrowBackButton();
		assertEquals("Challenge Problems", this.getNavTestText(this.xpath.getChallengeProblem()).getText());
	}
	
	@Test
	public void testForwardArrow() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickArrowForwardButton();
		assertEquals("What is a Fraction?", this.getNavTestText(this.xpath.getWhatIsAFraction()).getText());
	}
	
	@Test
	public void testClickRelatedItems(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickRelatedItem("Division");
		assertTrue(this.elementExists(this.xpath.getDivisionPage()));
	}
	
}
