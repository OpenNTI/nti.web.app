package com.nti.selenium.quizzes;


import java.util.List;
import java.util.regex.Pattern;

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
		
	private String getMathSymbolsWindowNotVisibleClass(){
		return "x-window x-layer x-window-default x-closable x-window-closable x-window-default-closable x-unselectable x-hide-offsets";
	}
	
	private String findBlank(String questionID){
		return this.xpathAttributeBuilder("li", "value", questionID)
				+ this.xpathAddonBuilder("div", "class", "question")
				+ this.xpathAddonBuilder("div", "class", "answerblock")
				+ "//span";
	}
	
	private String findResult(String questionID){
		return this.xpathAttributeBuilder("li", "value", questionID)
				+ this.xpathAddonBuilder("div", "class", "question")
				+ this.xpathAddonBuilder("div", "class", "result");
	}
	
	private String getTextBlankXpathAddon(){
		return this.xpathAddonBuilder("span", "class", "textarea") + "//textarea";
	}
	
	public String noAnswerXpath(String questionID){
		this.switchToIframe();
		return this.findResult(questionID) +
			   this.xpathAttributeBuilder("span", "class", "result noanswer");
	}
	
	public String correctAnswerXpath(String questionID){
		this.switchToIframe();
		return this.findResult(questionID) + 
			   this.xpathAttributeBuilder("span", "class", "result correct");
	}
	
	public String incorrectAnswerXpath(String questionID){
		this.switchToIframe();
		return this.findResult(questionID) + 
			   this.xpathAttributeBuilder("span", "class", "result incorrect");
	}
	
	public String answerableXpath(String questionID){
		this.switchToIframe();
		return this.xpathAttributeBuilder("li", "value", questionID)
				+ this.xpathAddonBuilder("div", "class", "question")
				+ this.xpathAddonBuilder("div", "class", "result hidden");
	}
	
	public String getMathSymbolsXButtonXpath(){
		return this.xpathAttributeBuilder("img", "class", "x-tool-close");
	}

	public String getMathSymbolsWindowNotVisibleXpath(){
		return this.xpathAttributeBuilder("div", "class", this.getMathSymbolsWindowNotVisibleClass());
	}
	
	public String getOldQuizzesQuestionMarkXpath(){
		return this.xpathAttributeBuilder("img", "class", "action quizresults");
	}
	
	public String getOldQuizzesXpath(){
		return this.xpathAttributeBuilder("div", "class", "x-component x-box-item x-component-default x-menu-item");
	}
	
	public String getOldQuizAnswerXpath(String questionID, String answer){
		String x = this.incorrectAnswerXpath(questionID) + 
				"//span[@class='mathjax tex2jax_process response answer-text']" +
				"//span[@class='MathJax_MathML']";
//				"//math" +
//				"//mn[text()='" + answer + "']";
//		System.out.println(x);
		return x;
	}
	
	public String getTextInAnswerblock(String questionID){
		this.switchToIframe();
		String xpath = this.findBlank(questionID);
		String answer = "";
		for(WebElement element: this.driver.findElements(By.xpath(xpath+"//span"))){
			String character = element.getText();
			answer = answer + character;
		}
		return answer;
	}
	
	public void clickBlank(String questionID){
		this.switchToIframe();
		String xpathInput = this.findBlank(questionID);
		this.switchToIframe();
		this.findElement(xpathInput).click();
	}
	
	public void answerQuestion(String questionID, String answer){
		this.switchToIframe();
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
		this.switchToIframe();
		String xpathSubmit = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Submit");
		this.findElement(xpathSubmit).click();
		this.waitForLoading(timeout);
	}
	
	public void clickReset(){
		this.switchToIframe();
		String xpathReset = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Reset");
		this.findElement(xpathReset).click();
		this.waitForLoading(timeout);
	}
	
	public void clickMathSymbolsXButton(){
		this.switchToDefault();
		this.waitForElement(this.getMathSymbolsXButtonXpath(), timeout);
		this.findElement(this.getMathSymbolsXButtonXpath()).click();
	}
	
	public void inspectPreviousQuiz(String answer){
		this.answerQuestion("1", answer);
		this.clickSubmit();
		this.clickReset();
		this.clickArrowForwardButton();
		this.clickArrowBackButton();
		this.switchToDefault();
		this.wait_(3);
		List<WebElement> quizQuestionMarkElements = this.findElements(this.getOldQuizzesQuestionMarkXpath());
		quizQuestionMarkElements.get(quizQuestionMarkElements.size()-1).click();
		List<WebElement> quizElements = this.findElements(this.getOldQuizzesXpath());
		quizElements.get(quizQuestionMarkElements.size()-1).click();
	}
	
}
