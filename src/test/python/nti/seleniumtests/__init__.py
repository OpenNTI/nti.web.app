import os
import time

from sst.actions import get_element_by_xpath
from sst.actions import write_textfield
from sst.actions import simulate_keys
from sst.actions import click_button

from lxml import etree
from selenium.webdriver.common.keys import Keys

# ---------------------------------------		

def test_url():
	return os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')

def test_user():
	return os.environ.get('TEST_USER', 'jonathan.grimes@nextthought.com')

def test_password():
	return os.environ.get('TEST_PASSWORD', 'jonathan.grimes')

# ---------------------------------------	

def wait_for_text_to_display(resp, xpath, value, timeout=10):
	for _ in range(timeout):
		try:
			if resp.doc.xpath(xpath).text() == value:
				break
		except:
			pass
		time.sleep(0.2)
	time.sleep(1)
	
def wait_for_node_to_display(resp, xpath, timeout=10):
	for _ in range(timeout):
		try:
			if resp.doc.xpath(xpath).exist():
				break
		except:
			pass
		time.sleep(0.2)
	time.sleep(1)
	
# ---------------------------------------	

def login(user, password, xpath_contains_builder, click=True):
#	wait_for_node_to_display(resp, xpath_contains_builder('//label', 'for', 'username') + '/..')
	time.sleep(3)
	write_textfield(get_element_by_xpath(xpath_contains_builder('//input', 'name', 'username')), user)
	time.sleep(3)
	write_textfield(get_element_by_xpath(xpath_contains_builder('//input', 'name', 'password')), password)
	time.sleep(3)
	if click: click_button('submit')
	else: simulate_keys(get_element_by_xpath(xpath_contains_builder('//input', 'name', 'password')), 'RETURN')
	time.sleep(3)
#	wait_for_node_to_display(resp, xpath_contains_builder('//label', 'for', 'password') + '/..')
#	resp.doc.input(name="password").value = password
#	wait_for_node_to_display(resp, xpath_contains_builder('//button', 'id', 'submit') + '/..')
#	print dir(resp.doc.input(name="password").value__set("bla"))
#	#.value = resp.doc.input(name="password").value + '/r'
#	wait_for_text_to_display(resp, '//title', 'NextThough App')
		
def logout(resp, xpath_contains_builder): pass
#	wait_for_text_to_display(resp, '//title', 'NextThough App')
#	resp.doc.xpath(xpath_contains_builder("//div", "class", 'my-account-wrapper')).click()
#	logout_xpath = (xpath_contains_builder('//div', 'class', 'x-box-inner x-vertical-box-overflow-body') + 
#					'/*' + 
#					xpath_contains_builder('//div', 'id', 'menuitem-1047'))
#	wait_for_node_to_display(resp, logout_xpath)
#	resp.doc.xpath(logout_xpath).click()
#	wait_for_node_to_display(resp, xpath_contains_builder('//label', 'for', 'username') + '/..')
