package com.nti.selenium.quizzes;

import java.util.Random;

import org.junit.Test;

import com.nti.selenium.Xpath;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class TestQuizzes extends Quizzes {

	private final Random random = new Random();
	
	@Test
	public void testFillInBlank() {
		this.answerQuestion("1", "420");
		assertEquals("420", this.getTextInAnswerblock("1"));
	}
	
	@Test
	public void testClickSymbolButton() {
		this.clickBlank("1");
		this.clickSqrtMathSymbol();
		assertEquals("√", this.getTextInAnswerblock("1"));
	}
	
	@Test
	public void testSubmit() { 
		this.clickSubmit();
		Xpath.setActiveQuestion("1");
		assertTrue(this.elementExists(Xpath.noAnswerResult));
	}
	
	@Test
	public void testReset() {
		this.clickSubmit();
		this.clickReset();
		Xpath.setActiveQuestion("1");
		assertTrue(this.elementExists(Xpath.answerableQuestion));
	}
	
	@Test
	public void testCloseMathSymbolsWindow() {
		this.clickBlank("1");
		this.clickMathSymbolsXButton();
		assertTrue(this.elementExists(Xpath.mathSymbolsWindowNotVisible));
	}
	
	@Test
	public void testGetPreviousQuizzes() {
		Xpath.setActiveQuestion("1");
		final String answer = Integer.toString(random.nextInt(100));
		inspectPreviousQuiz(answer);
		this.switchToIframe();
		assertEquals(this.findElement(Xpath.oldQuizzesAnswer).getText(), answer);
	}
	
	@Test
	public void testOpenWhyBubble(){
		Xpath.setActiveQuestion("1");
		this.answerQuestion("1", "1");
		this.clickSubmit();
		this.openWhyBubble();
		assertTrue(this.elementExists(Xpath.openWhyBubble));
	}
	
	@Test
	public void testCloseWhyBubble(){
		Xpath.setActiveQuestion("1");
		this.answerQuestion("1", "1");
		this.clickSubmit();
		this.openWhyBubble();
		this.closeWhyBubble();
		assertTrue(this.elementExists(Xpath.closedWhyBubble));
	}
	
	@Test
	public void testSubmitQuiz100Percent(){
		this.completeQuiz100Percent();
		this.checkAnswers100Percent();
	}
	
	@Test
	public void testSubmitQuiz0Percent(){
		this.completeQuiz0Percent();
		this.checkAnswers0Percent();
	}
	
}