package com.nti.selenium.redaction; 

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsRedaction extends XpathUtilsNav {

	public static String setCreateRedaction(){
		return xpathBuilder ("div", "Redact Highlight");	
	}
	
	public static String setShareRedaction(){
		return xpathBuilder("div", "Share With");
	}
	
	public static String getRedaction(){
		return xpathBuilder("img", "class", "action redactionhighlight"); 
		
	}
	
	public static String setDeleteRedaction(){ 
		return xpathBuilder ("div", "Delete Redaction"); 
	}
	
	public static String setEnterUsername(){ 
		return xpathPartialAttributeBuilder ("input", "id", "usersearchinput");
	}
}