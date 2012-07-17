package com.nti.selenium.highlights;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsHighlights extends XpathUtilsNav {

	public static String getCreateHighlightButton(){
		return xpathBuilder("div", "Save Highlight");
	}
	
	public static String getRemoveHighlight(){
		return xpathBuilder("div", "Delete Highlight");
	}
	
	public static String getCreatedHighlight(){
		return buildString(xpathBuilder("p", "class", "par"),
						   xpathBuilder("span", "data-non-anchorable", "true"));
	}	
}
