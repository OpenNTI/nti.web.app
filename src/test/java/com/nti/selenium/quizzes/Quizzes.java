package com.nti.selenium.quizzes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.List;
import java.util.NoSuchElementException;

import org.junit.Before;
import org.openqa.selenium.WebElement;

import com.nti.selenium.navigation.Navigation;

public class Quizzes extends Navigation {
	
	protected static final String[] answers = {"420", "3", "69", "5", "40", "64", "480", "5/8", "6", "3"};
	protected static final String wrongAnswer = "wrongAnswer";
	
	
	private String activeQuestionID = null;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.navigateTo("MathCounts 2012", null, "Warm-Up 1");
	}
	
	protected String getActiveQuestionID() {
		return this.activeQuestionID;
	}
	
	protected void setActiveQuestionID(final String questionID) {
		this.activeQuestionID = questionID;
	}
	
	public String getTextInAnswerblock(final String questionID) {
		this.switchToIframe();
		this.setActiveQuestionID(questionID);
		final StringBuilder answer = new StringBuilder();
		final String xp = XpathUtilsQuizzes.buildString(XpathUtilsQuizzes.getAnswerBlank(questionID), "//span");
		for (final WebElement element: this.findElements(xp))
		{
			final String character = element.getText();
			answer.append(character);
		}
		return answer.toString();
	}
	
	public void clickBlank(final String questionID) {
		this.switchToIframe();
		this.setActiveQuestionID(questionID);
		this.switchToIframe();
		this.findElement(XpathUtilsQuizzes.getAnswerBlank(questionID)).click();
	}
	
	public void answerQuestion(final String questionID, final String answer) {
		this.switchToIframe();
		this.clickBlank(questionID);
		for(final char ch: (answer).toCharArray())
		{
			this.findElement(XpathUtilsQuizzes.getQuestionTextArea(questionID)).sendKeys(Character.toString(ch));
		}
	}
	
	public void clickSqrtMathSymbol() {
		this.switchToDefault();
		this.findElement(XpathUtilsQuizzes.getSqrtButton()).click();
	}
	
	public void clickSquaredMathSymbol() {
		this.switchToDefault();
		this.findElement(XpathUtilsQuizzes.getXSquaredButton()).click();
	}
	
	public void clickParenthesesMathSymbol() {
		this.switchToDefault();
		this.findElement(XpathUtilsQuizzes.getParenthesesButton()).click();
	}
	
	public void clickPiMathSymbol() {
		this.switchToDefault();
		this.findElement(XpathUtilsQuizzes.getPiButton()).click();
	}
	
	public void clickApproxMathSymbol() {
		this.switchToDefault();
		this.findElement(XpathUtilsQuizzes.getApproxButton()).click();
	}
	
	public void clickSubmit() {
		this.switchToIframe();
		this.findElement(XpathUtilsQuizzes.getSubmitButton()).click();
		this.waitForLoading();
	}
	
	public void clickReset() {
		this.switchToIframe();
		this.findElement(XpathUtilsQuizzes.getResetButton()).click();
		this.waitForLoading();
	}
	
	public void clickMathSymbolsXButton() {
		this.switchToDefault();
		this.waitForElement(XpathUtilsQuizzes.getMathSymbolsXButton());
		this.findElement(XpathUtilsQuizzes.getMathSymbolsXButton()).click();
	}
	
	public void openWhyBubble() {
		final String qid = this.getActiveQuestionID();
		this.findElement(XpathUtilsQuizzes.getClosedWhyBubble(qid)).click();
	}
	
	public void closeWhyBubble() {
		final String qid = this.getActiveQuestionID();
		this.findElement(XpathUtilsQuizzes.getOpenWhyBubble(qid)).click();
	}
	
	public void inspectPreviousQuiz(final String answer) {
		this.answerQuestion("1", answer);
		this.clickSubmit();
		this.clickReset();
		this.clickArrowForwardButton();
		this.clickArrowBackButton();
		this.switchToDefault();
		final List<WebElement> quizQuestionMarkElements = 
						this.findElements(XpathUtilsQuizzes.getOldQuizzesQuestionMark());
		quizQuestionMarkElements.get(quizQuestionMarkElements.size()-1).click();
		List<WebElement> quizElements = this.findElements(XpathUtilsQuizzes.getOldQuizzes());
		quizElements.get(quizQuestionMarkElements.size()-1).click();
	}
	
	public void completeQuiz100Percent(){
		for(int i = 0; i < 10; i++)
		{
			this.answerQuestion(Integer.toString(i + 1), Quizzes.answers[i]);
		}
		this.clickSubmit();
	}
	
	public void completeQuiz0Percent(){
		for(int i = 0; i < 10; i++)
		{
			this.answerQuestion(Integer.toString(i + 1), Quizzes.wrongAnswer);
		}
		this.clickSubmit();
	}
	
	public void checkAnswers100Percent() {

		for(int i = 0; i < 10; i++)
		{	
			this.setActiveQuestionID(Integer.toString(i + 1));
			final String qid = this.getActiveQuestionID();
			final String answerInElement =
						this.findElement(XpathUtilsQuizzes.getCorrectAnswerResult(qid)).getText();
			final String[] answerParts = {"\"", Quizzes.answers[i], "\" is correct"};
			for (final char character: Quizzes.answers[i].toCharArray()) 
			{
				if ('/' == character) {
					answerParts[1] = XpathUtilsQuizzes.buildString(Quizzes.answers[i].split("/"));
					break;
				}
			}
			
			final String answer = XpathUtilsQuizzes.buildString(answerParts);
			try {
				assertEquals(answer, answerInElement);
			} catch(final NoSuchElementException e) {
				fail("answer evaluated to incorrect, expected correct answer");
			}
		}
	}
	
	public void checkAnswers0Percent(){
		for (int i = 0; i < 10; i++)
		{
			this.setActiveQuestionID(Integer.toString(i + 1));
			final String qid = this.getActiveQuestionID();
			final String answerInElement = this.findElement(XpathUtilsQuizzes.getIncorrectAnswerResult(qid)).getText();
			final String answer = XpathUtilsQuizzes.buildString("\"", Quizzes.wrongAnswer, "\" is incorrect");
			try{
				assertEquals(answer, answerInElement);
			} catch(final NoSuchElementException e) {
				fail("answer evaluated to correct, expected incorrect answer");
			}
		}
	}
	
	public String getNoAnswerResult() {
		return XpathUtilsQuizzes.getNoAnswerResult(this.getActiveQuestionID());
	}
	
	public String getAnswerableQuestion() {
		return XpathUtilsQuizzes.getAnswerableQuestion(this.getActiveQuestionID());
	}
	
	public String getOldQuizzesAnswer() {
		return XpathUtilsQuizzes.getOldQuizzesAnswer(this.getActiveQuestionID());
	}
	
	public String getClosedWhyBubble() {
		return XpathUtilsQuizzes.getClosedWhyBubble(this.getActiveQuestionID());
	}
	
	public String getOpenWhyBubble() {
		return XpathUtilsQuizzes.getOpenWhyBubble(this.getActiveQuestionID());
	}
}
