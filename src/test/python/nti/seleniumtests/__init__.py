import os
import time
import html5lib
from lxml import etree
from html5lib import treewalkers, serializer, treebuilders

from sst.actions import get_elements
from sst.actions import get_elements_by_xpath
from sst.actions import exists_element
from sst.actions import get_page_source

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

# ---------------------------------------

def wait_for_element_to_reappear(node, value, timeout=10):
	
	#FIXME: we need to better handle the race event
	time.sleep(5)
	
	for _ in range(timeout):
		getout = False
		if exists_element(tag=node):
			for element in get_elements(tag=node):
				if element.text == value:
					getout = True
					break
		if getout:
			break
		time.sleep(0.2)
	time.sleep(1)
			

def wait_for_element_text(node, value, timeout=10):
	for _ in range(timeout):
		getout = False
		if exists_element(node):
			for element in get_elements(node):
				if element.text == value:
					getout = True
					break
		if getout:
			break
		time.sleep(0.2)
	time.sleep(1)
	
def wait_for_element_xpath(xpath, timeout=10):
	for _ in range(timeout):
		if exists_element(get_elements_by_xpath(xpath)):
			break
		time.sleep(0.2)
	time.sleep(1)
	
def wait_for_element_id(value, timeout=30):
	for _ in range(timeout):
		if exists_element(id=value):
			break
		time.sleep(0.2)
	time.sleep(1)
