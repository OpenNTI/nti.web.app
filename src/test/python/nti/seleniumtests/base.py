import os
import webtest
import unittest, time

from nti.seleniumtests import test_url
from nti.seleniumtests import test_user
from nti.seleniumtests import test_password

from nti.seleniumtests import login
from nti.seleniumtests import logout
from nti.seleniumtests import wait_for_text_to_display
from nti.seleniumtests import wait_for_node_to_display
from sst.actions import start
from sst.actions import stop
from sst.actions import go_to

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
		try:
			start()
			go_to(test_url())
		except Exception, e:
			self.fail(str(e))
		
	def tearDown(self): 
		stop()
		time.sleep(1)

	# -----------------------
	
	def xpath_contains_builder(self, xpath, element, value):
		return xpath + "[contains(@" + element + ", '" + value + "')]"
	
	def login(self, user=None, password=None):
		credentials = self.users[0]
		user = user or credentials[0]
		password = password or credentials[1]
		login(user, password, self.xpath_contains_builder)

	def logout(self):
		logout(self.resp, self.xpath_contains_builder)
	
	def wait_for_text_by_xpath(self, xpath, text, timeout=60):
		if not wait_for_text_to_display(self.resp, xpath, text, timeout):
			self.fail("time out")
	
	def wait_for_node_by_xpath(self, xpath, element, value, timeout=60):
		if not wait_for_node_to_display(self.resp, xpath, element, value, timeout):
			self.fail("time out")


