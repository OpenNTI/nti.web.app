package com.nti.selenium.groups; 
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test; 

public class TestGroups extends Groups { 
	
	@Test
	public void testOpenGroups ()
	{ 
		this.openGroups (); 
	}
	
	@Test 
	public void testAddGroup()
	{ 
		this.addGroup (Long.toString(System.currentTimeMillis()));
		this.addGroup (Long.toString(System.currentTimeMillis()));
		this.addGroup (Long.toString(System.currentTimeMillis()));
	}
	
	@Test 
	public void testAddPeopleToGroup()
	{ 
		this.addOnePersonToGroup(1); 
	}
	
	@Test 
	public void testAddMultiplePeopleToGroup()
	{
		this.addMultiplePeopleToGroup();
	}
}
