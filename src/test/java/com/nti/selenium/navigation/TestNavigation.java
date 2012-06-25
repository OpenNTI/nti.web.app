package com.nti.selenium.navigation;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class TestNavigation extends Navigation {

	@Test
	public void testOpenLibrary(){
		this.setBook("Prealgebra");
		this.openLibrary();
		assertTrue(selenium.isElementPresent(this.getBookXpath()));
	}
	
	@Test
	public void testOpenBook(){
		this.setBook("Prealgebra");
		this.setChapter("Fractions");
		this.openLibrary();
		this.openBook();
		assertTrue(selenium.isElementPresent(this.getChapterXpath()));
	}

	@Test
	public void testOpenChapter(){
		this.setBook("Prealgebra");
		this.setChapter("Fractions");
		this.setSection("Index");
		this.openLibrary();
		this.openBook();
		this.openChapter();
		assertTrue(selenium.isElementPresent(this.getSectionXpath()));
	}
	
	@Test
	public void testOpenSection(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.waitForLoading(timeout);
		assertEquals("Fractions", this.getNavTestText(this.getFractionIndexPageXpath()).getText());
	}
	
	@Test
	public void testBackArrow(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickArrowBackButton();
		assertEquals("Challenge Problems", this.getNavTestText(this.getChallengeProblemXpath()).getText());
	}
	
	@Test
	public void testForwardArrow(){
		this.navigateTo("Prealgebra", "Fractions", "Index");
		this.clickArrowForwardButton();
		assertEquals("What is a Fraction?", this.getNavTestText(this.getWhatIsAFractionXpath()).getText());
	}
	
}
