package com.nti.selenium.misc;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.login.XpathUtilsLogin;
import com.nti.selenium.navigation.Navigation;
import com.nti.selenium.search.XpathUtilsSearch;

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
		this.findElements(XpathUtilsMisc.dropDownSection()).get(0).click();
	}
	
	public void clickShowMeDropDown(){
		this.findElements(XpathUtilsMisc.dropDownShowMe()).get(1).click();
	}
	
	private WebElement[] getElementArray(WebElement[] allElements){
		List<WebElement> chapterElements = new ArrayList<WebElement>();
		this.wait_(1);
		for(WebElement element: allElements){
			if(element.getAttribute("id").matches("menu(check)?item-\\d{4,}")){
				chapterElements.add(element);
			}
		}
		return chapterElements.toArray(new WebElement[chapterElements.size()]);
	}
	
	public int getListCount(){
		List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		WebElement[] elements = new WebElement[allElements.size()];
		return this.getElementArray(allElements.toArray(elements)).length;
	}
	
	public String getListItemTitle(int chapterNum){
		List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		WebElement[] elements = new WebElement[allElements.size()];
		WebElement element = this.getElementArray(allElements.toArray(elements))[chapterNum];
		return element.getText();
	}
	
	public void clickListItem(String itemName){
		List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		WebElement[] elements = new WebElement[allElements.size()];
		WebElement[] selectableElements = this.getElementArray(allElements.toArray(elements));
		for(WebElement element: selectableElements){
			if(element.getText().equals(itemName)){
				element.click();
				break;
			}
		}
		this.waitForLoading();
	}
	
	public void clickListItem(int chapterNum){
		List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		WebElement[] elements = new WebElement[allElements.size()];
		WebElement element = this.getElementArray(allElements.toArray(elements))[chapterNum];
		element.click();
		this.waitForLoading();
	}
	
	public void clickOptionsMyAccountButton(){
		this.findElement(XpathUtilsLogin.getOptions()).click();
		this.waitForElement(XpathUtilsMisc.getMyAccountButton());
		this.findElement(XpathUtilsMisc.getMyAccountButton()).click();
	}
	
	public void clickChangePasswordLink(){
		this.findElement(XpathUtilsMisc.getChangePasswordLink()).click();
	}
	
	public void clickOptionsPrivacyButton(){
		this.findElement(XpathUtilsMisc.getMyAccountButton()).click();
	}
	
}
