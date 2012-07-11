package com.nti.selenium.search;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Test;
import org.openqa.selenium.WebElement;

public class TestSearch extends Search{

//	@Test
//	public void testEnterText(){
//		this.insertSearchText("math");
//		assertTrue(this.elementExists(XpathUtilsSearch.getBookSearchResults()));
//		assertTrue(this.findNumberOfSearchResults() > 0);
//	}
//	
//	@Test
//	public void testNavigateToItem(){
//		this.insertSearchText("math");
//		String sectionTitle = this.findSectionTitle(0);
//		this.clickSearchedBook(sectionTitle);
//		this.waitForLoading();
//		sectionTitle = this.convertSectionTitleToTextTitle(sectionTitle);
//		assertTrue(this.elementExists(XpathUtilsSearch.getSectionTitle(sectionTitle)));
//	}
//	
//	@Test
//	public void testSeeAll(){
//		this.insertSearchText("math");
//		int beforeSeeAllNumOfResults = this.findNumberOfSearchResults();
//		this.clickSeeAll();
//		int afterSeeAllNumOfResults = this.findNumberOfSearchResults();
//		assertTrue(beforeSeeAllNumOfResults < afterSeeAllNumOfResults);
//	}
//	
//	@Test
//	public void testClickExpandArrow(){
//		this.clickSearchTextBoxExpandArrow();
//		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
//	}
//	
//	@Test
//	public void testSearchOptionsEverything(){
//		this.clickSearchTextBoxExpandArrow();
//		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
//		assertTrue(this.isChecked("Everything"));
//	}
//	
//	@Test
//	public void testRemoveSearchEverything(){
//		this.clickSearchTextBoxExpandArrow();
//		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
//		this.clickMenuItem("Everything");
//		assertTrue(this.isChecked("Everything"));
//	}
	
	@Test
	public void testSearchBook(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		assertTrue(this.isChecked("Everything"));
		this.clickMenuItem("Books");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Books"));
	}
	
	@Test
	public void testRemoveSearchBook(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		assertTrue(this.isChecked("Everything"));
		this.clickMenuItem("Books");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Books"));
		this.clickMenuItem("Books");
		assertFalse(this.isChecked("Everything"));
		assertFalse(this.isChecked("Books"));
	}
	
	@Test
	public void testSwitchBetweenBookAndEverything(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		assertTrue(this.isChecked("Everything"));
		this.clickMenuItem("Books");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Books"));
		this.clickMenuItem("Everything");
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Books"));
	}
	
//	@Test
//	public void testSwitchBetweenMultipleItemsAndEverything(){
//		
//	}
//	
//	@Test
//	public void testSwitchToExactMatches(){
//		
//	}
//	
//	@Test
//	public void testSwitchToPartialMatches(){
//		
//	}
//	
//	@Test
//	public void testSelectAll(){
//		
//	}
	
}
