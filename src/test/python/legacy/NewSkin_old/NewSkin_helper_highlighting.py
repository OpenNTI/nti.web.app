from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
import html5lib
from html5lib import treewalkers, serializer, treebuilders
import lxml.etree
import time, re, unittest
import NewSkin_helper_navigation

class Module(NewSkin_helper_navigation.Module):

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
