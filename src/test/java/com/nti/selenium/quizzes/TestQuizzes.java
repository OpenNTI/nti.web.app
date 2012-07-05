package com.nti.selenium.quizzes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.Random;

import org.junit.Test;

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
		this.xpath.setActiveQuestion("1");
		assertTrue(this.elementExists(this.xpath.getNoAnswerResult()));
	}
	
	@Test
	public void testReset() {
		this.clickSubmit();
		this.clickReset();
		this.xpath.setActiveQuestion("1");
		assertTrue(this.elementExists(this.xpath.getAnswerableQuestion()));
	}
	
	@Test
	public void testCloseMathSymbolsWindow() {
		this.clickBlank("1");
		this.clickMathSymbolsXButton();
		assertTrue(this.elementExists(this.xpath.getMathSymbolsWindowNotVisible()));
	}
	
	@Test
	public void testGetPreviousQuizzes() {
		this.xpath.setActiveQuestion("1");
		final String answer = Integer.toString(random.nextInt(100));
		inspectPreviousQuiz(answer);
		this.switchToIframe();
		assertEquals(this.findElement(this.xpath.getOldQuizzesAnswer()).getText(), answer);
	}
	
	@Test
	public void testOpenWhyBubble(){
		this.xpath.setActiveQuestion("1");
		this.answerQuestion("1", "1");
		this.clickSubmit();
		this.openWhyBubble();
		assertTrue(this.elementExists(this.xpath.getOpenWhyBubble()));
	}
	
	@Test
	public void testCloseWhyBubble(){
		this.xpath.setActiveQuestion("1");
		this.answerQuestion("1", "1");
		this.clickSubmit();
		this.openWhyBubble();
		this.closeWhyBubble();
		assertTrue(this.elementExists(this.xpath.getClosedWhyBubble()));
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