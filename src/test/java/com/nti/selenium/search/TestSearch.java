package com.nti.selenium.search;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Test;
import org.openqa.selenium.WebElement;

public class TestSearch extends Search{

	@Test
	public void testEnterText(){
		this.findElement(XpathUtilsSearch.getSearchField()).sendKeys("math");
		this.waitForElement(XpathUtilsSearch.getBookSearchResults());
		assertTrue(this.elementExists(XpathUtilsSearch.getBookSearchResults()));
	}
	
//	@Test
//	public void testNavigateToItem(){
//		
//	}
//	
//	@Test
//	public void testSeeAll(){
//		
//	}
//	
//	@Test
//	public void testClickExpandArrow(){
//		
//	}
//	
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
