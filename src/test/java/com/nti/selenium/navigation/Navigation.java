package com.nti.selenium.navigation;

import org.junit.After;
import org.junit.Before;

import com.nti.selenium.login.Login;

public class Navigation extends Login {

	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.login();
	}
	
	public void openLevel() {
	}
	
	public void findAndParseElements(final String xpath) {
		
	}
	
	public void openLibrary() {
		
	}
	
	public void openBook(final String book) {
		
	}
	
	public void openChapter(final String chapter){
		
	}
	
	public void openSection(final String section){
		
	}
	
	public void navigateTo(final String book,final String chapter, final String section) {
		
		if(book == null){
			return;
		} else if(chapter == null && section == null) {
			this.openLibrary();
			this.openBook(book);
		} else if(chapter == null && section != null) {
			this.openLibrary();
			this.openBook(book);
			this.openSection(section);
		} else if(chapter != null && section == null) {
			this.openLibrary();
			this.openBook(book);
			this.openChapter(chapter);
		} else {
			this.openLibrary();
			this.openBook(book);
			this.openChapter(chapter);
			this.openSection(section);
		}
	}
	
	public void getPageSectionTitle(){
		
	}
	
	public void openSearch(){
		
	}
	
	public void pagerMover(){
		
	}
	
	public void menuJumper(){
		
	}
	
}
