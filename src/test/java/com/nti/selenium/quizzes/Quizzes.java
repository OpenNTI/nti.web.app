package com.nti.selenium.quizzes;


import com.nti.selenium.navigation.Navigation;
import org.junit.Before;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class Quizzes extends Navigation {
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.navigateTo("MathCounts 2012", null, "Warm-Up 1");
	}
	
	private String findBlank(String questionID){
		return this.xpathAttributeBuilder("li", "value", questionID)
				+ this.xpathAddonBuilder("div", "class", "question")
				+ this.xpathAddonBuilder("div", "class", "answerblock")
				+ "//span";
	}
	
	private String getTextBlankXpathAddon(){
		return this.xpathAddonBuilder("span", "class", "textarea") + "//textarea";
	}
	
	public String getTextInAnswerblock(String questionID){
		this.switchiToIframe();
		String xpath = this.findBlank(questionID);
		String answer = "";
		for(WebElement element: this.driver.findElements(By.xpath(xpath+"//span"))){
			String character = element.getText();
			answer = answer + character;
		}
		return answer;
	}
	
	public void clickBlank(String questionID){
		this.switchiToIframe();
		String xpathInput = this.findBlank(questionID);
		this.switchiToIframe();
		this.findElement(xpathInput).click();
	}
	
	public void answerQuestion(String questionID, String answer){
		this.switchiToIframe();
		this.clickBlank(questionID);
		String xpathInput = this.findBlank(questionID);
		this.findElement(xpathInput + this.getTextBlankXpathAddon()).sendKeys(answer);
	}
	
	public void clickMathSymbol(String mathSymbol){
		this.switchToDefault();
		String xpathInput = this.xpathTextBuilder("span", mathSymbol);
		this.switchToDefault();
		this.findElement(xpathInput).click();
	}
	
	public void clickSubmit(){
		this.switchiToIframe();
		String xpathSubmit = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Submit");
		this.findElement(xpathSubmit).click();
		this.waitForLoading(timeout);
	}
	
	public void clickReset(){
		this.switchiToIframe();
		String xpathReset = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Reset");
		this.findElement(xpathReset).click();
		this.waitForLoading(timeout);
	}
	
	public void completeQuiz100Percent(){
		
	}
	
	public void completeQuiz0Percent(){
		
	}
	
	public String assertXpath(){
		this.switchiToIframe();
		return this.xpathAttributeBuilder("span", "id", "noanswer");
	}
	
}
