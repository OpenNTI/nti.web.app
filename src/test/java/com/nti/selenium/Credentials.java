package com.nti.selenium;

public class Credentials {
	
	private final String username;
	private final String password;
	
	public Credentials(final String user, final String password) {
		if  (user.indexOf('@') == -1) {
			this.username = user + "@nextthought.com";
		} else {
			this.username = user;
		}
		this.password = password;
	}
	
	public String getUserName() {
		return this.username;
	}
	
	public String getPassword() {
		return this.password;
	}
}