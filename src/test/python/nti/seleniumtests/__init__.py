import os
import time
import html5lib
from lxml import etree
from html5lib import treewalkers, serializer, treebuilders

from sst.actions import get_element
from sst.actions import get_elements
from sst.actions import exists_element
from sst.actions import get_page_source
from sst.actions import get_current_url
from sst.actions import get_element_by_xpath
from sst.actions import get_elements_by_xpath

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

#def wait_for_page_to_load(url, timeout=10):
#	for _ in range(timeout):
#		if url == get_current_url():
#			break
#		time.sleep(1)
#	time.sleep(1)
	
def xpath_contains_builder(xpath, element, value):
	result = ['//', xpath, '[contains(@%s,"%s")]' % (element, value)] 
	return ''.join(result)
	
def xpath_contains_and_text_builder (tag, attribute, value, text):
	result = ['//', tag, '[contains(@%s,"%s") and text() = "%s"]' % (attribute, value, text)]
	return ''.join(result)

def xpath_text_builder(tag,text):
	result = ['//', tag, '[(text() = "%s")]' %  (text)]
	return ''.join(result)
	
def wait_for_element(driver = None, tag=None,attribute = None, attribute_value = None, ID=None, text=None, text_regex=None, timeout=30):
	if text is None: 
		xpath = xpath_contains_builder(tag, attribute, attribute_value)
	elif text and attribute: 
		xpath = xpath_contains_and_text_builder(tag, attribute, attribute_value, text)
	elif text is not None and  attribute is None: 
		xpath = xpath_text_builder (tag, text)
	else:
		print 'should handle this xpath'
		
 	print xpath
	for _ in range(timeout):
		driver.find_element_by_xpath (xpath)
		if driver.find_element_by_xpath(xpath): 
			break
		
#		print exists_element(tag=tag, css_class=css_class, id=ID, text=text, text_regex=text_regex)
#		if exists_element(tag=tag, css_class=css_class, id=ID, text=text, text_regex=text_regex):
#			break
		time.sleep(1)
	time.sleep(1)
	return False


def wait_for_element_xpath(xpath, timeout=10):
	for _ in range(timeout):
		try:
			node = get_elements_by_xpath(xpath)
			if node: break
		except:
			pass
		time.sleep(1)
	time.sleep(1)
