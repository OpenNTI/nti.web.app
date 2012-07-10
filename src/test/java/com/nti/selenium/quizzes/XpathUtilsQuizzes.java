package com.nti.selenium.quizzes;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsQuizzes extends XpathUtilsNav {
	
	public static String getSqrtButton() {
		return xpathBuilder("span", "Ã");
	}
	
	public static String getXSquaredButton() {
		return xpathBuilder("span", "Ã");
	}

	public static String getParenthesesButton() {
		return xpathBuilder("span", "Ã");
	}
	
	public static String getPiButton() {
		return xpathBuilder("span", "Ã");
	}
	
	public static String getApproxButton() {
		return xpathBuilder("span", "Ã");
	}
	
	public static String getSubmitButton() {
		return xpathBuilder("a", "id", "submit", "Submit");
	}
	
	public static String getResetButton() {
		return xpathBuilder("a", "id", "submit", "Reset");
	}
	
 	public static String getMathSymbolsWindowNotVisibleClass(){
		return "x-window x-layer x-window-default x-closable x-window-closable x-window-default-closable x-unselectable x-hide-offsets";
	}
	
	public static String getAnswerBlank(final String questionID) {
		return buildString(	xpathBuilder("li", "value", questionID), 
							xpathBuilder("div", "class", "question"),
							xpathBuilder("div", "class", "answerblock"),
							"//span");
	}
	
	public static String getAnswerResult(final String questionID) {
		return buildString(	xpathBuilder("li", "value", questionID),
							xpathBuilder("div", "class", "question"),
							xpathBuilder("div", "class", "result"));
	}
	
	public static String getQuestionTextArea(final String questionID) {
		return buildString(getAnswerBlank(questionID), xpathBuilder("span", "class", "textarea"), "//textarea");
	}
	
	public static String getNoAnswerResult(final String questionID) {
		return buildString(	getAnswerResult(questionID),
							xpathBuilder("span", "class", "result noanswer"));
	}
	
	public static String getCorrectAnswerResult(final String questionID) {
		return buildString(	getAnswerResult(questionID),
							xpathBuilder("span", "class", "result correct"));
	}
	
	public static String getIncorrectAnswerResult(final String questionID) {
		return buildString(	getAnswerResult(questionID),
							xpathBuilder("span", "class", "result incorrect"));
	}
	
	public static String getAnswerableQuestion(final String questionID) {
		return buildString(	xpathBuilder("li", "value", questionID),
							xpathBuilder("div", "class", "question"),
							xpathBuilder("div", "class", "result hidden"));
	}
	
	public static String getMathSymbolsXButton() {
		return xpathBuilder("img", "class", "x-tool-close");
	}

	public static String getMathSymbolsWindowNotVisible() {
		return xpathBuilder("div", "class", getMathSymbolsWindowNotVisibleClass());
	}
	
	public static String getOldQuizzesQuestionMark() {
		return xpathBuilder("img", "class", "action quizresults");
	}
	
	public static String getOldQuizzes() {
		return xpathBuilder("div", "class", "x-component x-box-item x-component-default x-menu-item");
	}

	public static String getOldQuizzesAnswer(final String questionID) {
		return buildString(	xpathBuilder("input", "id", questionID),
							"/../../div[@class='result']",
							"//span[@class='mathjax tex2jax_process response answer-text']",
							"//span[@class='MathJax_MathML']");
	}
	
	public static String getClosedWhyBubble(final String questionID) {
		return buildString(	getAnswerResult(questionID),
							xpathBuilder("a", "class", "why", "Why?"));
	}
	
	public static String getOpenWhyBubble(final String questionID) {
		return buildString(	getAnswerResult(questionID),
							xpathBuilder("a", "class", "why bubble", "Why?"));
	}
	
	public static String getFractionQuizAnswer(final String questionID) {
		return buildString(	getAnswerResult(questionID),
							xpathBuilder("span", "class", "mathjax tex2jax_process response answer-text"),
							xpathBuilder("script", "type", "math/tex"));
	}
	
}
