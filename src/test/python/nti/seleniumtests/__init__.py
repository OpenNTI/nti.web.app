import os
import time
import html5lib
from lxml import etree
from html5lib import treewalkers, serializer, treebuilders

from sst.actions import get_element
from sst.actions import get_elements
from sst.actions import exists_element
from sst.actions import get_page_source
from sst.actions import get_element_by_xpath
from sst.actions import get_elements_by_xpath
from sst.actions import assert_title
from sst.actions import assert_title_contains

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

def wait_for_page_load(text, timeout=10):
	for _ in range(timeout):
		try:
			assert_title()
			assert_title_contains(text)
		except:
			pass
		time.sleep(1)
	time.sleep(1)

def wait_for_element(tag=None, css_class=None, ID=None, text=None, text_regex=None, timeout=10):
	for _ in range(timeout):
		if exists_element(tag=tag, css_class=css_class, id=ID, text=text, text_regex=text_regex):
			break
		time.sleep(1)
	time.sleep(1)
	
def wait_for_element_xpath(xpath, wait=0, timeout=10):
	time.sleep(wait)
	for _ in range(timeout):
		try:
			node = get_elements_by_xpath(xpath)
			if node: break
		except:
			pass
		time.sleep(1)
	time.sleep(1)