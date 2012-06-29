package com.nti.selenium.navigation;

import org.junit.Test;

import com.nti.selenium.Xpath;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class TestNavigation extends Navigation {

	@Test
	public void testOpenLibrary() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		assertTrue(selenium.isElementPresent(Xpath.book));
	}
	
	@Test
	public void testOpenBook() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		this.openBook();
		assertTrue(selenium.isElementPresent(Xpath.chapter));
	}

	@Test
	public void testOpenChapter() {
		this.setLocation("Prealgebra", "Fractions", "Index");
		this.openLibrary();
		this.openBook();
		this.openChapter();
		assertTrue(selenium.isElementPresent(Xpath.section));
	}
	
	@Test
	public void testOpenSection() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.waitForLoading(timeout);
		assertEquals("Fractions", this.getNavTestText(Xpath.fractionIndexPage).getText());
	}
	
	@Test
	public void testBackArrow() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickArrowBackButton();
		assertEquals("Challenge Problems", this.getNavTestText(Xpath.challengeProblem).getText());
	}
	
	@Test
	public void testForwardArrow() {
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickArrowForwardButton();
		assertEquals("What is a Fraction?", this.getNavTestText(Xpath.whatIsAFraction).getText());
	}
	
}
