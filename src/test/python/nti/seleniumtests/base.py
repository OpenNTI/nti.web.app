import time
import unittest

from sst.actions import start
from sst.actions import stop
from sst.actions import go_to

from nti.seleniumtests import test_url
from nti.seleniumtests import test_user
from nti.seleniumtests import test_password
from nti.seleniumtests import wait_for_element
from nti.seleniumtests import wait_for_element_xpath
from nti.seleniumtests import wait_for_page_load

from nti.seleniumtests.config import Configuration

from sst.actions import get_element
from sst.actions import get_elements
from sst.actions import get_element_by_xpath
from sst.actions import get_elements_by_xpath
from sst.actions import exists_element
from sst.actions import click_button
from sst.actions import click_element
from sst.actions import write_textfield
from sst.actions import simulate_keys
from sst.actions import get_page_source

from selenium.common.exceptions import ElementNotVisibleException

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
		result = ['//', xpath, '[contains(@%s,"%s")]' % (element, value)]
		return ''.join(result)
	
	def _logout_click(self, logout_xpath):
		elements = get_elements_by_xpath(logout_xpath)
		elem = ''
		for element in elements:
			if element.text == 'Sign out':
				elem = element
		if elem:
			click_element(elem)
	
	def _logout_enter_key(self, dropdown_item_element):
		simulate_keys(dropdown_item_element, 'ARROW_UP')
		simulate_keys(dropdown_item_element, 'RETURN')
	
	def _login(self, user, password, click):
		try:
			wait_for_element(ID='username')
			write_textfield(get_element(ID='username'), user)
			
			wait_for_element(ID='password')
			write_textfield(get_element(ID='password'), password)
			
			wait_for_element(tag='button', ID='submit')
			if click: 
				click_button('submit')
			else: 
				simulate_keys(get_element(ID='password'), 'RETURN')
				
			wait_for_page_load('NextThought App')
		except ElementNotVisibleException:
			pass
			
	def _logout(self, xpath_contains_builder, click): 
	
		
		options_xpath = xpath_contains_builder("div", "class", 'my-account-wrapper')
		options_element = get_element_by_xpath(options_xpath)
		assert options_element, 'my-account-wrapper element not found'
		click_element(options_element)
		
		#//*[@id="my-account-menu-1039-innerCt"]
		dropdown_items_xpath = xpath_contains_builder('div', 'class', 'x-vertical-box-overflow-body')
		dropdown_xpath = dropdown_items_xpath + '/*' + '/*'
		menu_xpath = xpath_contains_builder('div', 'class', 'my-account-menu') 
		notifications_xpath = xpath_contains_builder('div', 'class', 'notifications')
		
		
		wait_for_element_xpath(dropdown_xpath)
		if click:
			self._logout_click(dropdown_xpath)
		else:
			dropdown_items_element = get_element_by_xpath(menu_xpath + '/*' + notifications_xpath)
			self._logout_enter_key(dropdown_items_element)
			
		wait_for_element_xpath(xpath_contains_builder('label', 'for', 'username'))
	
	def login(self, user=None, password=None, click=True):
		credentials = self.users[0]
		user = user or credentials[0]
		password = password or credentials[1]
		self._login(user, password, click)

	def logout(self, click=True):
		self._logout(self.xpath_contains_builder, click)


