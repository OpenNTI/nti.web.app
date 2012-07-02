package com.nti.selenium;

public class XpathUtils {
	
	public String buildString(final String... strings) {
		final StringBuilder builder = new StringBuilder();
		for(int i = 0; strings != null && i < strings.length; i++)
		{
			builder.append(strings[i]);
		}
		return builder.toString();
	}
	
	public String xpathAttributeBuilder(final String tag, final String attribute, final String value){
		return buildString("//", tag, "[@", attribute, "='", value, "']");
	}
	
	public String xpathTextBuilder(final String tag, final String text) {
		return buildString("//", tag, "[text()='", text, "']");
	}
	
	public String xpathAttributeAndTextBuilder(final String tag,
												final String attribute,
												final String value,
												final String text) {
		return buildString("//", tag, "[@", attribute, "='", value, "' and text()='", text, "']");
	}
	
	public String getLoading(){
		return xpathAttributeBuilder("title", "id", "loading");
	}
	
}
