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
		this.waitForElement(XpathUtilsSearch.getSeeAllButton());
	}
	
	public int findNumberOfSearchResults(){
		List<WebElement> elements = this.findElements(XpathUtilsSearch.getBooks());
		return elements.size();
	}
	
	public String findSectionTitle(int bookNum){
		List<WebElement> elements = this.findElements(XpathUtilsSearch.getBooks());
		WebElement element = elements.get(bookNum);
		String result = element.getText();
		return result.split("\n")[1];
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
	
	public String convertSectionTitleToTextTitle(String sectionTitle){
		this.switchToIframe();
		List<WebElement> elements = this.findElements(XpathUtilsSearch.getSections());
		for(WebElement element: elements){
			String elementText = element.getText();
			if(elementText.toUpperCase().equals(sectionTitle)){
				return elementText;
			}
		}
		return null;
	}
	
	public void clickSeeAll(){
		this.findElement(XpathUtilsSearch.getSeeAllButton()).click();
	}
	
	public void clickSearchTextBoxExpandArrow(){
		this.findElement(XpathUtilsSearch.getSearchTextBoxExpandArrow()).click();
	}
	
	public void clickMenuItem(String name){
		this.findElement(XpathUtilsSearch.getSearchTextBoxExpandMenuItem(name)).click();
	}
	
}
