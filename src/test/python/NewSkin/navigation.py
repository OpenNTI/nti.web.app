import actions
import items
from ConfigParser import SafeConfigParser

class Navigation(): 

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
        

    
        