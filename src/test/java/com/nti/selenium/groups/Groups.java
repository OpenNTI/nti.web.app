package com.nti.selenium.groups;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.*;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriverException;


import com.nti.selenium.navigation.Navigation; 

public class Groups extends Navigation { 

	
	protected static  String [] usernames = {"logan testi", "jessica jenko"}; 
	protected static String username = "logan testi";
	
	@After 
	public void tearDown(){ 
		
		
		
		WebElement element = this.findElement(XpathUtilsGroups.getGroupsList());
		List <WebElement>elements = element.findElements(By.xpath(XpathUtilsGroups.getGroupItem()));
		int count = elements.size();
		
		for(int i = 1; i<count; i++)
			
		{ 
			elements.get(i).click();
			this.wait_(3);
			
			//WebElement element1 = elements.get(i).findElement(By.xpath(XpathUtilsGroups.getGroupItemDiv())); 
			boolean bool = this.elementExists(XpathUtilsGroups.getGroupItemDiv("TestGroup"));
			if (bool == false)
			{
				System.out.print("The delete button is not visible"); 
				//this.findElement (XpathUtilsGroups.getDeleteButton()).click();	
			}
			else
			{
				System.out.print ("The item is visible");
				//this.findElement(XpathUtilsGroups.getGroupItemDiv("TestGroup")).click();
				this.wait_(3);
			}
			//element1.click();
			
			this.wait_(4);
			
		}
		System.out.println(count);
		
		
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
	
	public boolean addGroup(String groupname)
	{
		this.openGroups(); 
		boolean bool= true;
		WebElement element = this.findElement (XpathUtilsGroups.getInputGroupName()); 
		element.sendKeys (groupname); 
		this.findElement (XpathUtilsGroups.getAddButton()).click();
		
		try
		{ 
			this.findElement(XpathUtilsGroups.getGroupName(groupname));
			
		}
		catch (final NoSuchElementException e)
		{ 
			System.out.println("The group was not added"); 
			bool = false; 
			this.driver.close();
			
		}
		
		return bool; 
	}
	
	public void  addOnePersonToGroup()
	{
		this.addGroup("TestGroup2"); 
		this.findElement(XpathUtilsGroups.getInputUsername()).sendKeys("Logan Testi");
		this.wait_(3);
		boolean bool = this.elementExists(XpathUtilsGroups.getName("Logan Testi"));
		if (bool == true)
		{
			this.findElement(XpathUtilsGroups.getName ("Logan Testi")).click();
			//this.findElement(XpathUtilsGroups.getFinishButton())
			boolean bool2 = this.elementExists(XpathUtilsGroups.getSelectGroup()); 
			if (bool2 == true)
			{
				this.findElement(XpathUtilsGroups.getSelectGroup()).click();
			}
			
			this.wait_(3);
			WebElement element = this.driver.findElement(By.xpath("//span[text() = 'Finish']/.."));
			//this.wait_(5);
			element.click();
			this.wait_(10);
		}
		else 
		{ 
			System.out.println("no name found");
		}
		
	}
	
	public void addMultiplePeopleToGroup()
	{
		this.addGroup("TestGroup3"); 
		WebElement element = this.findElement(XpathUtilsGroups.getInputUsername()); 
		
		for (String i:usernames)
		{
			element.clear();
			element.sendKeys(i); 
			this.wait_(3);
			boolean bool2 = this.elementExists(XpathUtilsGroups.getSelectGroup()); 
			if (bool2 == true)
			{
				System.out.println("here"); 
				this.findElement(XpathUtilsGroups.getSelectGroup()).click();
			}
			else 
			{
				System.out.println("no group"); 
			}
		}
		WebElement element2 = this.driver.findElement(By.xpath("//span[text() = 'Finish']/.."));
		element2.click();
	}
}
	
