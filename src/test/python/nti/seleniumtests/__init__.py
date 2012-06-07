import os
import time
import html5lib
from lxml import etree
from html5lib import treewalkers, serializer, treebuilders

from sst.actions import get_element
from sst.actions import get_elements
from sst.actions import get_element_by_xpath
from sst.actions import get_elements_by_xpath
from sst.actions import exists_element
from sst.actions import click_button 
from sst.actions import click_element
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

def safe_get_element(tag=None, css_class=None, ID=None, text=None, text_regex=None, **kwargs):
	try:
		return get_element(tag=tag, css_class=css_class, id=ID, text=text, text_regex=text_regex, **kwargs)
	except:
		return False

def safe_get_elements(tag=None, css_class=None, ID=None, text=None, text_regex=None, **kwargs):
	try:
		return get_elements(tag=tag, css_class=css_class, id=ID, text=text, text_regex=text_regex, **kwargs)
	except:
		return []
	
def safe_get_element_by_xpath(selector):
	try:
		return get_element_by_xpath(selector)
	except:
		return None
	
def safe_get_elements_by_xpath(selector):
	try:
		return get_elements_by_xpath(selector)
	except:
		return []
	
def safe_exists_element(tag=None, css_class=None, ID=None, text=None, text_regex=None, **kwargs):
	try:
		return exists_element(tag=tag, css_class=css_class, id=ID, text=text, text_regex=text_regex, **kwargs)
	except Exception:
		return False
	
def safe_click_button(id_or_elem):
	try:
		return click_button(id_or_elem)
	except:
		pass
	
def safe_click_element(id_or_elem):
	try:
		return click_element(id_or_elem)
	except:
		pass
	
# ---------------------------------------
			
def wait_for_element(tag=None, css_class=None, ID=None, text=None, text_regex=None, timeout=10):
	for _ in range(timeout*5):
		if text == 'NextThought App':
			print safe_exists_element(tag=tag, css_class=css_class, ID=ID, text=text, text_regex=text_regex)
		if safe_exists_element(tag=tag, css_class=css_class, ID=ID, text=text, text_regex=text_regex):
			break
		time.sleep(0.1)
	time.sleep(1)
	
def wait_for_element_xpath(xpath, timeout=10):
	for _ in range(timeout*5):
		if safe_exists_element(safe_get_elements_by_xpath(xpath)):
			break
		time.sleep(0.1)
	time.sleep(1)
