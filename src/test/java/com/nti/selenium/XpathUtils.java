package com.nti.selenium;

public class XpathUtils {
	
	public static String buildString(final String... strings) {
		final StringBuilder builder = new StringBuilder();
		for(int i = 0; strings != null && i < strings.length; i++)
		{
			builder.append(strings[i]);
		}
		return builder.toString();
	}
	
	public static String xpathBuilder(String tag){
		return buildString("//", tag);
	}
	
	public static String xpathBuilder(String tag, String text){
		return buildString("//", tag, "[text()='", text, "']");
	}

	public static String xpathBuilder(String tag, String attribute, String value){
		return buildString("//", tag, "[@", attribute, "='", value, "']");
	}
	
	public static String xpathBuilder(String tag, String attribute, String value, String text){
		return buildString("//", tag, "[@", attribute, "='", value, "' and text()='", text, "']");
	}
	
	public static String xpathPartialAttributeBuilder(final String tag, 
													  final String attribute,
													  final String value) {
		return buildString("//", tag, "[contains(@", attribute, ",'", value, "')]");
	}	
	
	public static String getBasePageLoading() {
		return xpathBuilder("title", "id", "loading");
	}
	
}
