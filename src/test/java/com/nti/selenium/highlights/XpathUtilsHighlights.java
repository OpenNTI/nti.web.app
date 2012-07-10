package com.nti.selenium.highlights;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsHighlights extends XpathUtilsNav{

	public static String getCreateHighlight(){
		return xpathBuilder("div", "Save Highlight");
	}
	
	public static String getRemoveHighlight(){
		return xpathBuilder("div", "Remove Highlight");
	}
	
	public static String getCreateHighlightImage(){
		return xpathBuilder("img", "class", "action highlight");
	}
	
	public static String getHighlightInList(){
		return xpathBuilder("span", "Highlight In Section");
	}
	
}
