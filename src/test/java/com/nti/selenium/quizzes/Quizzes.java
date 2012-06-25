package com.nti.selenium.quizzes;


import com.nti.selenium.navigation.Navigation;
import org.junit.Before;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class Quizzes extends Navigation {
	
	private String focusedQuestionXpath = null;
	
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
		String xpath = this.findBlank(questionID);
		String answer = "";
		for(WebElement element: this.driver.findElements(By.xpath(xpath+"//span"))){
			String character = element.getText();
			answer = answer + character;
		}
		return answer;
	}
	
	public void clickBlank(String questionID){
		String xpathInput = this.findBlank(questionID);
		this.findContentElement(xpathInput).click();
		this.focusedQuestionXpath = xpathInput;
	}
	
	public void answerQuestion(String questionID, String answer){
		this.clickBlank(questionID);
		String xpathInput = this.findBlank(questionID);
		this.driver.findElement(By.xpath(xpathInput + this.getTextBlankXpathAddon())).sendKeys(answer);
	}
	
	public void clickMathSymbol(String mathSymbol){
		String xpathInput = this.xpathTextBuilder("span", mathSymbol);
		this.driver.findElement(By.xpath("//div[@class='x-window-body-default']")).click();
	}
	
	public void clickSubmit(){
		String xpathSubmit = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Submit");
//		this.clickElement(xpathSubmit);
	}
	
	public void clickReset(){
		String xpathSubmit = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Reset");
//		this.clickElement(xpathSubmit);
	}
	
	public void completeQuiz100Percent(){
		
	}
	
	public void completeQuiz0Percent(){
		
	}
	
}
