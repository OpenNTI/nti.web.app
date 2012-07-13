package com.nti.selenium.groups;
import com.nti.selenium.navigation.XpathUtilsNav;
public class XpathUtilsGroups extends XpathUtilsNav { 

	public static String setOpenGroups(){
		return xpathPartialAttributeBuilder ("span","class", "manage-groups");
	}

	public static String getInputUsername() { 
		return xpathPartialAttributeBuilder ("input", "id","usersearchinput"); 
	} 

	public static String getInputGroupName(){
		return xpathPartialAttributeBuilder("input", "id", "simpletext");
	}

	public static String getAddButton(){ 
		return xpathBuilder ("span", "Add"); 
	}

	public static String getGroupName (String groupname) {
		return xpathBuilder ("div","class", "name",groupname); 

	}

	public static String getUsername(String name) { 
		return xpathBuilder  ("div","class","name",name); 

	}

	public static String getGroupOption (String groupname) {

		return xpathBuilder ("//img", "class", "delete-group", groupname);
	}

	public static String getFinishButton ()
	{
		return xpathBuilder ("span", "Finish"); 
	}

	public static String getCancelButton()
	{
		return xpathBuilder ("span", "Cancel");
	}

	public static String getGroupsList()
	{
		return xpathPartialAttributeBuilder ("div", "id", "management-group-list"); 
	}
	
	public static String getPersonGroupUnorderedList(){
		return xpathBuilder("ul", "class", "disallowSelection");
	}
	
	public static String getPersonGroupList()
	{ 
		return xpathBuilder ("li", "class", "selection-list-item multiselect");
	}
	
	public static String getPersonGroupItem(String name)
	{
		return xpathBuilder ("div", "class","name", name);
	}
	
	public static String getPersonGroupItem()
	{
		return xpathBuilder ("div", "class","name");
	}
	
	public static String getPersonGroupDeleteButton ()
	{
		return xpathBuilder ("img", "class", "delete-group"); 
	}

	public static String getPeopleAndGroups(){
		return buildString(getPersonGroupUnorderedList(),
						   getPersonGroupList(),
						   getPersonGroupItem());
	}
	
	public static String getPeopleAndGroupsDeleteButton(){
		return buildString(getPersonGroupUnorderedList(),
						   getPersonGroupList(),
						   getPersonGroupItem(),
						   getPersonGroupDeleteButton());
	}
	
}


