package com.nti.selenium.quizzes;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsQuizzes extends XpathUtilsNav {
	
	private String currentQuestionID;
	
	public void setActiveQuestion(String questionID){
		this.currentQuestionID = questionID;
	}
	
	public String getSqrtButton(){
		return xpathTextBuilder("span", "Ã");
	}
	
	public String getXSquaredButton(){
		return xpathTextBuilder("span", "Ã");
	}

	public String getParenthesesButton(){
		return xpathTextBuilder("span", "Ã");
	}
	
	public String getPiButton(){
		return xpathTextBuilder("span", "Ã");
	}
	
	public String getApproxButton(){
		return xpathTextBuilder("span", "Ã");
	}
	
	public String getSubmitButton(){
		return xpathAttributeAndTextBuilder("a", "id", "submit", "Submit");
	}
	
	public String getResetButton(){
		return xpathAttributeAndTextBuilder("a", "id", "submit", "Reset");
	}
	
 	public String getMathSymbolsWindowNotVisibleClass(){
		return "x-window x-layer x-window-default x-closable x-window-closable x-window-default-closable x-unselectable x-hide-offsets";
	}
	
	public String getAnswerBlank() {
		return buildString(xpathAttributeBuilder("li", "value", currentQuestionID), 
								xpathAttributeBuilder("div", "class", "question"),
								xpathAttributeBuilder("div", "class", "answerblock"),
								"//span");
	}
	
	public String getAnswerResult() {
		return buildString(xpathAttributeBuilder("li", "value", currentQuestionID),
								xpathAttributeBuilder("div", "class", "question"),
								xpathAttributeBuilder("div", "class", "result"));
	}
	
	public String getQuestionTextArea() {
		return buildString(getAnswerBlank(), xpathAttributeBuilder("span", "class", "textarea"), "//textarea");
	}
	
	public String getNoAnswerResult() {
		return buildString(this.getAnswerResult(),
								xpathAttributeBuilder("span", "class", "result noanswer"));
	}
	
	public String getCorrectAnswerResult() {
		return buildString(this.getAnswerResult(),
								xpathAttributeBuilder("span", "class", "result correct"));
	}
	
	public String getIncorrectAnswerResult() {
		return buildString(this.getAnswerResult(),
								xpathAttributeBuilder("span", "class", "result incorrect"));
	}
	
	public String getAnswerableQuestion() {
		return buildString(xpathAttributeBuilder("li", "value", currentQuestionID),
								xpathAttributeBuilder("div", "class", "question"),
								xpathAttributeBuilder("div", "class", "result hidden"));
	}
	
	public String getMathSymbolsXButton() {
		return xpathAttributeBuilder("img", "class", "x-tool-close");
	}

	public String getMathSymbolsWindowNotVisible() {
		return xpathAttributeBuilder("div", "class", getMathSymbolsWindowNotVisibleClass());
	}
	
	public String getOldQuizzesQuestionMark() {
		return xpathAttributeBuilder("img", "class", "action quizresults");
	}
	
	public String getOldQuizzes() {
		return xpathAttributeBuilder("div", "class", "x-component x-box-item x-component-default x-menu-item");
	}

	public String getOldQuizzesAnswer(){
		return buildString(	xpathAttributeBuilder("input", "id", currentQuestionID),
							"/../../div[@class='result']",
							"//span[@class='mathjax tex2jax_process response answer-text']",
							"//span[@class='MathJax_MathML']");
	}
	
	public String getClosedWhyBubble(){
		return buildString(	this.getAnswerResult(),
							xpathAttributeAndTextBuilder("a", "class", "why", "Why?"));
	}
	
	public String getOpenWhyBubble(){
		return buildString(	this.getAnswerResult(),
							xpathAttributeAndTextBuilder("a", "class", "why bubble", "Why?"));
	}
	
	public String getFractionQuizAnswer(){
		return buildString(	this.getAnswerResult(),
							xpathAttributeBuilder("span", "class", "mathjax tex2jax_process response answer-text"),
							xpathAttributeBuilder("script", "type", "math/tex"));
	}
	
}
