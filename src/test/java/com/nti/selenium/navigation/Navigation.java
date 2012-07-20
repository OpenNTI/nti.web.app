package com.nti.selenium.navigation;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import static org.junit.Assert.fail;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import com.nti.selenium.login.Login;
import com.nti.selenium.misc.XpathUtilsMisc;
import com.nti.selenium.search.XpathUtilsSearch;

public class Navigation extends Login {

	private String book = null;
	private String chapter = null;
	private String section = null;
	private String relatedItem = null;

	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.login();
	}

	public void openLevel(final String xpath) {
		this.switchToDefault();
		this.findElement(xpath).click();
	}

	public void openLevelClick(final String xpath) {
		this.switchToDefault();
		this.waitForElement(xpath);
		this.findElement(xpath).click();
	}

	public void openLibrary() {
		this.switchToDefault();
		this.waitForLoading();
		this.openLevel(XpathUtilsNav.getLibrary());
	}

	public void openBook() {
		this.switchToDefault();
		this.waitForElement(this.getXPathBook());
		this.openLevel(this.getXPathBook());
	}

	public void openChapter() {
		this.switchToDefault();
		this.openLevelClick(this.getXPathChapter());
	}

	public void openSection() {
		this.switchToDefault();
		this.openLevelClick(this.getXPathSection());
		this.openBook();
		this.waitForLoading();
	}

	public void clickArrowBackButton() {
		this.switchToDefault();
		this.findElement(XpathUtilsNav.getBackArrow()).click();
		this.waitForLoading();
	}

	public void clickArrowForwardButton() {
		this.switchToDefault();
		this.findElement(XpathUtilsNav.getForwardArrow()).click();
		this.waitForLoading();
	}

	public void clickRelatedItem(final String item) {
		this.setRelatedItem(item);
		this.switchToIframe();
		this.findElement(this.getXPathRelatedItem()).click();
		this.waitForLoading();
	}

	public void navigateTo(final String book, final String chapter, final String section) {
		this.setLocation(book, chapter, section);
		this.switchToDefault();
		try{
			if (book == null) {
				return;
			} else if(chapter == null && section == null) {
				this.openLibrary();
				this.openBook();
			} else if(chapter == null && section != null) {
				this.openLibrary();
				this.openBook();
				this.openSection();
			} else if(chapter != null && section == null) {
				this.openLibrary();
				this.openBook();
				this.openChapter();
			} else {
				this.openLibrary();
				this.openBook();
				this.openChapter();
				this.openSection();
			}
			this.waitForLoading();
		}
		catch (NoSuchElementException e) {
			fail("unable to navigate to specified location");
		}
	}

	public WebElement getNavTestText(final String xpath) {
		this.switchToIframe();
		return this.findElement(xpath);
	}

	public void setRelatedItem(final String relatedItem) {
		this.relatedItem = relatedItem;
	}

	public void setLocation(final String book, final String chapter, final String section) {
		this.book = book;
		this.chapter = chapter;
		this.section = section;
	}

	public String getXPathBook() {
		return XpathUtilsNav.getBook(this.book);
	}

	public String getXPathChapter() {
		return XpathUtilsNav.getChapter(this.chapter);
	}

	public String getXPathSection() {
		return XpathUtilsNav.getSection(this.section);
	}

	public String getXPathRelatedItem() {
		return XpathUtilsNav.getRelatedItem(this.relatedItem);
	}

	public String getXPathDivisionPage() {
		return XpathUtilsNav.getSectionPageTitle(this.relatedItem);
	}

	public boolean isChecked(String name) {
		final WebElement element = this.findElement(XpathUtilsSearch.getSearchTextBoxExpandMenuItem(name));
		final String clazz = element.getAttribute("class");
		return !(clazz.matches(".*unchecked.*"));
	}

	public void clickChapterDropDown() {
		this.switchToDefault();
		this.findElement(XpathUtilsMisc.dropDownChapter()).click();
	}

	public void clickSectionDropDown() {
		this.switchToDefault();
		this.findElements(XpathUtilsMisc.dropDownSection()).get(0).click();
	}

	private WebElement[] getElementArray(final WebElement... allElements) {
		final List<WebElement> chapterElements = new ArrayList<WebElement>();
		this.wait_(1);
		for(final WebElement element: allElements)
		{
			if (element.getAttribute("id").matches("menu(check)?item-\\d{4,}")) {
				chapterElements.add(element);
			}
		}
		return chapterElements.toArray(new WebElement[chapterElements.size()]);
	}

	public int getListCount() {
		final List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		final WebElement[] elements = new WebElement[allElements.size()];
		return this.getElementArray(allElements.toArray(elements)).length;
	}

	public String getListItemTitle(final int chapterNum) {
		final List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		final WebElement[] elements = new WebElement[allElements.size()];
		final WebElement element = this.getElementArray(allElements.toArray(elements))[chapterNum];
		return element.getText();
	}

	public void clickListItem(final String itemName) {
		final List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		final WebElement[] elements = new WebElement[allElements.size()];
		final WebElement[] selectableElements = this.getElementArray(allElements.toArray(elements));
		for (final WebElement element: selectableElements) 
		{
			if (element.getText().equals(itemName)) {
				element.click();
				break;
			}
		}
		this.waitForLoading();
	}

	public void clickListItem(final int chapterNum) {
		final List<WebElement> allElements = this.findElements(XpathUtilsMisc.dropDownList());
		final WebElement[] elements = new WebElement[allElements.size()];
		final WebElement element = this.getElementArray(allElements.toArray(elements))[chapterNum];
		element.click();
		this.waitForLoading();
	}

}
