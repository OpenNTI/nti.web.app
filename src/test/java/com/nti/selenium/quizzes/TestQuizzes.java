package com.nti.selenium.quizzes;

import java.util.Random;

import org.junit.Test;

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
		this.clickMathSymbol("√");
		assertEquals("√", this.getTextInAnswerblock("1"));
	}
	
	@Test
	public void testSubmit() { 
		this.clickSubmit();
		assertTrue(this.elementExists(this.noAnswerXpath("1")));
	}
	
	@Test
	public void testReset() {
		this.clickSubmit();
		this.clickReset();
		assertTrue(this.elementExists(this.answerableXpath("1")));
	}
	
	@Test
	public void testCloseMathSymbolsWindow() {
		this.clickBlank("1");
		this.clickMathSymbolsXButton();
		assertTrue(this.elementExists(this.getMathSymbolsWindowNotVisibleXpath()));
	}
	
	@Test
	public void testGetPreviousQuizzes() {
		final String answer = Integer.toString(random.nextInt(100));
		inspectPreviousQuiz(answer);
		this.switchToIframe();
		assertEquals(this.findElement(this.getOldQuizAnswerXpath("1")).getText(), answer);
	}
	
	@Test
	public void testOpenWhyBubble(){
		this.answerQuestion("1", "1");
		this.clickSubmit();
		this.openWhyBubble();
		assertTrue(this.elementExists(this.getOpenWhyBubbleXpath()));
	}
	
	@Test
	public void testCloseWhyBubble(){
		this.answerQuestion("1", "1");
		this.clickSubmit();
		this.openWhyBubble();
		this.closeWhyBubble();
		assertTrue(this.elementExists(this.getClosedWhyBubbleXpath()));
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