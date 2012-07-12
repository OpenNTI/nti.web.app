package com.nti.selenium.misc;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.navigation.Navigation;

public class Misc extends Navigation{

	@Before
	public void setUp() throws Exception{
		super.setUp();
	}
	
	public void clickHomeButton(){
		this.findElement(XpathUtilsMisc.getHome()).click();
	}
	
	public void clickChapterDropDown(){
		this.findElement(XpathUtilsMisc.dropDownChapter()).click();
	}
	
	public void clickSectionDropDown(){
		this.findElement(XpathUtilsMisc.dropDownSection()).click();
	}
	
	private WebElement[] getElementArray(WebElement[] allElements){
		List<WebElement> chapterElements = new ArrayList<WebElement>();
		this.wait_(1);
		for(WebElement element: allElements){
			if(element.getAttribute("id").matches("menuitem-\\d{4,}")){
				chapterElements.add(element);
			}
		}
		return chapterElements.toArray(new WebElement[chapterElements.size()]);
	}
	
	public int getListCount(){
		List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownChapterList());
		WebElement[] elements = new WebElement[allElements.size()];
		return this.getElementArray(allElements.toArray(elements)).length;
	}
	
	public String getListItemTitle(int chapterNum){
		List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownChapterList());
		WebElement[] elements = new WebElement[allElements.size()];
		WebElement element = this.getElementArray(allElements.toArray(elements))[chapterNum];
		return element.getText();
	}
	
	public void clickListItem(int chapterNum){
		List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownChapterList());
		WebElement[] elements = new WebElement[allElements.size()];
		WebElement element = this.getElementArray(allElements.toArray(elements))[chapterNum];
		element.click();
		this.waitForLoading();
	}
	
}
