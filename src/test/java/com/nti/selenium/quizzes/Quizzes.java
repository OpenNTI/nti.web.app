package com.nti.selenium.quizzes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.List;
import java.util.NoSuchElementException;

import com.nti.selenium.Xpath;
import com.nti.selenium.navigation.Navigation;

import org.junit.Before;
import org.openqa.selenium.WebElement;

public class Quizzes extends Navigation {
	
	protected String[] answers = {"420", "3", "69", "5", "40", "64", "480", "5/8", "6", "3"};
	protected String wrongAnswer = "wrongAnswer";
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.navigateTo("MathCounts 2012", null, "Warm-Up 1");
	}
	
	public String getTextInAnswerblock(final String questionID) {
		this.switchToIframe();
		Xpath.setActiveQuestion(questionID);
		final StringBuilder answer = new StringBuilder();
		for (final WebElement element: this.findElements((Xpath.questionBlank+"//span")))
		{
			final String character = element.getText();
			answer.append(character);
		}
		return answer.toString();
	}
	
	public void clickBlank(final String questionID) {
		this.switchToIframe();
		Xpath.setActiveQuestion(questionID);
		this.switchToIframe();
		this.findElement(Xpath.questionBlank).click();
	}
	
	public void answerQuestion(final String questionID, final String answer) {
		this.switchToIframe();
		this.clickBlank(questionID);
		for(char ch: (answer).toCharArray()){
			this.findElement(Xpath.questionTextArea).sendKeys(Character.toString(ch));
		}
	}
	
	public void clickSqrtMathSymbol() {
		this.switchToDefault();
		this.switchToDefault();
		this.findElement(Xpath.sqrtButton).click();
	}
	
	public void clickSubmit() {
		this.switchToIframe();
		this.findElement(Xpath.submitButton).click();
		this.waitForLoading(timeout);
	}
	
	public void clickReset() {
		this.switchToIframe();
		this.findElement(Xpath.resetButton).click();
		this.waitForLoading(timeout);
	}
	
	public void clickMathSymbolsXButton() {
		this.switchToDefault();
		this.waitForElement(Xpath.mathSymbolsXButton, timeout);
		this.findElement(Xpath.mathSymbolsXButton).click();
	}
	
	public void openWhyBubble(){
		this.findElement(Xpath.closedWhyBubble).click();
	}
	
	public void closeWhyBubble(){
		this.findElement(Xpath.openWhyBubble).click();
	}
	
	public void inspectPreviousQuiz(String answer){
		this.answerQuestion("1", answer);
		this.clickSubmit();
		this.clickReset();
		this.clickArrowForwardButton();
		this.clickArrowBackButton();
		this.switchToDefault();
		List<WebElement> quizQuestionMarkElements = this.findElements(Xpath.oldQuizzesQuestionMark);
		quizQuestionMarkElements.get(quizQuestionMarkElements.size()-1).click();
		List<WebElement> quizElements = this.findElements(Xpath.oldQuizzes);
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
			Xpath.setActiveQuestion(Integer.toString(i + 1));
			String answerInElement = this.findElement(Xpath.correctAnswerResult).getText();
			String[] answerParts = {"\"", this.answers[i], "\" is correct"};
			for(char character: this.answers[i].toCharArray()){
				if('/' == character){
					answerParts[1] = Xpath.buildString(this.answers[i].split("/"));
					break;
				}
			}
			String answer = Xpath.buildString(answerParts);
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
			Xpath.setActiveQuestion(Integer.toString(i + 1));
			String answerInElement = this.findElement(Xpath.incorrectAnswerResult).getText();
			String answer = Xpath.buildString("\"", this.wrongAnswer, "\" is incorrect");
			try{
				assertEquals(answer, answerInElement);
			}
			catch(NoSuchElementException e){
				fail("answer evaluated to correct, expected incorrect answer");
			}
		}
	}
	
}
