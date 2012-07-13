package com.nti.selenium.quizzes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.Random;

import org.junit.Test;

public class TestQuizzes extends Quizzes {

	private final Random random = new Random();
	
//	@Test
//	public void testFillInBlank() {
//		this.answerQuestion("1", "420");
//		assertEquals("420", this.getTextInAnswerblock("1"));
//	}
//	
//	@Test
//	public void testClickSymbolButton() {
//		this.clickBlank("1");
//		this.switchToDefault();
//		assertTrue(this.elementExists(XpathUtilsQuizzes.getSqrtButton()));
//		assertTrue(this.elementExists(XpathUtilsQuizzes.getXSquaredButton()));
//		assertTrue(this.elementExists(XpathUtilsQuizzes.getParenthesesButton()));
//		assertTrue(this.elementExists(XpathUtilsQuizzes.getPiButton()));
//		assertTrue(this.elementExists(XpathUtilsQuizzes.getApproxButton()));
//		this.clickSqrtMathSymbol();
//		this.clickSquaredMathSymbol();
//		this.clickParenthesesMathSymbol();
//		this.clickPiMathSymbol();
//		this.clickApproxMathSymbol();
//		final String answerBlank = 
//			XpathUtilsQuizzes.buildString(
//				Character.toString((char)8730),
//				"2",
//				"()",
//				Character.toString((char)960),
//				Character.toString((char)8776));
//		assertEquals(answerBlank, this.getTextInAnswerblock("1"));
//	}
//	
//	@Test
//	public void testSubmit() { 
//		this.setActiveQuestionID("1");
//		this.clickSubmit();
//		assertTrue(this.elementExists(this.getNoAnswerResult()));
//	}
//	
//	@Test
//	public void testReset() {
//		this.setActiveQuestionID("1");
//		this.clickSubmit();
//		assertTrue(this.elementExists(this.getNoAnswerResult()));
//		this.clickReset();
//		assertTrue(this.elementExists(this.getAnswerableQuestion()));
//	}
	
	@Test
	public void testGetPreviousQuizzes() {
		this.setActiveQuestionID("1");
		final String answer = Integer.toString(random.nextInt(100));
		this.inspectPreviousQuiz(answer);
		this.switchToIframe();
		assertEquals(this.findElement(this.getOldQuizzesAnswer()).getText(), answer);
	}
	
//	@Test
//	public void testOpenWhyBubble(){
//		this.setActiveQuestionID("1");
//		String answer = "1";
//		this.answerQuestion("1", answer);
//		assertEquals(answer, this.getTextInAnswerblock("1"));
//		this.clickSubmit();
//		assertTrue(this.elementExists(this.getIncorrectAnswerResult()));
//		this.openWhyBubble();
//		assertTrue(this.elementExists(this.getOpenWhyBubble()));
//	}
//	
//	@Test
//	public void testCloseWhyBubble(){
//		this.setActiveQuestionID("1");
//		this.answerQuestion("1", "1");
//		this.clickSubmit();
//		assertTrue(this.elementExists(this.getIncorrectAnswerResult()));
//		this.openWhyBubble();
//		assertTrue(this.elementExists(this.getOpenWhyBubble()));
//		this.closeWhyBubble();
//		assertTrue(this.elementExists(this.getClosedWhyBubble()));
//	}
//	
//	@Test
//	public void testSubmitQuiz100Percent(){
//		this.completeQuiz100Percent();
//		this.checkAnswers100Percent();
//	}
//	
//	@Test
//	public void testSubmitQuiz0Percent(){
//		this.completeQuiz0Percent();
//		this.checkAnswers0Percent();
//	}
	
}