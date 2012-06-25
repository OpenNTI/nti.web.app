package com.nti.selenium.quizzes;

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
	
//	@Test
//	public void testSubmit(){
//		this.clickSubmit();
//		assertTrue(this.elementExists(this.assertXpath()));
//	}
//	
//	@Test
//	public void testReset(){
//		this.clickSubmit();
//		this.clickReset();
//	}
	
}