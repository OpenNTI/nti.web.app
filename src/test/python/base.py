import os, time, unittest, webtest
from ConfigParser import SafeConfigParser

import selenium, time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

TEST_URL = os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')
TEST_USER = os.environ.get('TEST_USER', 'jonathan.grimes@nextthought.com')
TEST_PASSWORD = os.environ.get('TEST_PASSWORD', 'jonathan.grimes')

class WebAppTestBase(unittest.TestCase):
	
	@classmethod
	def setUpClass(cls):
		cls.setUpApp(TEST_URL)
	
	@classmethod
	def setUpApp(cls, test_url=TEST_URL):
		cls.parser_config = SafeConfigParser()
		cls.parser_config.read('config.ini')
		cls.user1 = cls.parser_config.get('data', 'user1').split(',')
		cls.user2 = cls.parser_config.get('data', 'user2').split(',')
		cls.user3 = cls.parser_config.get('data', 'user3').split(',')
		cls.user4 = cls.parser_config.get('data', 'user4').split(',')
		os.environ.setdefault('SELENIUM_DRIVER', '*firefox')
		cls.url = os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')
		cls.app = webtest.SeleniumApp(url=cls.url)
		
	@classmethod
	def tearDownClass(cls):
		cls.app.close()
	
	# give enough time for elements to appear and be selectable
#	def listen_for_element_presents(self, element_name, obj, timeout=30):
#		start_time = time.time()
#		while(not obj.find_element_by_id(element_name).is_displayed()):
#			time.sleep(0.2)
#		if (time.time() - start_time) > timeout: raise Exception
#		time.sleep(1)
	
	def setUp(self):
		try:
			self.resp = self.app.get(self.url)
		except Exception, e:
			self.fail(str(e))
			
	def login(self, user=TEST_USER, password=TEST_PASSWORD):
		resp = self.resp
		
		self.wait_for_text("Username:","//label")
		
		resp.doc.input(name="username").value = self.user1[0]
		resp.doc.input(Keys.RETURN)
		resp.doc.input(name="password").value = self.user2[1]
		resp.doc.button(buttonid='submit').click()
		time.sleep(5)
#		self.listen_for_element_presents("submit", resp)
#		self.wait_for_node('//div[@id="top-controls"]')
	
	def logout(self):
		self.resp.doc.xpath("//img[contains(@class, 'session-logout')]/..").click()		
		self.wait_for_text("Username:","//label")
	
	def wait_for_text(self, text, xpath, timeout=60):
		resp = self.resp
		for _ in range(timeout):
			try:
				if text == resp.doc.xpath(xpath).text():
					break
			except: 
				pass
			time.sleep(1)
		else: 
			self.fail("time out")
	
	def wait_for_node(self, xpath, timeout=60):
		resp = self.resp
		for _ in range(timeout):
			try:
				if resp.doc.xpath(xpath).exist(): 
					break
			except:
				pass
			time.sleep(1)
		else: 
			self.fail("time out")

if __name__ == '__main__':
	unittest.main()
