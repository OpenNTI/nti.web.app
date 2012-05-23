from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException
#import find_elements
import html5lib
import lxml.etree
from html5lib import treewalkers, serializer, treebuilders
import unittest, time, re
#This is the controller because it initializes a view and fetch IDs and xpath from the model.
#Or should I call it 
class Sender():
    def setUp(self):
        #initialize the view
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost:8081/NewSkin/"
        #self.base_url = 'http://excelsior.nextthought.com/'
        driver = self.driver
        self.driver.get(self.base_url)
        self.verificationErrors = []
        time.sleep(5)
        self.html = self.driver.page_source
        self.p = html5lib.HTMLParser( tree=treebuilders.getTreeBuilder("lxml"), namespaceHTMLElements=False )
        self.doc = self.p.parse( self.html )

    #Simple Login and Logout
    #-----------------------
    
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
        
        
        #Navigation
        #==========

        
    def change_mode (self,index):
        driver = self.driver
        success = True 
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        if index.strip() == 'reader':
            driver.find_element_by_class_name("library").click()
        elif index.strip() == 'classroom':
            driver.find_element_by_class_name("classroom").click()
        elif index.strip() == 'search':
            driver.find_element_by_class_name("search").click()
        elif index.strip() == 'home':
            driver.find_element_by_class_name("home").click()
        else:
            success = False

        return success

    
    def find_book (self, bookName):
        driver = self.driver
        book_id = 0 
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        for node in self.doc.iter("img"):
            if node.get ('title') == bookName:
                book_id = node.get('id')
                break
        return book_id
        

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



        #Content Locators and Actions
        #----------------------------

        
    def find_frame_name(self):
        driver = self.driver
        eltname = ' '
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        for node in self.doc.iter ("iframe"):
            eltname = node.get ('name')
        return eltname
    
    def switch_frame(self):
        driver = self.driver
        driver.switch_to_frame(self.find_frame_name())
        

    def select_text_area (self,start, end, index):
        driver = self.driver
        #make sure you are in right frame
        if (driver.execute_script ('return document.title') !=''):
            self.switch_frame()
        script = 'function selectElementContents (el,start, end) {var sel = window.getSelection(); var range = window.document.createRange();  range.setStart(el,start); range.setEnd(el,end); sel.removeAllRanges(); sel.addRange(range);} selectElementContents(window.document.getElementsByTagName ("p")' + '[' + str(index) + '].firstChild,' + str(start) + ',' + str(end) + ')'
        
        driver.execute_script (script)


    def choose_text_menu_item(self, action):
        driver = self.driver
        #make sure you are in the default  content window
        driver.switch_to_default_content()
        if action == 'note':
            driver.find_element_by_link_text ('Add a Note').click()
        elif action == 'highlight':
            driver.find_element_by_link_text ('Save Highlight').click()
        elif action == 'share':
            driver.find_element_by_link_text ('Share With').click()
        elif action == 'remove highlight':
            driver.find_element_by_link_text ('Remove Highlight').click()
        elif action == 'remove note':
            driver.find_element_by_link_text ('Remove Note').click()
        else:
            return False

        return True


    def click_on_selected_text (self,index):
        driver = self.driver
        driver.find_elements_by_tag_name('p')[index].click()

    def find_created_content_items (self, name):
        items = []
        name2 = str('action ' + name)
        
        driver = self.driver
        self.doc = self.p.parse (driver.page_source)
        for node in self.doc.iter('img'):
            if re.search (str('action ' + name), str(node.get ('class'))):
                items.append (node)

        return items

    def click_on_content_item (self, item_id):
        driver = self.driver
        driver.switch_to_default_content()
        driver.find_element_by_id(item_id).click()


    def create_highlight (self):
        var = self.index_of_text()
        result = self.select_text_area (0, var[1], var[0])
        self.click_on_selected_text (var[0])
        self.choose_text_menu_item('highlight')
        

    def delete_item (self,index, type):
        driver = self.driver
        items = self.find_created_content_items(type)
        self.click_on_content_item(items[index].get('id'))
        self.choose_text_menu_item ('remove ' + type)
        

    def delete_items (self,type):
        driver = self.driver
        items = self.find_created_content_items(type)
        
        for index in range (len(items)):
            self.click_on_content_item (items[index].get ('id'))
            self.choose_text_menu_item ('remove ' + type)
            time.sleep(3)


    def index_of_text(self):
        #Find the next non-empty paragraph
        var = ()
        driver = self.driver
        i = 0
        size = 0
        index = 0
        if (driver.execute_script ('return document.title') != ''):
            self.switch_frame()
            
        self.doc = self.p.parse (driver.page_source)
        for node in self.doc.iter ('p'):
            if node.text and not (node.get ('id')):
                size = len(node.text)
                index = i
                break
            i = i+1

        var = (index, size) 
        return var


    #Books Locators and Actions
    #--------------------------
    def find_list_of_books(self):
        driver = self.driver
        books = {}
        self.doc = self.p.parse (driver.page_source)
        library = self.return_lxml_element_by_class_name ('library-menu')
        i = 0
        for node in library.iter ('div'):
            if node is not None and node.get('class') == 'title':
               books [node.text] = i
               i = i+1
        return books

    def return_lxml_element_by_class_name (self,name):
        elt = None
        driver = self.driver
        self.doc = self.p.parse (driver.page_source)
        for node in self.doc.iter('div'):
            if node.get ('class') is not None and re.search (name.strip(), node.get ('class')):
                elt = node
        return elt

    def find_list_of_chapters(self):
        driver = self.driver
        chapters_dict = {}
        i = 0
        chapters = driver.find_elements_by_class_name ('x-grid-row')
        for node in chapters:
            if node.text is None:
                break
            elif node.text.strip() != '':
                chapters_dict[node.text] = i
                i = i+1

        return chapters_dict

    def find_list_of_sections(self):
        driver= self.driver
        #first check if there is an expanded chapter
        sections_dict = {}
        i = 0
        sections = driver.find_elements_by_class_name('x-grid-tree-node-leaf')
        for node in sections:
            if node.text is None:
                break
            elif node.text.strip() != '':
                sections_dict[node.text] = i
                i = i+1
        return sections_dict

    def open_book (self, bookName):
        driver = self.driver
        success = True
        books =  self.find_list_of_books()
        if books and (bookName.strip() in books.keys()):
            driver.find_elements_by_class_name('title')[books[bookName.strip()]].click()
        else:
            success = False

        return success

    def open_chapter(self,chapterName): 
        driver = self.driver
        success = False
        self.doc = self.p.parse (driver.page_source)
        if self.doc.find ("//tr[@class='x-grid-row  x-grid-tree-node-expanded']") is None:
            chapters =  self.find_list_of_chapters()
            if chapters and (chapterName.strip() in chapters.keys()):
                driver.find_elements_by_class_name('x-grid-row')[chapters[chapterName.strip()]].click()
                success = True

        return success


    def open_section(self, sectionName):
        driver = self.driver
        success = False
        self.doc = self.p.parse (driver.page_source)
        if self.doc.find("//tr[@class='x-grid-row  x-grid-tree-node-leaf']"):
            sections = self.find_list_of_sections()
            if sections and (sectionName.strip() in sections.keys()):
               driver.find_elements_by_class_name('x-grid-tree-node-leaf')[sections[sectionName.strip()]].click()
               success = True

        #Make sure the menu is hidden by clicking on the reader icon
               driver.change_mode ('reader')
        return success

    def close_chapter(self,chapterName):
        driver = self.driver
        success = False
        self.doc = self.p.parse (driver.page_source)
        if self.doc.find("//tr[@class='x-grid-row  x-grid-tree-node-leaf']") is not None:
            chapters =  self.find_list_of_chapters()
            if chapters and (chapterName.strip() in chapters.keys()):
               driver.find_elements_by_class_name('x-grid-tree-node-leaf')[chapters[chapterName.strip()]].click()
               success = True

        return success
    
    def is_element_present(self,how, what):
        driver = self.driver
        try: driver.find_element(by=how, value=what)
        except NoSuchElementException, e: return False
        return True
   


    

    
