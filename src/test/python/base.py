import os
import time
import webtest
import unittest
import ConfigParser

from selenium.webdriver.common.keys import Keys

# ----------------------------------

class Configuration():
	
	def __init__(self, users=(), url=None, driver=None):
		self.url = url
		self.users = users
		self.driver = driver
		
	@classmethod
	def read(cls, source):
		config = ConfigParser.ConfigParser()
		config.read(source) 
		
		# users
		users = cls._get_str_option(config, section='data', name="users")
		assert  users, 'users were not found in config file'
		users = eval(users)
		if not users or not isinstance(users, (list, tuple)):
			raise ValueError('invalid users array value')
		for t in users:
			assert isinstance(t, tuple) and len(t)==2, 'incorrect user/password tuple'
			
		# url
		url = cls._get_str_option(config, section='data', name="url")
		
		# driver
		driver = cls._get_str_option(config, section='data', name="driver")
		
		c = Configuration(users, url, driver)
		return c
		
	@classmethod
	def _get_str_option(cls, config, section=ConfigParser.DEFAULTSECT, name=None, default=None):
		return cls._get_option(config.get, section, name, default)

	@classmethod
	def _get_bool_option(cls, config, section=ConfigParser.DEFAULTSECT, name=None, default=False):
		return cls._get_option(config.getboolean, section, name, default)

	@classmethod
	def _get_int_option(cls, config, section=ConfigParser.DEFAULTSECT, name=None, default=None):
		return cls._get_option(config.getint, section, name, default)

	@classmethod
	def _get_float_option(cls, config, section=ConfigParser.DEFAULTSECT, name=None, default=None):
		return cls._get_option(config.getfloat, section, name, default)
		
	@classmethod
	def _get_option(method, section, name, default):
		try:
			return method(section, name)
		except:
			return default
		
#-----------------------------------------------	
	
def is_node_displayed(resp, _id, xpath, timeout=60):
	for _ in range(timeout):
		try:
			node_id = resp.doc.xpath(xpath).id
			if _id == node_id and id.is_displayed():
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

TEST_URL = os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')

class WebAppTestBase(unittest.TestCase):
	
	@classmethod
	def setUpClass(cls):
		#TODO: pass the config file
		cls.setUpApp()
		
	@classmethod
	def setUpApp(cls, ini_file):
		config = Configuration.read(ini_file)
		cls.users = config.users
		cls.url = config.url or TEST_URL
		cls.driver = config.driver
		if cls.driver:
			os.environ.setdefault('SELENIUM_DRIVER', cls.driver)
		cls.app = webtest.SeleniumApp(url= cls.url)
		
	@classmethod
	def tearDownClass(cls):
		cls.app.close()
	
	def setUp(self):
		try:
			self.resp = self.app.get(self.url)
		except Exception, e:
			self.fail(str(e))
			
	def login(self, user=None, password=None):
		credentials = self.users[0]
		user = user or credentials[0]
		password = password or credentials[1]
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
