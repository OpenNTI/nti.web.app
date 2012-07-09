package highlights;

import java.util.List;

import org.junit.Before;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import com.nti.selenium.navigation.Navigation;

public class Highlights extends Navigation {

	@Before
	public void setUp() throws Exception{
		super.setUp();
		this.navigateTo("Prealgebra", "Fractions", "What is a Fraction?");
	}
	
	public void bladeblabla(){
//		String script = "var range = document.createRange();" +
//				"var start = document.getElementById('page-contents');" +
//				"var textNode = start.getElementsByTagName('p')[0].firstChild;" +
//				"range.setStart(textNode, 12);" +
//				"range.setEnd(textNode, 13);" +
//				"window.getSelection().addRange(range);";
//		((JavascriptExecutor)this.driver).executeScript(script);
//		List<WebElement> x = this.findElements("//div[@class='page-contents']//p//span");
//		WebElement y = x.get(1);
//		System.out.println(y.getText());
//		System.out.println(y.getTagName());
//		System.out.println(y.getAttribute(""));
		
//		String downAt = "//div[@class='page-contents']//p//span[text()='12']";
//		WebElement element = this.findElement(downAt);
//		Actions actions = new Actions(this.driver);
//		System.out.println("starting");
//		this.wait_(3);
//		actions.moveByOffset(1, 1);
//		actions.moveToElement(element)
//			.clickAndHold()
//			.moveByOffset(100, 10000)
//			.release()
//			.perform();
		
		String downAt = "//div[@class='page-contents']//p//span[text()='12']";
		String upAt = "//div[@class='page-contents']//p//span[text()='3']";
		String iframe = "//iframe";
//		Number xCord = this.selenium.getElementPositionLeft(iframe);
//		Number yCord = this.selenium.getElementPositionTop(iframe);
//		String startCords = this.xpath.buildString(Integer.toString((Integer)xCord) , ",", Integer.toString((Integer)yCord));
//		String endCords = this.xpath.buildString("(", Integer.toString((Integer)xCord+200) , ",", Integer.toString((Integer)yCord+800), ")");
//		System.out.println(this.selenium.getMouseSpeed());
//		System.out.println(this.selenium.getCursorPosition(iframe));
		this.wait_(1);
		System.out.println("down");
		this.selenium.mouseDownAt(downAt, "10,10");
		this.wait_(1);
		System.out.println("move");
		this.selenium.mouseMoveAt(upAt, "10,10");
		this.wait_(1);
		System.out.println("hover");
		this.selenium.mouseOver(upAt);
		this.wait_(1);
		System.out.println("up");
		this.selenium.mouseUpAt(upAt, "10,10");
		this.wait_(1);
		System.out.println("click");
		this.selenium.click(upAt);
		System.out.println("done");
		
//		String xpath = "//div[@class='page-contents']//p";
//		WebElement y = x.get(0);
//		this.selenium.mouseOver(y);
//		this.selenium.cl
		this.wait_(10);
	}
	
}
