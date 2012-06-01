import os

from base import WebAppTestBase





#finder methods 

import html5lib
from   html5lib import treewalkers, serializer, treebuilders
import lxml.etree 

#----------------------------------------------------
    
def library_mode(resp, tag='span', attribute='class', attribute_value='home'):
    click_button (resp, tag,  attribute, attribute_value)

def search_mode(resp, tag='span', attribute='class', attribute_value='search'):
    click_button(resp, tag, attribute, attribute_value)
    
def click_button(resp, tag=None, attribute=None):
    resp.doc.button (tag, attribute=attribute).wait_and_click()

__path__ = os.path.split(__file__)[0]

#-----------------------------------------------------
class Navigation(WebAppTestBase): 
    
    ini_file = os.path.join(__path__, 'config.ini')
     
    def setUp(self):
        super(Navigation, self).setUp()
        self.credentials = self.users[0]
        self.login(self.credentials[0], self.crendentials[1])
        #change_mode(self.resp, 'library')
        
        
    def __init__(self):
        self.parser_config = SafeConfigParser()
        self.parser_config.read ('config.ini')
        self.url = parser.get ('data', 'url')
        #self.usernmane = parser.get ('data', 'username')
        #self.password = parser.get('data', 'password')
        self.parser_info = SafeConfigParser()
        self.parser_info.read('information.ini')
        self.action = actions.Action(self.url) 
        self.item   = items.Item(action.driver)
    def open_library(self):
        classname = self.parser_info.get('navigation information','library_class')
        self.action.click_element_by_class_name(className)
    
    def open_search(self):
        classname = self.parser_info.get('navigation information','search_class')
        self.action.click_element_by_class_name(className)
        
    def open_classroom(self):
        classname = self.parser_info.get('navigation information','classroom_class')
        self.action.click_element_by_class_name(className)
        
    
    def find_list_of_books(self):
        #Books that should be present
        books = self.parser_config.get ('data','books')
        books_list = books.split(',')        
        #Now find if these are being displayed 
        #Unload the needed information to return the text element
        tag = self.parser_info.get ('navigation information', 'books_tag')
        attribute = self.parser_info.get ('navigation information', 'book_attribute')    
        attributeValue = self.parser_info.get ('navigation information', 'book_attributeValue')     
        books_returned = self.item.dict_of_items(tag, attribute, attributeValue)
        success = True
        for book in books_list(): 
            if book not in books_returned.keys():
                print book + 'is not displayed'
                success = False
                
        return success
        
    def find_search_box(self):
        
        # Unload information
        tag = self.parser_info.get('navigation information', 'search_tag')
        attribute = self.parser_info.get ('navigation information', 'search_attribute')
        attributeValue = self.parser_info.get ('navigation information', 'search_attributeValue')
        
        #Find if the search box is displayed
        success = find_item (tag,attribute, attributeValue)
        

    
        