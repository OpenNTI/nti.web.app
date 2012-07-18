package com.nti.selenium.redaction;
import java.util.List;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver; 
import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.*; 
import com.nti.selenium.navigation.Navigation;
import com.thoughtworks.selenium.Selenium;

public class Redaction extends Navigation { 

	String[] searchUserNames;

	@Before
	public void setUp() throws Exception{

		super.setUp();
		this.driver[1].manage().window().maximize();
		this.navigateTo("Criminal Procedure", "MIRANDA v. ARIZONA.", "Opinion of the Court");
		this.searchUserNames = this.getSearchUserNames(1);
	}

	@After 
	public void tearDown(){ 
//		List <WebElement> elements = this.findElements(XpathUtilsRedaction.getRedaction());
//		elements.get(0).click(); 
//		WebElement element = this.findElement(XpathUtilsRedaction.setDeleteRedaction());
//		element.click(); 
	}

	public void createRedaction(){
		System.out.println("here");
		this.switchToIframe(); 
		this.selectText2(0,0,5);
		this.switchToDefault();
		this.elementExists(XpathUtilsRedaction.setCreateRedaction()); 
		this.findElement(XpathUtilsRedaction.setCreateRedaction()).click();
		this.driver[1].navigate().refresh();
		this.navigateTo("Criminal Procedure", "MIRANDA v. ARIZONA.", "Opinion of the Court");
		
	}

	public void shareRedaction(){
		this.createRedaction(); 
		this.switchToIframe();
		//this.waitForElement(XpathUtilsRedaction.setRedaction()); 
		//this.findElement(XpathUtilsRedaction.setRedaction ()).click();
		final List <WebElement> elements = this.findElements(XpathUtilsRedaction.getRedaction()); 
		elements.get(0).click();
		//this.wait_(3);
		this.switchToDefault();

		//ebElement element = this.findElement(XpathUtilsRedaction.getRedaction());
		//element.click();
			this.elementExists(XpathUtilsRedaction.setShareWith());
			this.findElement(XpathUtilsRedaction.setShareWith()).click(); 
			
			WebElement element = this.findElement(XpathUtilsRedaction.setEnterUsername()); 
				element.click();
				element.sendKeys(this.searchUserNames[0]);
				element.sendKeys (Keys.ENTER);
	}
}