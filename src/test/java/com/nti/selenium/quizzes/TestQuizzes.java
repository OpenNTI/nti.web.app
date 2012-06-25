package com.nti.selenium.quizzes;

import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class TestQuizzes extends Quizzes {

	@Test
	public void testFillInBlank(){
		this.answerQuestion("1", "420");
		assertEquals("420", this.getTextInAnswerblock("1"));
		this.wait_(3);
	}
	
//	@Test
//	public void testClickSymbolButton(){
//		this.clickBlank("1");
//		this.wait_(3);
//		this.clickMathSymbol("()");
////		assertEquals("√", this.getTextInAnswerblock("1"));
//		this.wait_(3);
//	}
	
}