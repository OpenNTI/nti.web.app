import os
import webtest
import unittest

from nti.seleniumtests import test_url
from nti.seleniumtests import test_user
from nti.seleniumtests import test_password

from nti.seleniumtests import login
from nti.seleniumtests import logout
from nti.seleniumtests import wait_for_text
from nti.seleniumtests import wait_for_node
#from nti.seleniumtests import has_element_with_text
#from nti.seleniumtests import has_element_with_attr_value

from nti.seleniumtests.config import Configuration

# ----------------------------------

class WebAppTestBase(unittest.TestCase):
	
	def setUp(self):
		ini_file = getattr(self, 'ini_file', None)
		if ini_file:
			self.setUpApp(ini_file)
		else:
			config = Configuration( test_url(), ((test_user(), test_password()),),  None)
			self.setUpAppWithConfig(config)
		
	def setUpApp(self, ini_file):
		config = Configuration.read(ini_file)
		self.setUpAppWithConfig(config)
		
	def setUpAppWithConfig(self, config):
		self.config = config
		self.users = config.users
		self.driver = config.driver
		self.url = config.url or test_url()
		if self.driver:
			os.environ.setdefault('SELENIUM_DRIVER', self.driver)
		
		self.app = webtest.SeleniumApp(url= self.url)
		try:
			self.resp = self.app.get(self.url)
		except Exception, e:
			self.fail(str(e))
		
	def tearDown(self):
		self.app.close()

	# -----------------------
			
	def login(self, user=None, password=None, wait_after_login=5):
		credentials = self.users[0]
		user = user or credentials[0]
		password = password or credentials[1]
		login(self.resp, user, password, wait_after_login)

	def logout(self):
		logout(self.resp)
	
	def wait_for_text_by_xpath(self, text, xpath, timeout=60):
		if not wait_for_text(self.resp, text, xpath, timeout):
			self.fail("time out")
	
	def wait_for_node_by_xpath(self, xpath, timeout=60):
		if not wait_for_node(self.resp, xpath, timeout):
			self.fail("time out")


