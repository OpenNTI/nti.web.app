import os
import time

from lxml import etree

# ---------------------------------------		

def test_url():
	return os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')

def test_user():
	return os.environ.get('TEST_USER', 'jonathan.grimes@nextthought.com')

def test_password():
	return os.environ.get('TEST_PASSWORD', 'jonathan.grimes')

# ---------------------------------------	
	
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
			
# ---------------------------------------	

def has_element_with_text(resp, node, value):
	tree = etree.ElementTree(resp.lxml)
	for item in tree.iter(node):
		if item.text == value:
			return True
	else:
		return False
	
def has_element_with_attr_value(resp, node, attribute, value):		
	tree = etree.ElementTree(resp.lxml)
	for item in tree.iter(node):
		if item.get(attribute) == value:
			return True
	else:
		return False
		
# ---------------------------------------	

def login(resp, user, password, wait_after_login=5):
	wait_for_text(resp, "Username:","//label")
	time.sleep(1)
	resp.doc.input(name="username").value = user
	resp.doc.input(name="password").value = password
	is_node_displayed(resp, 'submit', "//button")
	resp.doc.button(buttonid='submit').click()
	if wait_after_login:
		time.sleep(wait_after_login)
		
def logout(resp):
	#TODO: Fix for new skin
	resp.doc.xpath("//img[contains(@class, 'session-logout')]/..").click()		
	wait_for_text(resp, "Username:","//label")
