package com.nti.selenium;

public class Xpath {

	public static String loading;
	public static String username;
	public static String password;
	public static String loginButton;
	public static String options;
	public static String logoutButton;
	public static String loginProblemMessage;
	public static String library;
	public static String book;
	public static String chapter;
	public static String section;
	public static String fractionIndexPage;
	public static String challengeProblem;
	public static String whatIsAFraction;
	public static String sqrtButton;
	public static String xSquaredButton;
	public static String parenthesesButton;
	public static String piButton;
	public static String approxButton;
	public static String backArrow;
	public static String forwardArrow;
	public static String submitButton;
	public static String resetButton;
	public static String questionBlank;
	public static String questionResult;
	public static String questionTextArea;
	public static String noAnswerResult;
	public static String incorrectAnswerResult;
	public static String correctAnswerResult;
	public static String answerableQuestion;
	public static String mathSymbolsXButton;
	public static String mathSymbolsWindowNotVisible;
	public static String oldQuizzesQuestionMark;
	public static String oldQuizzes;
	public static String oldQuizzesAnswer;
	public static String closedWhyBubble;
	public static String openWhyBubble;
	public static String quizFractionAnswer;

	private static String currentQuestionID;
	
	static {
		loading = getLoadingXpath();
		username = getUsernameXpath();
		password = getPasswordXpath();
		loginButton = getButtonXpath();
		options = getOptionsXpath();
		logoutButton = getLogoutXpath();
		loginProblemMessage = getLoginProblemMessageXpath();
		library = getLibraryXpath();
		book = getBookXpath(null);
		chapter = getChapterXpath(null);
		section = getSectionXpath(null);
		fractionIndexPage = getFractionIndexPageXpath();
		challengeProblem = getChallengeProblemXpath();
		whatIsAFraction = getWhatIsAFractionXpath();
		sqrtButton = getSqrtButtonXpath();
		xSquaredButton = getXSquaredButtonXpath();
		parenthesesButton = getParenthesesButtonXpath();
		piButton = getPiButtonXpath();
		approxButton = getApproxButtonXpath();
		backArrow = getBackArrowXpath();
		forwardArrow = getForwardArrowXpath();
		submitButton = getSubmitButtonXpath();
		resetButton = getResetButtonXpath();
		questionBlank = findBlank();
		questionResult = findResult();
		questionTextArea = getTextXpathAddon();
		noAnswerResult = noAnswerXpath();
		incorrectAnswerResult = incorrectAnswerXpath();
		correctAnswerResult = correctAnswerXpath();
		answerableQuestion = answerableXpath();
		mathSymbolsXButton = getMathSymbolsXButtonXpath();
		mathSymbolsWindowNotVisible = getMathSymbolsWindowNotVisibleXpath();
		oldQuizzesQuestionMark = getOldQuizzesQuestionMarkXpath();
		oldQuizzes = getOldQuizzesXpath();
		oldQuizzesAnswer = getOldQuizAnswerXpath();
		closedWhyBubble = getClosedWhyBubbleXpath();
		openWhyBubble = getOpenWhyBubbleXpath();
		quizFractionAnswer = getFractionQuizAnswerXpath();
	}
	
	public static void setLocation(String book, String chapter, String section){
		Xpath.book = getBookXpath(book);
		Xpath.chapter = getChapterXpath(chapter);
		Xpath.section = getSectionXpath(section);
	}
	
	public static void setActiveQuestion(String questionID){
		currentQuestionID = questionID;
		questionBlank = findBlank();
		questionResult = findResult();
		noAnswerResult = noAnswerXpath();
		incorrectAnswerResult = incorrectAnswerXpath();
		correctAnswerResult = correctAnswerXpath();
		answerableQuestion = answerableXpath();
		oldQuizzesAnswer = getOldQuizAnswerXpath();
		closedWhyBubble = getClosedWhyBubbleXpath();
		openWhyBubble = getOpenWhyBubbleXpath();
		quizFractionAnswer = getFractionQuizAnswerXpath();
		questionTextArea = getTextXpathAddon();
	}
	
	public static String buildString(final String... strings) {
		final StringBuilder builder = new StringBuilder();
		for(int i = 0; strings != null && i < strings.length; i++)
		{
			builder.append(strings[i]);
		}
		return builder.toString();
	}
	
	private static String xpathAttributeBuilder(final String tag, final String attribute, final String value){
		return buildString("//", tag, "[@", attribute, "='", value, "']");
	}
	
	private static String xpathTextBuilder(final String tag, final String text) {
		return buildString("//", tag, "[text()='", text, "']");
	}
	
	private static String xpathAttributeAndTextBuilder(final String tag,
												final String attribute,
												final String value,
												final String text) {
		return buildString("//", tag, "[@", attribute, "='", value, "' and text()='", text, "']");
	}
	
	private static String getLoadingXpath(){
		return xpathAttributeBuilder("title", "id", "loading");
	}
	
	private static String getUsernameXpath(){
		return xpathAttributeBuilder("input", "name", "username");
	}
	
	private static String getPasswordXpath(){
		return xpathAttributeBuilder("input", "name", "password");
	}
	
	private static String getButtonXpath(){
		return xpathAttributeBuilder("button", "id", "submit");
	}
	
	private static String getOptionsXpath(){
		return xpathAttributeBuilder("div", "class", "my-account-wrapper");
	}
	
	private static String getLogoutXpath(){
		return xpathTextBuilder("div", "Sign out");
	}
	
	private static String getLoginProblemMessageXpath(){
		return xpathTextBuilder("div", "Please try again, there was a problem logging in");
	}
	
	private static String getLibraryXpath() {
		return xpathAttributeBuilder("span", "id", "button-1014-btnIconEl");
	}
	
	private static String getBookXpath(String currentBook) {
		return xpathAttributeAndTextBuilder("div", "class", "title", currentBook);
	}
	
	private static String getChapterXpath(String currentChapter) {
		return xpathTextBuilder("div", currentChapter);
	}
	
	private static String getSectionXpath(String currentSection){
		return xpathTextBuilder("div", currentSection);
	}
	
	private static String getFractionIndexPageXpath() {
		return xpathAttributeAndTextBuilder("span", "class", "label", "Fractions");
	}
	
	private static String getChallengeProblemXpath() {
		return xpathAttributeAndTextBuilder("span", "class", "headingtext", "Challenge Problems");
	}
	
	private static String getWhatIsAFractionXpath() {
		return xpathAttributeAndTextBuilder("span", "class", "label", "What is a Fraction?");
	}
	
	private static String getSqrtButtonXpath(){
		return xpathTextBuilder("span", "Ã");
	}
	
	private static String getXSquaredButtonXpath(){
		return xpathTextBuilder("span", "Ã");
	}

	private static String getParenthesesButtonXpath(){
		return xpathTextBuilder("span", "Ã");
	}
	
	private static String getPiButtonXpath(){
		return xpathTextBuilder("span", "Ã");
	}
	
	private static String getApproxButtonXpath(){
		return xpathTextBuilder("span", "Ã");
	}
	
	private static String getBackArrowXpath(){
		return xpathAttributeBuilder("button", "id", "button-1032-btnEl");
	}
	
	private static String getForwardArrowXpath(){
		return xpathAttributeBuilder("button", "id", "button-1033-btnEl");
	}
	
	private static String getSubmitButtonXpath(){
		return xpathAttributeAndTextBuilder("a", "id", "submit", "Submit");
	}
	
	private static String getResetButtonXpath(){
		return xpathAttributeAndTextBuilder("a", "id", "submit", "Reset");
	}
	
 	private static String getMathSymbolsWindowNotVisibleClass(){
		return "x-window x-layer x-window-default x-closable x-window-closable x-window-default-closable x-unselectable x-hide-offsets";
	}
	
	private static String findBlank() {
		return buildString(xpathAttributeBuilder("li", "value", currentQuestionID), 
								xpathAttributeBuilder("div", "class", "question"),
								xpathAttributeBuilder("div", "class", "answerblock"),
								"//span");
	}
	
	private static String findResult() {
		return buildString(xpathAttributeBuilder("li", "value", currentQuestionID),
								xpathAttributeBuilder("div", "class", "question"),
								xpathAttributeBuilder("div", "class", "result"));
	}
	
	private static String getTextXpathAddon() {
		return buildString(findBlank(), xpathAttributeBuilder("span", "class", "textarea") + "//textarea");
	}
	
	private static String noAnswerXpath() {
		return buildString(findResult(),
								xpathAttributeBuilder("span", "class", "result noanswer"));
	}
	
	private static String correctAnswerXpath() {
		return buildString(findResult(),
								xpathAttributeBuilder("span", "class", "result correct"));
	}
	
	private static String incorrectAnswerXpath() {
		return buildString(findResult(),
								xpathAttributeBuilder("span", "class", "result incorrect"));
	}
	
	private static String answerableXpath() {
		return buildString(xpathAttributeBuilder("li", "value", currentQuestionID),
								xpathAttributeBuilder("div", "class", "question"),
								xpathAttributeBuilder("div", "class", "result hidden"));
	}
	
	private static String getMathSymbolsXButtonXpath() {
		return xpathAttributeBuilder("img", "class", "x-tool-close");
	}

	private static String getMathSymbolsWindowNotVisibleXpath() {
		return xpathAttributeBuilder("div", "class", getMathSymbolsWindowNotVisibleClass());
	}
	
	private static String getOldQuizzesQuestionMarkXpath() {
		return xpathAttributeBuilder("img", "class", "action quizresults");
	}
	
	private static String getOldQuizzesXpath() {
		return xpathAttributeBuilder("div", "class", "x-component x-box-item x-component-default x-menu-item");
	}

	private static String getOldQuizAnswerXpath(){
		return xpathAttributeBuilder("input", "id", currentQuestionID) +
				"/../../div[@class='result']" +
				"//span[@class='mathjax tex2jax_process response answer-text']" +
				"//span[@class='MathJax_MathML']";
	}
	
	private static String getClosedWhyBubbleXpath(){
		return findResult() +
			   xpathAttributeAndTextBuilder("a", "class", "why", "Why?");
	}
	
	private static String getOpenWhyBubbleXpath(){
		return findResult() +
			   xpathAttributeAndTextBuilder("a", "class", "why bubble", "Why?");
	}
	
	private static String getFractionQuizAnswerXpath(){
		return findResult() +
			   xpathAttributeBuilder("span", "class", "mathjax tex2jax_process response answer-text") +
			   xpathAttributeBuilder("script", "type", "math/tex");
	}
	
}
