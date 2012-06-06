import os
import time
import html5lib
from lxml import etree
from html5lib import treewalkers, serializer, treebuilders

from sst.actions import get_element
from sst.actions import get_elements
from sst.actions import get_element_by_xpath
from sst.actions import write_textfield
from sst.actions import simulate_keys
from sst.actions import click_button
from sst.actions import exists_element
from sst.actions import wait_for
from sst.actions import click_element
from sst.actions import get_page_source

from selenium.common.exceptions import ElementNotVisibleException
from selenium.webdriver.common.keys import Keys

# ---------------------------------------		

def test_url():
	return os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')

def test_user():
	return os.environ.get('TEST_USER', 'jonathan.grimes@nextthought.com')

def test_password():
	return os.environ.get('TEST_PASSWORD', 'jonathan.grimes')

# ---------------------------------------	

def html_parse(html=None):
	html = html or  get_page_source()
	p = html5lib.HTMLParser( tree=treebuilders.getTreeBuilder("lxml"), namespaceHTMLElements=False )
	tree = p.parse (html)
	return tree

def wait_for_element_text(node, value, timeout=10):
	for _ in range(timeout):
		html = get_page_source()
		tree = html_parse(html)
		for item in tree.iter(node):
			txt = item.text
			if txt == value:
				break
		time.sleep(0.2)
	time.sleep(1)
	
def wait_for_element_xpath(xpath, timeout=10):
	for _ in range(timeout):
		html = get_page_source()
		tree = html_parse(html)
		if tree.xpath(xpath):
			break
		time.sleep(0.2)
	time.sleep(1)
	
def wait_for_element_id(value, timeout=10):
	for _ in range(timeout):
		if exists_element(id=value):
			break
		time.sleep(0.2)
	time.sleep(1)
	
# ---------------------------------------	

def login(user, password, click):
	try:
		wait_for_element_id('username')
		write_textfield(get_element(id='username'), user)
		wait_for_element_id('password')
		write_textfield(get_element(id='password'), password)
		wait_for_element_id('submit')
		if click: 
			click_button('submit')
		else: 
			simulate_keys(get_element(id='password'), 'RETURN')
		wait_for_element_text('title', 'NextThought App')
	except ElementNotVisibleException:
		pass
		
def logout(xpath_contains_builder): 
	wait_for_element_text('title', 'NextThought App')
	click_element(get_element_by_xpath(xpath_contains_builder("//div", "class", 'my-account-wrapper')))
	
	xpath_1 = xpath_contains_builder('//div', 'class', 'x-box-inner x-vertical-box-overflow-body')
	xpath_2 = xpath_contains_builder('//div', 'id', 'menuitem-1047') #TODO: why refering to menuitem-1047
	logout_xpath = xpath_1 + '/*' + xpath_2
	wait_for_element_xpath(logout_xpath)
	
	time.sleep(3)
	click_element(get_element_by_xpath(logout_xpath))
	time.sleep(3)
	
	wait_for_element_xpath(xpath_contains_builder('//label', 'for', 'username') + '/..')
