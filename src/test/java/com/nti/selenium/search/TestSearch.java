package com.nti.selenium.search;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestSearch extends Search{

	@Test
	public void testEnterText(){
		this.insertSearchText("math");
		assertTrue(this.elementExists(XpathUtilsSearch.getBookSearchResults()));
		assertTrue(this.findNumberOfSearchResults() > 0);
	}
	
	@Test
	public void testNavigateToItem(){
		this.insertSearchText("math");
		assertTrue(this.elementExists(XpathUtilsSearch.getBookSearchResults()));
		assertTrue(this.findNumberOfSearchResults() > 0);
		String sectionTitle = this.findSectionTitle(0);
		this.clickSearchedBook(sectionTitle);
		this.waitForLoading();
		sectionTitle = this.convertSectionTitleToTextTitle(sectionTitle);
		assertTrue(this.elementExists(XpathUtilsSearch.getSectionTitle(sectionTitle)));
	}
	
	@Test
	public void testSeeAll(){
		this.insertSearchText("math");
		assertTrue(this.elementExists(XpathUtilsSearch.getBookSearchResults()));
		assertTrue(this.findNumberOfSearchResults() > 0);
		int beforeSeeAllNumOfResults = this.findNumberOfSearchResults();
		this.clickSeeAll();
		int afterSeeAllNumOfResults = this.findNumberOfSearchResults();
		assertTrue(beforeSeeAllNumOfResults < afterSeeAllNumOfResults);
	}
	
	@Test
	public void testClickExpandArrow(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
	}
	
	@Test
	public void testSearchOptionsEverything(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		assertTrue(this.isChecked("Everything"));
	}
	
	@Test
	public void testRemoveSearchEverything(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		this.clickMenuItem("Everything");
		assertTrue(this.isChecked("Everything"));
	}
	
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
	
	@Test
	public void testSwitchToMultipleSearchOptions(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		assertTrue(this.isChecked("Everything"));
		this.clickMenuItem("Books");
		this.clickMenuItem("Highlights");
		this.clickMenuItem("Notes");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Books"));
		assertTrue(this.isChecked("Highlights"));
		assertTrue(this.isChecked("Notes"));
	}
	
	@Test
	public void testSwitchBetweenMultipleItemsAndEverything(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		assertTrue(this.isChecked("Everything"));
		this.clickMenuItem("Books");
		this.clickMenuItem("Highlights");
		this.clickMenuItem("Notes");
		assertFalse(this.isChecked("Everything"));
		assertTrue(this.isChecked("Books"));
		assertTrue(this.isChecked("Highlights"));
		assertTrue(this.isChecked("Notes"));
		this.clickMenuItem("Everything");
		assertTrue(this.isChecked("Everything"));
		assertFalse(this.isChecked("Books"));
		assertFalse(this.isChecked("Highlights"));
		assertFalse(this.isChecked("Notes"));
	}
	
	@Test
	public void testSwitchToExactMatches(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		this.clickMenuItem("Exact Matches");
		assertTrue(this.isChecked("Exact Matches"));
		assertFalse(this.isChecked("Partial Matches"));
	}
	
	@Test
	public void testSwitchToPartialMatches(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		this.clickMenuItem("Partial Matches");
		assertFalse(this.isChecked("Exact Matches"));
		assertTrue(this.isChecked("Partial Matches"));
	}
	
	@Test
	public void testSelectAll(){
		this.clickSearchTextBoxExpandArrow();
		assertTrue(this.elementExists(XpathUtilsSearch.getSearchTextBoxExpandMenu()));
		assertTrue(this.isChecked("Everything"));
		this.clickMenuItem("Books");
		this.clickMenuItem("Highlights");
		this.clickMenuItem("Notes");
		this.clickMenuItem("Transcripts");
		this.clickMenuItem("Quiz Results");
		this.clickMenuItem("Bookmarks");
		this.clickMenuItem("Contacts");
		assertTrue(this.isChecked("Books"));
		assertTrue(this.isChecked("Highlights"));
		assertTrue(this.isChecked("Notes"));
		assertTrue(this.isChecked("Transcripts"));
		assertTrue(this.isChecked("Quiz Results"));
		assertTrue(this.isChecked("Bookmarks"));
		assertTrue(this.isChecked("Contacts"));
	}
	
}
