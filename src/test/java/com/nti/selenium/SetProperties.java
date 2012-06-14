package com.nti.selenium;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

public class SetProperties {

	public static void main(String[] args){
		
		Properties prop = new Properties();
		
		try{
			prop.setProperty("url", "http://localhost:8081/NextThoughtWebApp/");
			prop.setProperty("users", "pacifique.mahoro, nathalie.kaligirwa, carlos.sanchez), logan.testi,logan.testi");
			prop.setProperty("driver", "*firefox");
			
			prop.setProperty("bookName", "Prealgebra");
			prop.setProperty("chapterName", "Fractions");
			prop.setProperty("sectionName", "Index");
			prop.setProperty("books", "MathCounts,2012 MathCounts School Handbook,Prealgebra");
			
			String webAppPath = System.getProperty("user.dir");
			String localPath = "/src/test/java/com/nti/selenium/config/main.properties";
			
			prop.store(new FileOutputStream(webAppPath + localPath), null);
			
		}
		catch (IOException ex){
			ex.printStackTrace();
		}
		
	}
	
}
