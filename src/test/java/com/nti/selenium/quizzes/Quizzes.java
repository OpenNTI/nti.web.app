package com.nti.selenium.quizzes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.List;
import java.util.NoSuchElementException;

import com.nti.selenium.XpathUtils;
import com.nti.selenium.navigation.Navigation;

import org.junit.Before;
import org.openqa.selenium.WebElement;

public class Quizzes extends Navigation {
	
	protected String[] answers = {"420", "3", "69", "5", "40", "64", "480", "5/8", "6", "3"};
	protected String wrongAnswer = "wrongAnswer";
	protected XpathUtilsQuizzes xpath;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.navigateTo("MathCounts 2012", null, "Warm-Up 1");
		this.xpath = new XpathUtilsQuizzes();
	}
	
	public void print(){
		System.out.println("quizzes");
	}
	
	public String getTextInAnswerblock(final String questionID) {
		this.switchToIframe();
		this.xpath.setActiveQuestion(questionID);
		final StringBuilder answer = new StringBuilder();
		for (final WebElement element: this.findElements((this.xpath.buildString(this.xpath.getAnswerBlank(), "//span"))))
		{
			final String character = element.getText();
			answer.append(character);
		}
		return answer.toString();
	}
	
	public void clickBlank(final String questionID) {
		this.switchToIframe();
		this.xpath.setActiveQuestion(questionID);
		this.switchToIframe();
		this.findElement(this.xpath.getAnswerBlank()).click();
	}
	
	public void answerQuestion(final String questionID, final String answer) {
		this.switchToIframe();
		this.clickBlank(questionID);
		for(char ch: (answer).toCharArray()){
			this.findElement(this.xpath.getQuestionTextArea()).sendKeys(Character.toString(ch));
		}
	}
	
	public void clickSqrtMathSymbol() {
		this.switchToDefault();
		this.switchToDefault();
		this.findElement(this.xpath.getSqrtButton()).click();
	}
	
	public void clickSubmit() {
		this.switchToIframe();
		this.findElement(this.xpath.getSubmitButton()).click();
		this.waitForLoading(timeout);
	}
	
	public void clickReset() {
		this.switchToIframe();
		this.findElement(this.xpath.getResetButton()).click();
		this.waitForLoading(timeout);
	}
	
	public void clickMathSymbolsXButton() {
		this.switchToDefault();
		this.waitForElement(this.xpath.getMathSymbolsXButton(), timeout);
		this.findElement(this.xpath.getMathSymbolsXButton()).click();
	}
	
	public void openWhyBubble(){
		this.findElement(this.xpath.getClosedWhyBubble()).click();
	}
	
	public void closeWhyBubble(){
		this.findElement(this.xpath.getOpenWhyBubble()).click();
	}
	
	public void inspectPreviousQuiz(String answer){
		this.answerQuestion("1", answer);
		this.clickSubmit();
		this.clickReset();
		this.clickArrowForwardButton();
		this.clickArrowBackButton();
		this.switchToDefault();
		List<WebElement> quizQuestionMarkElements = this.findElements(this.xpath.getOldQuizzesQuestionMark());
		quizQuestionMarkElements.get(quizQuestionMarkElements.size()-1).click();
		List<WebElement> quizElements = this.findElements(this.xpath.getOldQuizzes());
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
			this.xpath.setActiveQuestion(Integer.toString(i + 1));
			String answerInElement = this.findElement(this.xpath.getCorrectAnswerResult()).getText();
			String[] answerParts = {"\"", this.answers[i], "\" is correct"};
			for(char character: this.answers[i].toCharArray()){
				if('/' == character){
					answerParts[1] = this.xpath.buildString(this.answers[i].split("/"));
					break;
				}
			}
			String answer = this.xpath.buildString(answerParts);
			try{
			assertEquals(answer, answerInElement);
			}
			catch(NoSuchElementException e){
				fail("answer evaluated to incorrect, expected correct answer");
			}
		}
	}
	
	public void checkAnswers0Percent(){
		for(int i = 0; i < 10; i++){
			this.xpath.setActiveQuestion(Integer.toString(i + 1));
			String answerInElement = this.findElement(this.xpath.getIncorrectAnswerResult()).getText();
			String answer = this.xpath.buildString("\"", this.wrongAnswer, "\" is incorrect");
			try{
				assertEquals(answer, answerInElement);
			}
			catch(NoSuchElementException e){
				fail("answer evaluated to correct, expected incorrect answer");
			}
		}
	}
	
}
