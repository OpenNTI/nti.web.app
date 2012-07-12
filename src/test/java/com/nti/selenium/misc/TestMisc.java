package com.nti.selenium.misc;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebElement;

import com.nti.selenium.navigation.XpathUtilsNav;

public class TestMisc extends Misc{

	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
	}
	
	@Test
	public void testClickNextThoughtButton(){
		this.clickHomeButton();
		assertTrue(this.elementExists(XpathUtilsMisc.atHomePanel()));
	}
	
	@Test
	public void testClickChapterDropDown(){
		this.clickChapterDropDown();
		assertTrue(this.getListCount() > 0);
	}
	
	@Test
	public void testClickOnChapter(){
		this.clickChapterDropDown();
		assertTrue(this.getListCount() > 0);
		String title = this.getListItemTitle(0);
		this.clickListItem(0);
		assertEquals(title, this.getNavTestText(XpathUtilsNav.getSectionPageTitle(title)).getText());
	}
	
	@Test
	public void testClickSectionDropDown(){
		this.clickSectionDropDown();
		assertTrue(this.getListCount() > 0);
	}
	
	@Test
	public void testClickOnSection(){
		this.clickSectionDropDown();
		assertTrue(this.getListCount() > 0);
		String title = this.getListItemTitle(0);
		this.clickListItem(0);
		assertEquals(title, this.getNavTestText(XpathUtilsNav.getSectionPageTitle(title)).getText());
	}
	
}
