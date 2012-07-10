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
		assertTrue(this.elementExists(XpathUtilsSearch.getBookResultTitle("Prealgebra")));
		assertTrue(this.elementExists(XpathUtilsSearch.getBookResultSection("Arithmetic with Square Roots")));
	}
	
	@Test
	public void testNavigateToItem(){
		this.insertSearchText("math");
		this.clickSearchedBook("Arithmetic with Square Roots");
		this.waitForLoading();
		assertEquals("Arithmetic with Square Roots", this.getNavTestText((XpathUtilsSearch.getSectionTitle("Arithmetic with Square Roots"))).getText());
	}
	
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
