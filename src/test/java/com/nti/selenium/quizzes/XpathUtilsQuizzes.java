package com.nti.selenium.quizzes;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsQuizzes extends XpathUtilsNav {
	
	private String currentQuestionID;
	
	public void setActiveQuestion(String questionID){
		this.currentQuestionID = questionID;
	}
	
	public String getSqrtButton(){
		return xpathBuilder("span", "Ã");
	}
	
	public String getXSquaredButton(){
		return xpathBuilder("span", "Ã");
	}

	public String getParenthesesButton(){
		return xpathBuilder("span", "Ã");
	}
	
	public String getPiButton(){
		return xpathBuilder("span", "Ã");
	}
	
	public String getApproxButton(){
		return xpathBuilder("span", "Ã");
	}
	
	public String getSubmitButton(){
		return xpathBuilder("a", "id", "submit", "Submit");
	}
	
	public String getResetButton(){
		return xpathBuilder("a", "id", "submit", "Reset");
	}
	
 	public String getMathSymbolsWindowNotVisibleClass(){
		return "x-window x-layer x-window-default x-closable x-window-closable x-window-default-closable x-unselectable x-hide-offsets";
	}
	
	public String getAnswerBlank() {
		return buildString(xpathBuilder("li", "value", currentQuestionID), 
								xpathBuilder("div", "class", "question"),
								xpathBuilder("div", "class", "answerblock"),
								"//span");
	}
	
	public String getAnswerResult() {
		return buildString(xpathBuilder("li", "value", currentQuestionID),
								xpathBuilder("div", "class", "question"),
								xpathBuilder("div", "class", "result"));
	}
	
	public String getQuestionTextArea() {
		return buildString(getAnswerBlank(), xpathBuilder("span", "class", "textarea"), "//textarea");
	}
	
	public String getNoAnswerResult() {
		return buildString(this.getAnswerResult(),
								xpathBuilder("span", "class", "result noanswer"));
	}
	
	public String getCorrectAnswerResult() {
		return buildString(this.getAnswerResult(),
								xpathBuilder("span", "class", "result correct"));
	}
	
	public String getIncorrectAnswerResult() {
		return buildString(this.getAnswerResult(),
								xpathBuilder("span", "class", "result incorrect"));
	}
	
	public String getAnswerableQuestion() {
		return buildString(xpathBuilder("li", "value", currentQuestionID),
								xpathBuilder("div", "class", "question"),
								xpathBuilder("div", "class", "result hidden"));
	}
	
	public String getMathSymbolsXButton() {
		return xpathBuilder("img", "class", "x-tool-close");
	}

	public String getMathSymbolsWindowNotVisible() {
		return xpathBuilder("div", "class", getMathSymbolsWindowNotVisibleClass());
	}
	
	public String getOldQuizzesQuestionMark() {
		return xpathBuilder("img", "class", "action quizresults");
	}
	
	public String getOldQuizzes() {
		return xpathBuilder("div", "class", "x-component x-box-item x-component-default x-menu-item");
	}

	public String getOldQuizzesAnswer(){
		return buildString(	xpathBuilder("input", "id", currentQuestionID),
							"/../../div[@class='result']",
							"//span[@class='mathjax tex2jax_process response answer-text']",
							"//span[@class='MathJax_MathML']");
	}
	
	public String getClosedWhyBubble(){
		return buildString(	this.getAnswerResult(),
							xpathBuilder("a", "class", "why", "Why?"));
	}
	
	public String getOpenWhyBubble(){
		return buildString(	this.getAnswerResult(),
							xpathBuilder("a", "class", "why bubble", "Why?"));
	}
	
	public String getFractionQuizAnswer(){
		return buildString(	this.getAnswerResult(),
							xpathBuilder("span", "class", "mathjax tex2jax_process response answer-text"),
							xpathBuilder("script", "type", "math/tex"));
	}
	
}
