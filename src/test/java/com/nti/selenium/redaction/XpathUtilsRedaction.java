package com.nti.selenium.redaction; 

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsRedaction extends XpathUtilsNav {

	public static String setCreateRedaction(){
		return xpathTextBuilder ("div", "Redact Highlight");	
	}
	
	public static String setShareRedaction(){
		return xpathTextBuilder("div", "Share With");
	}
	
	public static String getRedaction(){
		return xpathAttributeBuilder("img", "class", "action redactionhighlight"); 
		
	}
	
	public static String setDeleteRedaction(){ 
		return xpathTextBuilder ("div", "Delete Redaction"); 
	}
	
	public static String setEnterUsername(){ 
		return xpathPartialAttributeBuilder ("input", "id", "usersearchinput");
	}
}