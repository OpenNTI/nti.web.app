package com.nti.selenium.highlights;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsHighlights extends XpathUtilsNav{

	public static String getCreateHighlight(){
		return xpathTextBuilder("div", "Save Highlight");
	}
	
	public static String getCreateHighlightImage(){
		return xpathAttributeBuilder("img", "class", "action highlight");
	}
	
}
