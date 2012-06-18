package com.nti.selenium.navigation;

import org.junit.Test;

public class TestNavigation extends Navigation {

//	@Test
//	public void testOpenLibrary(){
//		this.setBook("Prealgebra");
//		this.openLibrary();
//	}
	
	@Test
	public void testOpenBook(){
		this.setBook("Prealgebra");
		this.setChapter("Fractions");
		this.openLibrary();
		this.openBook();
	}
	
}
