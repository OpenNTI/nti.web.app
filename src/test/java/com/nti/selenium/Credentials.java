package com.nti.selenium;

import java.util.Properties;

public class Credentials {

	private String[][] credentials;
	
	public Credentials(Properties propertiesFile){
		credentials = this.setUsers(propertiesFile.getProperty("users"));
	}
	
	private String[][] setUsers(String userList){
		String[] userNames = userList.split(",");
		this.credentials = new String[userNames.length][2];
		for(int i = 0; i < userNames.length; i++){
			userNames[i].trim();
			credentials[i][0] = userNames[i] + "@nextthought.com";
			credentials[i][1] = userNames[i];
		}
		return credentials;
	}
	
	public String[] getFirstUser(){
		return credentials[0];
	}
	
	public String[] getSecondUser(){
		return credentials[1];
	}
	
	public String[] getThirdUser(){
		return credentials[2];
	}
	
	public String[] getFourthUser(){
		return credentials[3];
	}
	
	public String[][] getAllUsers(){
		return credentials;
	}
	
}