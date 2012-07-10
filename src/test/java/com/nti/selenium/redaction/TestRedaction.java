package com.nti.selenium.redaction;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class TestRedaction extends Redaction { 
	
	

	//@Test 
	public void testCreateRedaction(){ 
		this.createRedaction();
	}

	@Test
	public void testShareRedaction(){
		this.shareRedaction();
	}
 
	

}