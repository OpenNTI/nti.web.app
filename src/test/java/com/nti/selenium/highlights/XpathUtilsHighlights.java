package com.nti.selenium.highlights;

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsHighlights extends XpathUtilsNav{

	public static String getPopUpBox(){
		return xpathTextBuilder("div", "Save Highlight");
	}
	
}
