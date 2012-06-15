package com.nti.selenium;

public class Credentials {
	
	private final String username;
	private final String password;
	
	public Credentials(final String user, final String password) {
		this.username = user + "@nextthought.com";
		this.password = password;
	}
	
	public String getUserName() {
		return this.username;
	}
	
	public String getPassword() {
		return this.password;
	}
	
}