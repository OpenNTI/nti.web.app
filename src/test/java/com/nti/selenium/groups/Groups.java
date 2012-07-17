package com.nti.selenium.groups;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.*;


import com.nti.selenium.Credentials;
import com.nti.selenium.navigation.Navigation; 

public class Groups extends Navigation { 


	//protected static  String [] usernames = {"logan testi", "jessica jenko"}; 
	protected Credentials[] credentials; 
	
	@Before 
	public void setUp() throws Exception{ 
		super.setUp(); 
		credentials = this.getUsersEmails(10);
		
	}

	@After 
	public void tearDown(){ 
		try{ 
			this.setActiverDriver(driver[1]);
			this.removeGroups();
		}
		catch (Exception e)
		{ 
			System.out.println("Unable to remove groups/deleting test");
			System.out.println(e.getMessage());
		}
		finally 
		{
			selenium[1].stop(); 
		}
	}

	public void removeGroups(){
		
		int oldGroupCount = 0;
		
		this.openGroups();
		for (;;)
		{
			this.wait_(1);
			List <WebElement> buttons = this.findElements(XpathUtilsGroups.getPeopleAndGroupsDeleteButton());
			List <WebElement> groups = this.findElements(XpathUtilsGroups.getPeopleAndGroups());

			if (groups.size() <=1)
			{
				break; 
			}

			else if (oldGroupCount == groups.size())
			{
				break;
			}

			else 
			{
				oldGroupCount = groups.size();
				groups.get(1).click();
				buttons.get(1).click();
			}
		}
	}

	public void openGroups()
	{
		//click button

		try{
			this.wait_(2);
			WebElement element = this.findElement(XpathUtilsGroups.setOpenGroups());
			element.click();
			//check if fields are available
			boolean present = true; 
			try
			{
				this.findElement(XpathUtilsGroups.getInputUsername()); 
				this.findElement(XpathUtilsGroups.getInputGroupName());
				this.findElement(XpathUtilsGroups.getAddButton());

			}
			catch (final NoSuchElementException e)
			{
				present = false; 
			}

			if (present == false)
			{
				System.out.println("Some fields are unavailable");
			}

		}catch(final NoSuchElementException e){

			System.out.println("no button found");
			//its not been found
		}



	}

	public void addGroup(String groupname)
	{
		this.openGroups();
		//boolean bool= true;
		WebElement element = this.findElement (XpathUtilsGroups.getInputGroupName()); 
		element.sendKeys (groupname); 
		this.findElement (XpathUtilsGroups.getAddButton()).click();
		this.waitForElement(XpathUtilsGroups.getGroupName(groupname));
		//
		//		try
		//		{ 
		//			this.findElement(XpathUtilsGroups.getGroupName(groupname));
		//
		//		}
		//		catch (final NoSuchElementException e)
		//		{ 
		//			System.out.println("The group was not added"); 
		//			bool = false; 
		//		
		//		}
		//
		//		return bool; 
	}

	public String addPeopleToGroup(String...strings){
		String time = Long.toString(System.currentTimeMillis());
		this.addGroup(time);
		for(String str: strings){
			this.waitForElement(XpathUtilsGroups.getInputUsername());
			this.findElement(XpathUtilsGroups.getInputUsername()).sendKeys(str);
			this.waitForElement(XpathUtilsGroups.getPersonGroupItem(str));
			if(!this.elementExists(XpathUtilsGroups.getPersonGroupItem(str))){
				System.out.println("taking a break");
			}
			this.findElement(XpathUtilsGroups.getPersonGroupItem(str)).click();
			this.waitForElement("//div[text()='" + time + "']");
			this.findElement("//div[text()='" + time + "']").click();
			this.waitForElement("//span[text()='Finish']");
			this.findElement("//span[text()='Finish']").click();
		}
		return time;
	}

	public void  addOnePersonToGroup(int userSearchNumber)
	{
		this.addGroup("TestGroup"); 
		this.findElement(XpathUtilsGroups.getInputUsername()).sendKeys(credentials[1].getUserName());
		this.waitForElement(XpathUtilsGroups.getPersonGroupItem(credentials[1].getUserName()));
		this.findElement(XpathUtilsGroups.getPersonGroupItem(credentials[1].getUserName())).click();


		//		boolean bool = this.elementExists(XpathUtilsGroups.getName("Logan Testi"));

		//		if (bool == true)
		//		{
		//			this.findElement(XpathUtilsGroups.getName ("Logan Testi")).click();
		//			//this.findElement(XpathUtilsGroups.getFinishButton())
		//			boolean bool2 = this.elementExists(XpathUtilsGroups.getSelectGroup()); 
		//			if (bool2 == true)
		//			{
		//				this.findElement(XpathUtilsGroups.getSelectGroup()).click();
		//			}
		//
		//			this.wait_(3);
		//			WebElement element = this.driver.findElement(By.xpath("//span[text() = 'Finish']/.."));
		//			//this.wait_(5);
		//			element.click();
		//			this.wait_(10);
		//		}
		//		else 
		//		{ 
		//			System.out.println("no name found");
		//		}

	}

	public void addMultiplePeopleToGroup()
	{
		this.addGroup("TestGroup3"); 
		WebElement element = this.findElement(XpathUtilsGroups.getInputUsername()); 

		for (Credentials i: credentials)
		{
			element.clear();
			element.sendKeys(i.getUserName()); 
			this.wait_(3);
			boolean bool2 = this.elementExists(XpathUtilsGroups.getPersonGroupList()); 
			if (bool2 == true)
			{
				System.out.println("here"); 
				this.findElement(XpathUtilsGroups.getPersonGroupList()).click();
			}
			else 
			{
				System.out.println("no group"); 
			}
		}
		WebElement element2 = this.driver[0].findElement(By.xpath("//span[text() = 'Finish']/.."));
		element2.click();
	}
}

