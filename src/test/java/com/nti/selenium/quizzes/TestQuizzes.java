package com.nti.selenium.quizzes;

import java.util.Random;

import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class TestQuizzes extends Quizzes {

	@Test
	public void testFillInBlank(){
		this.answerQuestion("1", "420");
		assertEquals("420", this.getTextInAnswerblock("1"));
	}
	
	@Test
	public void testClickSymbolButton(){
		this.clickBlank("1");
		this.clickMathSymbol("√");
		assertEquals("√", this.getTextInAnswerblock("1"));
	}
	
	@Test
	public void testSubmit(){
		this.clickSubmit();
		assertTrue(this.elementExists(this.noAnswerXpath("1")));
	}
	
	@Test
	public void testReset(){
		this.clickSubmit();
		this.clickReset();
		assertTrue(this.elementExists(this.answerableXpath("1")));
	}
	
	@Test
	public void testCloseMathSymbolsWindow(){
		this.clickBlank("1");
		this.clickMathSymbolsXButton();
		assertTrue(this.elementExists(this.getMathSymbolsWindowNotVisibleXpath()));
	}
	
	@Test
	public void testGetPreviousQuizzes(){
		Random r = new Random();
		String answer = r.nextInt(100)+"";
		inspectPreviousQuiz(answer);
		this.switchToIframe();
		assertTrue(this.elementExists(this.getOldQuizAnswerXpath("1", answer)));
	}
	
}