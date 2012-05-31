import os
import time
import webtest
import unittest

from ConfigParser import SafeConfigParser
from selenium.webdriver.common.keys import Keys


# ----------------------------------

class configuration ():
	
	def __init__(self):
		self.config = ConfigParser.ConfigParser() 	
		
	def users(self):
		self.config.read('config.ini') 
		tuple = self.config.items('Users')
		users = [] 
		for tuple in tuples: 
			users.append (tuples[1].split (','))
		return users 
	
	def url(self):
		self.config.read ('config.ini')
		url = self.config.get ('data', 'url')
		return url
	
	def driver(self):
		self.config.read ('config.ini')
		driver = self.config.get ('data', 'driver')
		return driver 
	
#-----------------------------------------------	
	
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
		cls.setUpApp()
		
	@classmethod
	def setUpApp(cls):
		self.users = configuration.users()
		self.user = users[0]
		url = configuration.url()
		environ = configuration.driver() 
		os.environ.setdefault('SELENIUM_DRIVER', environ)
		cls.url = os.environ.get('TEST_URL', url)
		cls.app = webtest.SeleniumApp(url= cls.url)
		
	@classmethod
	def tearDownClass(cls):
		cls.app.close()
	
	def setUp(self):
		try:
			self.resp = self.app.get(self.url)
		except Exception, e:
			self.fail(str(e))
			
	def login(self, user= self.user[0], password= self.user[0]):
		login(self.resp, user, password)

	def logout(self):
		logout(self.resp)
	
	def wait_for_text_by_xpath(self, text, xpath, timeout=60):
		if not wait_for_text(self.resp, text, xpath, timeout):
			self.fail("time out")
	
	def wait_for_node_by_xpath(self, xpath, timeout=60):
		if not wait_for_node(self.resp, xpath, timeout):
			self.fail("time out")

if __name__ == '__main__':
	unittest.main()
