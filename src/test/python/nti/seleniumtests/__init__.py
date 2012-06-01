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
	
def wait_for_node_to_display(resp, xpath, element, value, timeout=60):
	for _ in range(timeout):
		try:
			if resp.doc.xpath(xpath + "[contains(@" + element + ", " + value + ")]/..").exist():
				break
		except:
			pass
		time.sleep(0.2)
	time.sleep(1)
			
# ---------------------------------------	

def as_the_text_of(node, resp):
	tree = etree.ElementTree(resp.lxml)
	items = [node]
	for item in tree.iter(node):
		items.append(item.text)
	return items
	
def as_the_value_of(element, node, resp):		
	tree = etree.ElementTree(resp.lxml)
	items = [node]
	for item in tree.iter(node):
		value = item.get(element)
		items.append(value)
	return items
		
# ---------------------------------------	

def login(resp, user, password):
	wait_for_node_to_display(resp, '//label', 'for', 'username')
	resp.doc.input(name="username").value = user
	wait_for_node_to_display(resp, '//label', 'for', 'password')
	resp.doc.input(name="password").value = password
	wait_for_node_to_display(resp, '//button', 'id', 'submit')
	resp.doc.button(buttonid='submit').click()
		
def logout(resp):
	time.sleep(3)
	resp.doc.xpath("//div[contains(@class, 'my-account-wrapper')]/..").click()
#	time.sleep(3)
#	resp.doc.xpath("//div[contains(@style, 'border-width: 0px; left: 0px; margin: 0px; width: 250px; top')]/..").click()
#	time.sleep(3)
#	tree = etree.ElementTree(resp.lxml)
#	resp.doc.button(buttonid='my-account-1038').click()
#	resp.doc.xpath("//div[contains(@id, 'my-account-1038')]/..").click()
#	time.sleep(5)
#	resp.doc.xpath("//div[contains(@id, 'menuitem-1047')]/..").click()
#	time.sleep(5)
	
#	for item in tree.iter('div'):
#		if item.get('class') == 'my-account-wrapper':
#			print item.get('class')
#			item.click()
#			dir(item)
#			print dir(item)
	time.sleep(3)
#	resp.doc.xpath("//img[contains(@class, 'session-logout')]/..").click()		
#	wait_for_text(resp, "Username:","//label")
