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

    def find_login_form(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse(self.html)
        for node in self.doc.iter("form"):
            if (node.get('id') == 'login'):
                return True
                break

        return False

    def find_setting(self, name):
        driver = self.driver
        id = ''  
        self.doc = self.p.parse(driver.page_source)
        for node in self.doc.iter('div'):
            if node.text is not None and node.text.lower() == name.strip():
                id = node.get ('id')

        return id


    def click_on_setting (self, driver, name):
        driver = self.driver
        success = True
        driver.find_element_by_id (self.find_setting(name.strip())).click()
        
        return success
    

    def click_url(self,text, url):
        driver = self.driver
        driver.get(url)
        driver.find_element_by_link_text(text).click()
        time.sleep(5)

    def find_title(self):
        driver = self.driver
        return driver.title


    def find_name(self):
        driver = self.driver
        time.sleep(3) 
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        self.name = ''
        for node in self.doc.iter("span"):
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
        
        
    def find_logins(self,type):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse(self.html)
        dict = {}
        for node in self.doc.iter("button"):
            if node.get('class') == 'logon facebook' or node.get('class') == 'logon google':
                dict [node.get('class').split()[1]] = node.get('class')

        return dict.has_key(type)

    def logout(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse(self.html)
        #click on settings icon
        driver.find_element_by_class_name ('settings').click()
        self.click_on_setting ('sign out')
        time.sleep(5)
        
        
        #Navigation
        #==========
        
    def change_mode (self,index):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        if index == 'reader':
            driver.find_element_by_class_name("reader-mode-icon").click()
        elif index == 'stream':
            driver.find_element_by_class_name("stream-mode-icon").click()
        elif index == 'groups':
            driver.find_element_by_class_name("groups-mode-icon").click()
        elif index == 'classroom':
            driver.find_element_by_class_name("classroom-mode-icon").click()

    
    
    
    def find_book (self, bookName):
        driver = self.driver
        id = 0 
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        for node in self.doc.iter("span"):
            if node.text == bookName:
                id = node.get('id')
                break
        return id
        

         # Group Locators and Actions
         # ==========================

    
    def create_group(self,groupName, members):
        driver = self.driver
        time.sleep(4)
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        driver.find_element_by_class_name("groups-mode-icon").click()
        time.sleep(5)
        try:
            driver.find_element_by_class_name("create-button").click()
        except IndexError:
            print ('element not found')

        print 'here after finding button'
        time.sleep(4)
        driver.find_element_by_id(self.find_add_group_items(driver,0)).send_keys(groupName)
        userfield = self.find_add_group_items(driver,1)

        for member in members:
            driver.find_element_by_id(userfield).send_keys(member)
            time.sleep(6)
            driver.find_element_by_id(userfield).send_keys(Keys.ARROW_DOWN)
            time.sleep(4)
            driver.find_element_by_id(userfield).send_keys(Keys.RETURN)
            time.sleep(3)
        driver.find_element_by_xpath("//div[2]/div/div[2]/em/button").click()  #save button


    def delete_group(self,groupName):
        driver = self.driver
        time.sleep(4)
        driver.find_element_by_id(self.find_group(driver,groupName)).click()
        driver.find_element_by_class_name('delete-button').click()
        time.sleep(3)


    def find_add_group_items(self,index):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        ids = ['textfield', 'usersearchinput', 'searchBox']

        for node in self.doc.iter("input"):
            id = node.getparent().get('id')
            if (id.startswith(ids[index])):
               el_id = node.get('id')
               break
            else:
                el_id = 0
        return el_id

    def find_errortips(self,text):
        driver = self.driver
        time.sleep(2)
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        for node in self.doc.iter("li"):
            if node.text == text:
                return True
                break
        return False

    def find_group(self, name):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        for node in self.doc.iter("span"):
            if node.text == name:
                parent = node.getparent()
                id = parent.attrib.get('id')
                break
            else:
                id = 0
        return id



     # Chat Locators and Actions
     # =========================

    def open_chat_window(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse(self.html) 
        driver.find_element_by_class_name('chat').click()

    def find_chat_window(self):
        driver = self.driver
        return driver.find_element_by_class_name ('chat-window').is_displayed()


    def find_tab_name(self,username):
        driver = self.driver
        self.html = driver.page_source
        self.doc  = self.p.parse(self.html)
        for x in self.doc.iter('span'):
            if x.text == username:
                return True
                break
        return False

    def find_text_field(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        for node in self.doc.iter("input"):
            if node.get('class') == 'x-form-field x-form-text':
                elt = node.getparent().get('id')
                if (elt.startswith ("textfield")):
                    return node.get('id')
                    break
        return 0
   
    def start_chat(self,receiver):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        if (self.find_chat_window(driver) == False):
            driver.find_element_by_class_name('chat').click()
        #Start a chat with a friend who is online
        driver.find_element_by_id(self.find_online_friend(driver,receiver.rsplit().pop(0))).click()
       
    def find_online_friend (self,username):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        id = 0
        for node in self.doc.iter("img"):
            if node.get('title') == username:
                if (node.getparent().get('class') == 'avatar online'):
                    id = node.get('id')
                    break
        return id

    def chat(self, list):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        time.sleep(2)
        field_id = self.find_text_field(driver)
        for log in list: 
            driver.find_element_by_id(field_id).send_keys(log)
            driver.find_element_by_class_name('reply-to-button').click()

    def find_chat_logs (self, username):
        driver = self.driver
        time.sleep(4)
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        list_logs = [] 
        for node in self.doc.iter("span"):
            if node.get ('class') == 'name' and node.text == username:
                list_logs.append (node.getnext().text)

        return list_logs

    def end_chats(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        element = driver.find_elements_by_class_name("x-tab-close-btn")
        for x in element:
            x.click()
        
    def close_chat_window(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        element = driver.find_element_by_class_name('x-tool-close')
        element.click()

        #Content Locator and Actions
        #---------------------------

    def switch_frame(self):
        driver = self.driver
        driver.switch_to_frame(self.find_frame_name())

    def find_frame_name(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        for node in self.doc.iter ("iframe"):
            eltname = node.get ('name')
        return eltname
    
    def is_element_present(self,how, what):
        driver = self.driver
        try: driver.find_element(by=how, value=what)
        except NoSuchElementException, e: return False
        return True
   


    
