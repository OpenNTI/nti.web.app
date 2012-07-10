package com.nti.selenium.search;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.navigation.Navigation;

public class Search extends Navigation{

	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
		this.findElement(XpathUtilsSearch.getSearch()).click();
	}
	
	public void insertSearchText(String text){
		this.findElement(XpathUtilsSearch.getSearchField()).sendKeys(text);
		this.waitForElement(XpathUtilsSearch.getBookResultTitle("Prealgebra"));
	}
	
	public void clickSearchedBook(String bookName){
		List<WebElement> elements = this.findElements(XpathUtilsSearch.getBooks());
		Pattern p = Pattern.compile(bookName.toUpperCase(), Pattern.MULTILINE);
		for(WebElement element: elements){
			Matcher m = p.matcher(element.getText());
			if(m.matches()){
				element.click();
			}
		}
	}
	
}
