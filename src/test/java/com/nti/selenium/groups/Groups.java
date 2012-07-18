package com.nti.selenium.groups;

import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import com.nti.selenium.Credentials;
import com.nti.selenium.navigation.Navigation;

public class Groups extends Navigation { 

	protected Credentials[] credentials; 

	@Before 
	public void setUp() throws Exception{ 
		super.setUp(); 
		credentials = this.getUsersEmails(10);

	}

	@After 
	public void tearDown() { 
		this.openGroups();
		try { 
			this.setActiverDriver(driver[1]);
			this.removeGroups();
		} catch (Exception e) { 
			System.out.println("Unable to remove groups/deleting test");
			System.out.println(e.getMessage());
		} finally { 
			selenium[1].stop(); 
		}
	}

	public void removeGroups() {
		int oldGroupCount = 0;
		this.openGroups();
		for (int i=0; i<=30;i++)
		{
			this.wait_(1);
			final List <WebElement> buttons =
					this.findElements(XpathUtilsGroups.getPeopleAndGroupsDeleteButton());
			final List <WebElement> groups = 
					this.findElements(XpathUtilsGroups.getPeopleAndGroups());

			if (groups.size() <=1) {
				break; 
			} else if (oldGroupCount == groups.size()) {
				break;
			} else  {
				oldGroupCount = groups.size();
				groups.get(1).click();
				buttons.get(1).click();
			}
		}
	}

	public void openGroups() {
		//click button
		try {
			this.wait_(2);
			final WebElement element = this.findElement(XpathUtilsGroups.setOpenGroups());
			element.click();
			//check if fields are available
			boolean present = true; 
			try {
				this.findElement(XpathUtilsGroups.getInputUsername()); 
				this.findElement(XpathUtilsGroups.getInputGroupName());
				this.findElement(XpathUtilsGroups.getAddButton());

			} catch (final NoSuchElementException e) {
				present = false; 
			}

			if (present == false) {
				System.out.println("Some fields are unavailable");
			}
		} catch(final NoSuchElementException e) {
			System.out.println("no button found");
			//its not been found
		}
	}

	public void addGroup(final String groupname) {
		this.openGroups();
		WebElement element = this.findElement (XpathUtilsGroups.getInputGroupName()); 
		element.sendKeys (groupname); 
		this.findElement (XpathUtilsGroups.getAddButton()).click();
		this.waitForElement(XpathUtilsGroups.getGroupName(groupname));	 
	}


	public String addPeopleToGroup(final String...strings) {
		final String time = Long.toString(System.currentTimeMillis());
		this.addGroup(time);

		for(final String str: strings)
		{
			this.waitForElement(XpathUtilsGroups.getInputUsername());
			this.findElement(XpathUtilsGroups.getInputUsername()).sendKeys(str);
			this.waitForElement(XpathUtilsGroups.getPersonGroupItem(str));
			if (!this.elementExists(XpathUtilsGroups.getPersonGroupItem(str))) {
				System.out.println("taking a break");
			}
			this.findElement(XpathUtilsGroups.getPersonGroupItem(str)).click();
			
			this.waitForElement(XpathUtilsGroups.getGroupName(time)); 
		
			this.findElement(XpathUtilsGroups.getGroupName(time)).click();
			this.waitForElement(XpathUtilsGroups.getFinishButton());
			this.findElement(XpathUtilsGroups.getFinishButton()).click();
		}
		return time; 
	}
	
	public void addOnePersonToGroup() { 
		final String username = credentials[0].getUserName(); 
		this.addPeopleToGroup(username);
	}
	
	public void addMultiplePeopleToGroup(final int num) { 
		final String[] usernames = new String[num]; 
		for ( int i = 0; i < num; i++)
		{ 
			usernames[i] = credentials[i].getUserName(); 
		}
		this.addPeopleToGroup(usernames);	
	}
	
	public void removePersonFromGroup() {
		this.addPeopleToGroup(credentials[0].getUserName(), credentials[1].getUserName()); 
		this.findElement(XpathUtilsGroups.getGroupsButton()).click();
		this.findElement(XpathUtilsGroups.getGroupMember("Test-10")).click();
		this.findElement(XpathUtilsGroups.getGroupMemberDeleteButton()).click(); 	
	}
} 


