package com.nti.selenium.quizzes;


import com.nti.selenium.navigation.Navigation;
import org.junit.Before;

public class Quizzes extends Navigation {
	
	private String focusedQuestionXpath = null;
	
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.navigateTo("MathCounts 2012", null, "Warm-Up 1");
	}
	
	public void focusQuestion(final String questionID) {
		StringBuilder sb = new StringBuilder(this.xpathAttributeBuilder("li", "value", questionID));
		sb.append(this.xpathAddonBuilder("div", "class", "question"));
		sb.append(this.xpathAddonBuilder("div", "class", "answerblock"));
		String xpathInput = sb.toString()
		selenium.click(xpathInput + "//span");
		this.wait_(3);
		this.focusedQuestionXpath = xpathInput;
	}
	
	public void answerQuestion(String answer){
//		String js = iframeSelector(".quiz-input.hasCursor textarea");
		
	}
	
	public void selectMathSymbol(String mathSymbol){
		String xpathInput = this.xpathTextBuilder("span", mathSymbol);
		selenium.click(xpathInput);
	}
	
	public void clickSubmit(){
		String xpathSubmit = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Submit");
//		this.clickElement(xpathSubmit);
	}
	
	public void clickReset(){
		String xpathSubmit = this.xpathAttributeAndTextBuilder("a", "id", "submit", "Reset");
//		this.clickElement(xpathSubmit);
	}
	
	public void completeQuiz100Percent(){
		
	}
	
	public void completeQuiz0Percent(){
		
	}
	
}
