package com.nti.selenium.quizzes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.List;
import java.util.NoSuchElementException;

import com.nti.selenium.navigation.Navigation;

import org.junit.Before;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class Quizzes extends Navigation {
	
	protected String[] answers = {"420", "3", "69", "5", "40", "64", "480", "5/8", "6", "3"};
	protected String wrongAnswer = "wrongAnswer";
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.navigateTo("MathCounts 2012", null, "Warm-Up 1");
	}
		
	private String getMathSymbolsWindowNotVisibleClass(){
		return "x-window x-layer x-window-default x-closable x-window-closable x-window-default-closable x-unselectable x-hide-offsets";
	}
	
	private String findBlank(final String questionID) {
		return this.buildString(this.xpathAttributeBuilder("li", "value", questionID), 
								this.xpathAddonBuilder("div", "class", "question"),
								this.xpathAddonBuilder("div", "class", "answerblock"),
								"//span");
	}
	
	private String findResult(final String questionID) {
		return this.buildString(this.xpathAttributeBuilder("li", "value", questionID),
								this.xpathAddonBuilder("div", "class", "question"),
								this.xpathAddonBuilder("div", "class", "result"));
	}
	
	private String getTextBlankXpathAddon() {
		return this.xpathAddonBuilder("span", "class", "textarea") + "//textarea";
	}
	
	public String noAnswerXpath(final String questionID) {
		this.switchToIframe();
		return this.buildString(this.findResult(questionID),
								this.xpathAttributeBuilder("span", "class", "result noanswer"));
	}
	
	public String correctAnswerXpath(final String questionID) {
		this.switchToIframe();
		return this.buildString(this.findResult(questionID),
								this.xpathAttributeBuilder("span", "class", "result correct"));
	}
	
	public String incorrectAnswerXpath(final String questionID) {
		this.switchToIframe();
		return this.buildString(this.findResult(questionID),
								this.xpathAttributeBuilder("span", "class", "result incorrect"));
	}
	
	public String answerableXpath(final String questionID) {
		this.switchToIframe();
		return this.buildString(this.xpathAttributeBuilder("li", "value", questionID),
								this.xpathAddonBuilder("div", "class", "question"),
								this.xpathAddonBuilder("div", "class", "result hidden"));
	}
	
	public String getMathSymbolsXButtonXpath() {
		return this.xpathAttributeBuilder("img", "class", "x-tool-close");
	}

	public String getMathSymbolsWindowNotVisibleXpath() {
		return this.xpathAttributeBuilder("div", "class", this.getMathSymbolsWindowNotVisibleClass());
	}
	
	public String getOldQuizzesQuestionMarkXpath() {
		return this.xpathAttributeBuilder("img", "class", "action quizresults");
	}
	
	public String getOldQuizzesXpath() {
		return this.xpathAttributeBuilder("div", "class", "x-component x-box-item x-component-default x-menu-item");
	}

	public String getOldQuizAnswerXpath(String questionID){
		return this.xpathAttributeBuilder("input", "id", "1") +
				"/../../div[@class='result']" +
				"//span[@class='mathjax tex2jax_process response answer-text']" +
				"//span[@class='MathJax_MathML']";
	}
	
	public String getClosedWhyBubbleXpath(){
		return this.findResult("1") +
			   this.xpathAttributeAndTextBuilder("a", "class", "why", "Why?");
	}
	
	public String getOpenWhyBubbleXpath(){
		return this.findResult("1") +
			   this.xpathAttributeAndTextBuilder("a", "class", "why bubble", "Why?");
	}
	
	public String getFractionQuizAnswerXpath(String questionID){
		return this.findResult(questionID) +
			   this.xpathAttributeBuilder("span", "class", "mathjax tex2jax_process response answer-text") +
			   this.xpathAttributeBuilder("script", "type", "math/tex");
	}
	
	public String getTextInAnswerblock(final String questionID) {
		this.switchToIframe();
		final String xpath = this.findBlank(questionID);
		final StringBuilder answer = new StringBuilder();
		for (final WebElement element: this.driver.findElements(By.xpath(xpath+"//span")))
		{
			final String character = element.getText();
			answer.append(character);
		}
		return answer.toString();
	}
	
	public void clickBlank(final String questionID) {
		this.switchToIframe();
		String xpathInput = this.findBlank(questionID);
		this.switchToIframe();
		this.findElement(xpathInput).click();
	}
	
	public void answerQuestion(final String questionID, final String answer) {
		this.switchToIframe();
		this.clickBlank(questionID);
		final String xpathInput = this.findBlank(questionID);
		for(char ch: (answer).toCharArray()){
			this.findElement(xpathInput + this.getTextBlankXpathAddon()).sendKeys(Character.toString(ch));
		}
	}
	
	public void clickMathSymbol(final String mathSymbol) {
		this.switchToDefault();
		final String xpathInput = this.xpathTextBuilder("span", mathSymbol);
		this.switchToDefault();
		this.findElement(xpathInput).click();
	}
	
	public void clickSubmit() {
		this.switchToIframe();
		final String xpathSubmit = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Submit");
		this.findElement(xpathSubmit).click();
		this.waitForLoading(timeout);
	}
	
	public void clickReset() {
		this.switchToIframe();
		final String xpathReset = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Reset");
		this.findElement(xpathReset).click();
		this.waitForLoading(timeout);
	}
	
	public void clickMathSymbolsXButton() {
		this.switchToDefault();
		this.waitForElement(this.getMathSymbolsXButtonXpath(), timeout);
		this.findElement(this.getMathSymbolsXButtonXpath()).click();
	}
	
	public void openWhyBubble(){
		this.findElement(this.getClosedWhyBubbleXpath()).click();
	}
	
	public void closeWhyBubble(){
		this.findElement(this.getOpenWhyBubbleXpath()).click();
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
	
	public void completeQuiz100Percent(){
		for(int i = 0; i < 10; i++){
			this.answerQuestion(Integer.toString(i + 1), this.answers[i]);
		}
		this.clickSubmit();
	}
	
	public void completeQuiz0Percent(){
		for(int i = 0; i < 10; i++){
			this.answerQuestion(Integer.toString(i + 1), this.wrongAnswer);
		}
		this.clickSubmit();
	}
	
	public void checkAnswers100Percent(){
		for(int i = 0; i < 10; i++){
			String element = this.findElement(this.correctAnswerXpath(Integer.toString(i + 1))).getText();
			String[] answerParts = {"\"", this.answers[i], "\" is correct"};
			for(char character: this.answers[i].toCharArray()){
				if('/' == character){
					answerParts[1] = this.buildString(this.answers[i].split("/"));
					break;
				}
			}
			String answer = this.buildString(answerParts);
			assertEquals(answer, element);
		}
	}
	
	public void checkAnswers0Percent(){
		for(int i = 0; i < 10; i++){
			try{
				assertEquals("\"" + this.wrongAnswer + "\" is incorrect", this.findElement(this.incorrectAnswerXpath(Integer.toString(i + 1))).getText());
			}
			catch(NoSuchElementException e){
				fail("answer evaluated to incorrect, expected correct answer");
			}
		}
	}
	
}
