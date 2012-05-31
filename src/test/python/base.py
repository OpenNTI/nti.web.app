import os
import time
import webtest
import unittest

from ConfigParser import SafeConfigParser
from selenium.webdriver.common.keys import Keys


# ----------------------------------

class Configuration ():
	
	def __init__(self):
		self.config = SafeConfigParser() 	
		
	def users(self):
		self.config.read('config.ini') 
		tuples = self.config.get('data', 'users').split(':')
		users = [] 
		for toople in tuples: 
			users.append((toople.split (',')[0],toople.split(',')[1]))
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
	
def is_node_displayed(resp, ID, xpath, timeout=60):
	for _ in range(timeout):
		try:
			if ID == resp.doc.xpath(xpath).id: 
				if id.is_displayed():
					break
		except:
			pass
		time.sleep(1)
		return True
	else: 
		return False
	
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
	resp.doc.input(name="password").value = password
	is_node_displayed(resp, 'submit', '//button')
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
		config = Configuration()
		cls.users = config.users()
		cls.user = cls.users[0]
		url = config.url()
		environ = config.driver() 
		os.environ.setdefault('SELENIUM_DRIVER', environ)
		cls.url = os.environ.get('TEST_URL', url)
		cls.app = webtest.SeleniumApp(url=url)
		
	@classmethod
	def tearDownClass(cls):
		cls.app.close()
	
	def setUp(self):
		try:
			self.resp = self.app.get(self.url)
		except Exception, e:
			self.fail(str(e))
			
	def login(self, user=None, password=None):
		if not user: user = self.users[0][0] + '@nextthought.com'
		if not password: password = self.users[0][1]
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
