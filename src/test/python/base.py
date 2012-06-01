import os
import six
import time
import webtest
import unittest
import ConfigParser

from lxml import etree
from selenium.webdriver.common.keys import Keys

# ----------------------------------

class Configuration():
	
	def __init__(self, url=None, users=(), driver=None):
		self.url = url
		self.users = users
		self.driver = driver
		
	@classmethod
	def read(cls, source):
		source = os.path.expanduser(source)
		config = ConfigParser.ConfigParser()
		config.read(source) 
		
		# users
		users = cls._get_str_option(config, section='data', name="users")
		assert  users, 'users were not found in config file'
		users = eval(users)
		if not users or not isinstance(users, (list, tuple)):
			raise ValueError('invalid users array value')
		
		tmp = []
		for t in users:
			if isinstance(t, six.string_types): # if string change to a tuple
				t = (t,)
			
			# check type
			assert isinstance(t, tuple), 'incorrect user/password tuple'
			
			# gather username and pwd
			name = t[0]
			pwd = t[1] if len(t) >=2 else name
			pwd = pwd or name
			if '@' not in name:
				name += '@nextthought.com'
			tmp.append((name, pwd))
		users = tuple(tmp)
		
		# url
		url = cls._get_str_option(config, section='data', name="url")
		
		# driver
		driver = cls._get_str_option(config, section='data', name="driver")
		
		result = Configuration(url, users, driver)
		result.config = config
		return result
		
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
	def _get_option(cls, method, section, name, default):
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
	resp.doc.input(name="password").value = password
	is_node_displayed(resp, 'submit', "//button")
	resp.doc.button(buttonid='submit').click()
	if wait_after_login:
		time.sleep(wait_after_login)
		
def logout(resp):
	status = resp.doc.get('div', id='submit')
	status.click()
	time.sleep(3)
#	resp.doc.xpath("//img[contains(@class, 'session-logout')]/..").click()		
#	wait_for_text(resp, "Username:","//label")

# ----------------------------------

TEST_URL = os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')
TEST_USER = os.environ.get('TEST_USER', 'jonathan.grimes@nextthought.com')
TEST_PASSWORD = os.environ.get('TEST_PASSWORD', 'jonathan.grimes')

class WebAppTestBase(unittest.TestCase):
	
	# -------------setup/teardown------------
	
	def setUp(self):
		ini_file = getattr(self, 'ini_file', None)
		if ini_file:
			self.setUpApp(ini_file)
		else:
			c = Configuration( TEST_URL, ((TEST_USER, TEST_PASSWORD),),  None)
			self.setUpAppWithConfig(c)
		
	def setUpApp(self, ini_file):
		config = Configuration.read(ini_file)
		self.setUpAppWithConfig(config)
		
	def setUpAppWithConfig(self, config):
		self.config = config
		self.users = config.users
		self.url = config.url or TEST_URL
		self.driver = config.driver
		if self.driver:
			os.environ.setdefault('SELENIUM_DRIVER', self.driver)
		self.app = webtest.SeleniumApp(url= self.url)
		try:
			self.resp = self.app.get(self.url)
		except Exception, e:
			self.fail(str(e))
		
	def tearDown(self):
		self.app.close()
		
	# -----------helper functions-------------
	
	def elem_in_tree(self, node, element, value):		
		tree = etree.ElementTree(self.resp.lxml)
		for item in tree.iter(node):
			if item.get(element) == value:
				return True
		else: return False
		
	def text_in_tree(self, node, value):		
		tree = etree.ElementTree(self.resp.lxml)
		for item in tree.iter(node):
			if item.text == value:
				return True
		else: return False
			
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


