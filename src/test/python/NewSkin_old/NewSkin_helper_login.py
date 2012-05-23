from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
import html5lib
from html5lib import treewalkers, serializer, treebuilders
import lxml.etree
import time, re, unittest


class Module():

    #Setup the driver, lxml.etree doc
    def setUp(self,driver):
        print 'here'
        self.driver = driver
        time.sleep(5)
        self.html = self.driver.page_source
        self.p = html5lib.HTMLParser( tree=treebuilders.getTreeBuilder("lxml"), namespaceHTMLElements=False )
        self.doc = self.p.parse( self.html )

        #  Login Locators and Actions
        #=============================
        
    def login(self,username, password):
        driver = self.driver
        driver.find_element_by_id("username").clear()
        driver.find_element_by_id("username").send_keys(username.strip() +"@nextthought.com")
        time.sleep(5)
        driver.find_element_by_id("password").clear()
        driver.find_element_by_id("password").send_keys(password.strip())
        time.sleep(5)
        driver.find_element_by_id("submit").click()
        time.sleep(5)

    #Check if the login form is rendered when the user first opens the app. 
    def find_login_form(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse(self.html)
        for node in self.doc.iter("form"):
            if (node.get('id') == 'login'):
                return True
                break

        return False
    
    #click on different urls on the login page.
    def click_url(self,text, url):
        driver = self.driver
        driver.get(url)
        driver.find_element_by_link_text(text).click()
        time.sleep(5)

    #Find the title of the app after login. 
    def find_title(self):
        driver = self.driver
        return driver.title

    #find the name of the name displayed is the user's...
    def find_name(self):
        driver = self.driver
        time.sleep(3) 
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        self.name = ''
        for node in self.doc.iter("div"):
            if (node.get ('class') == 'name'):
                self.name = node.text
                break
        return self.name

    def find_error_message(self):
        driver = self.driver
        time.sleep(3)
        text = ''
        self.html = driver.page_source
        self.doc = self.p.parse(self.html)
        for node in self.doc.iter("div"):
            if (node.get('class') == 'message'):
                print node.text
                return node.text
        return text

    def enter_username(self, username):
        driver = self.driver
        driver.find_element_by_id("username").clear()
        driver.find_element_by_id("username").send_keys(username.strip() +"@nextthought.com")
        time.sleep(5)
        
        
    def find_alternate_login(self,type):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse(self.html)
        dict = {}
        for node in self.doc.iter("button"):
            if node.get('class') == 'logon facebook' or node.get('class') == 'logon google':
                dict [node.get('class').split()[1]] = node.get('class')

        return dict.has_key(type)


    def find_setting(self, name):
        driver = self.driver
        id = ''  
        self.doc = self.p.parse(driver.page_source)
        for node in self.doc.iter('div'):
            if node.text is not None and node.text.lower() == name.strip():
                id = node.get ('id')

        return id


    def click_on_setting (self, name):
        driver = self.driver
        success = True
        driver.find_element_by_id (self.find_setting(name.strip())).click()
        
        return success
    
    def logout(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse(self.html)
        #click on settings icon
        driver.find_element_by_class_name ('settings').click()
        self.click_on_setting ('sign out')
        time.sleep(5)

    def is_element_present(self,how, what):
        driver = self.driver
        try: driver.find_element(by=how, value=what)
        except NoSuchElementException, e: return False
        return True
   
