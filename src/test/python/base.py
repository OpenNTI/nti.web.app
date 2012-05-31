import os
import time
import webtest
import unittest

from ConfigParser import SafeConfigParser
from selenium.webdriver.common.keys import Keys

TEST_URL = os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')
TEST_USER = os.environ.get('TEST_USER', 'jonathan.grimes@nextthought.com')
TEST_PASSWORD = os.environ.get('TEST_PASSWORD', 'jonathan.grimes')

# ----------------------------------

def wait_for_node(resp, xpath, timeout=60):
	for _ in range(timeout):
		try:
			if resp.doc.xpath(xpath).exist(): 
				break
		except:
			pass
		time.sleep(1)
		return True
	else: 
		return False
			
def wait_for_text(resp, text, xpath, timeout=60):
	for _ in range(timeout):
		try:
			if text == resp.doc.xpath(xpath).text():
				break
		except: 
			pass
		time.sleep(1)
		return True
	else: 
		return False
			
def login(resp, user, password, wait_after_login=5):
	wait_for_text(resp, "Username:","//label")
	resp.doc.input(name="username").value = user
	resp.doc.input(Keys.RETURN)
	resp.doc.input(name="password").value = password
	resp.doc.button(buttonid='submit').click()
	if wait_after_login:
		time.sleep(wait_after_login)
		
def logout(resp):
	#TODO: Fix for new skin
	resp.doc.xpath("//img[contains(@class, 'session-logout')]/..").click()		
	wait_for_text(resp, "Username:","//label")

# ----------------------------------

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
	
	def setUp(self):
		try:
			self.resp = self.app.get(self.url)
		except Exception, e:
			self.fail(str(e))
			
	def login(self, user=TEST_USER, password=TEST_PASSWORD):
		login(self.resp, self.user1[0], self.user1[1])

	def logout(self):
		logout(self.resp)
	
	def wait_for_text(self, text, xpath, timeout=60):
		if not wait_for_text(self.resp, text, xpath, timeout):
			self.fail("time out")
	
	def wait_for_node(self, xpath, timeout=60):
		if not wait_for_node(self.resp, xpath, timeout):
			self.fail("time out")

if __name__ == '__main__':
	unittest.main()
