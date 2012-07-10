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
	
	public static String xpathBuilder(String...strings){
		
		switch(strings.length){
		
		case 1: return buildString("//", strings[0]);
		case 2: return buildString("//", strings[0], "[text()='", strings[1], "']");
		case 3: return buildString("//", strings[0], "[@", strings[1], "='", strings[2], "']");
		case 4: return buildString("//", strings[0], "[@", strings[1], "='", strings[2], "' and text()='", strings[3], "']");
		
		}
		
		return null;
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
