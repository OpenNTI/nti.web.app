import os
import time

from lxml import etree

# ---------------------------------------		

TEST_URL = os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')
TEST_USER = os.environ.get('TEST_USER', 'jonathan.grimes@nextthought.com')
TEST_PASSWORD = os.environ.get('TEST_PASSWORD', 'jonathan.grimes')

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

def is_text_element_in_tree(resp, node, value):
	tree = etree.ElementTree(resp.lxml)
	for item in tree.iter(node):
		if item.text == value:
			return True
	else:
		return False
	
def elem_in_tree(resp, node, element, value):		
	tree = etree.ElementTree(resp.lxml)
	for item in tree.iter(node):
		if element == 'text' and item.text == value:
			return True
		if item.get(element) == value:
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
