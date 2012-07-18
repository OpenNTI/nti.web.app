package com.nti.selenium.redaction; 

import com.nti.selenium.navigation.XpathUtilsNav;

public class XpathUtilsRedaction extends XpathUtilsNav {

	public static String setCreateRedaction(){
		return xpathBuilder ("div", "Redact Inline");	
	}
	
	
	public static String getRedaction(){
		return xpathBuilder ("span", "class", "redactionAction redacted");
		
	}
	
	public static String setDeleteRedaction(){ 
		return xpathBuilder ("div", "Delete Redaction"); 
	}
	
	public static String setEnterUsername(){ 
		return xpathPartialAttributeBuilder ("input", "id", "usersearchinput");
	}
	
	public static String setShareWith() 
	{ 
		return xpathBuilder ("div", "Share With...");
	}
	

}