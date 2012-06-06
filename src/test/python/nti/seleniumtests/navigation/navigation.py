from nti.seleniumtests.base import WebAppTestBase
import time
from sst.actions import *


LIBRARY_CLASS = "//span[contains(@class, 'x-btn-icon library')]/.."
BOOK_CLASS = "//div[contains (@class, 'title') and text () ='"
CHAPTER_CLASS = "//div[contains (@class, 'x-grid-row') and text() ='"
SECTION_CLASS = "//div[contains (@class, 'x-grid-row  x-grid-tree-node-leaf') and text () = '"

class WebAppNavigation (WebAppTestBase):
     
    
    def setUp(self):
        super (WebAppNavigation, self).setUp()
        self.login()
        
    def open_library (self):
        element = get_element (css_class = 'library', tag = 'span')
        element.click()
    
    def open_book(self,title = 'Prealgebra'):
        self.open_library()
        element = get_element (css_class = 'title', tag = 'div', text = 'Prealgebra')
        element.click()
        elements = get_elements (css_class = 'x-grid-row', tag= 'tr')
        values  = []
        for element in elements:
            if element.text:  
                values.append (element.text)
        
        return values
            
        
        
        
        
    def open_chapter (self, title = 'Exponents'):
        self.open_book()
        element = get_element (css_class = 'x-grid-row', tag = 'tr', text = title)
        element.click()
        elements = get_elements (css_class = 'x-grid-tree-node-leaf', tag= 'tr')
        values  = []
        for element in elements:
            if element.text:  
                values.append (element.text)
        
        return values
    
        
      
    def open_section (self, title = 'Squares'):
        self.open_chapter()
        element = get_element (css_class = 'x-grid-row', tag = 'div', text = title)
        element.click()
    
    def get_page_section_title (self, frameName = 'component-1036'):
        switch_to_frame (frameName)
        element_chapter = get_element (css_class ='chapter title')
        
        return element_chapter.find_element_by_class_name ('label')
    

        
    def tearDown (self):
        super(WebAppNavigation, self).tearDown()
        