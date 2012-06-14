package com.nti.selenium;

public class Credentials {
	
	private String username;
	private String password;
	
	public Credentials(String user, String password){
		this.username = user + "@nextthought.com";
		this.password = password;
	}
	
	public String[] getCredential(){
		String[] credential = {this.username, this.password};
		return credential;
	}
	
}