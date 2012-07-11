package com.nti.selenium.search;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Test;
import org.openqa.selenium.WebElement;

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
		String sectionTitle = this.findSectionTitle(0);
		this.clickSearchedBook(sectionTitle);
		this.waitForLoading();
		sectionTitle = this.convertSectionTitleToTextTitle(sectionTitle);
		assertTrue(this.elementExists(XpathUtilsSearch.getSectionTitle(sectionTitle)));
	}
	
	@Test
	public void testSeeAll(){
		this.insertSearchText("math");
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
	
//	@Test
//	public void testSearchEverything(){
//		
//	}
//	
//	@Test
//	public void testRemoveSearchEverything(){
//		
//	}
//	
//	@Test
//	public void testSearchBook(){
//		
//	}
//	
//	@Test
//	public void testRemoveSearchBook(){
//		
//	}
//	
//	@Test
//	public void testSwitchBetweenEverythingAndBook(){
//		
//	}
//	
//	@Test
//	public void testSwitchBetweenBookAndEverything(){
//		
//	}
//	
//	@Test
//	public void testSwitchBetweenMultipleItemsAndBook(){
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
