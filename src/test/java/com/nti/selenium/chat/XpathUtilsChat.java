package com.nti.selenium.chat;

import com.nti.selenium.login.XpathUtilsLogin;

public class XpathUtilsChat extends XpathUtilsLogin {
	
	public static String getPeopleTab(){
		return xpathBuilder("span", "People");
	}
	
	public static String getGroupsTab(){
		return xpathBuilder("span", "Groups");
	}
	
	public static String getIndividualGroups(){
		return xpathBuilder("div", "class", "x-container contact-card x-container-default");
	}
	
	public static String getChatUser(String userInChat){
		return buildString(xpathBuilder("div", "class", "header-body"),
						   xpathBuilder("span", userInChat),
						   "/../../..");
	}
	
	public static String getChatInputField(){
		return buildString(xpathBuilder("div", "class", "x-component chat-entry x-box-item x-component-chat-entry"),
						   xpathBuilder("div"),
						   xpathBuilder("div"),
						   xpathBuilder("input", "type", "text"));
	}
	
	public static String getMyMessage(String message){
		return buildString(xpathBuilder("div", "class", "log-entry me"),
						   xpathBuilder("div", "class", "body-text", message));
	}
	
	public static String getOtherMessage(String message){
		return buildString(xpathBuilder("div", "class", "log-entry "),
						   xpathBuilder("div", "class", "body-text", message));
	}
	
	public static String getAddPersonButton(String chatName){
		return buildString(xpathBuilder("span", chatName),
						   "/..",
						   xpathBuilder("div", "class", "tools"),
						   xpathBuilder("img", "class", "tool add-people"));
	}
	
	public static String getMinimizeButton(String chatName){
		return buildString(xpathBuilder("span", chatName),
						   "/..",
						   xpathBuilder("div", "class", "header-body"),
						   xpathBuilder("div", "class", "controls has-tools"),
						   xpathBuilder("img", "class", "tool minimize"));
	}
	
	public static String getCloseChatButton(String chatName){
		return buildString(xpathBuilder("span", chatName),
						   "/..",
						   xpathBuilder("div", "class", "header-body"),
						   xpathBuilder("div", "class", "controls has-tools"),
						   xpathBuilder("img", "class", "tool close"));
	}
	
	public static String getMinimizedChat(String chatName){
		return buildString(xpathBuilder("div", "class", "window-minimized"),
						   xpathBuilder("div", "class", "title"),
						   xpathBuilder("span", chatName));
	}
	
	public static String getCloseChatMinimized(String chatName){
		return buildString(xpathBuilder("div", "class", "window-minimized"),
				   xpathBuilder("div", "class", "title"),
				   xpathBuilder("span", chatName),
				   "/../..",
				   xpathBuilder("div", "class", "closer"),
				   xpathBuilder("img", "class", "closer-nib"));
	}
	
	public static String getGroupChatButton(String groupName){
		return buildString(xpathBuilder("span", groupName),
						   "/../..",
						   xpathBuilder("div", "class", "x-tool x-box-item x-tool-default x-tool-pressed"),
						   xpathBuilder("img", "data-qtip", "Chat with this group"));
	}
	
	public static String getAddUserExpandList(){
		return xpathBuilder("div", "class", "x-window chat-window x-layer x-window-chat-window x-plain x-window-plain x-window-chat-window-plain x-closable x-window-closable x-window-chat-window-closable x-unselectable");
	}
	
	public static String getAddUserHiddenList(){
		return xpathBuilder("div", "class", "x-window chat-window x-layer x-window-chat-window x-plain x-window-plain x-window-chat-window-plain x-closable x-window-closable x-window-chat-window-closable x-unselectable no-gutter");
	}

}