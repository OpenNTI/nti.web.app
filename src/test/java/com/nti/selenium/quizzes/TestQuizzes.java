package com.nti.selenium.quizzes;

import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class TestQuizzes extends Quizzes {

	@Test
	public void testAnswerQuizQuestion(){
		this.focusQuestion("1");
		this.answerQuestion("7");
//		this.selectMathSymbol("√");
//		this.selectMathSymbol("x²");
//		this.selectMathSymbol("()");
//		this.selectMathSymbol("≈");
		this.wait_(13);
//		String x = selenium.getText(this.focusedQuestionXpath + "//*");
//		System.out.println("\n\n\n");
//		System.out.println(x);
//		assertEquals(x, "√");
	}
	
}