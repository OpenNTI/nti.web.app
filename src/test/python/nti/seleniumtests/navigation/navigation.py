from nti.seleniumtests.base import WebAppTestBase
from nti.seleniumtests import click_on_element_by_xpath
import time

LIBRARY_CLASS = "//span[contains(@class, 'x-btn-icon library')]/.."
BOOK_CLASS = "//div[contains (@class, 'title') and text () ='"
CHAPTER_CLASS = "//div[contains (@class, 'x-grid-row') and text() ='"
SECTION_CLASS = "//div[contains (@class, 'x-grid-row  x-grid-tree-node-leaf') and text () = '"

class WebAppNavigation (WebAppTestBase):
     
    
    def setUp(self):
        super (WebAppNavigation, self).setUp()
        self.login()
        
    def open_library (self):
        click_on_element_by_xpath (self.resp,LIBRARY_CLASS)
        #self.resp.doc.xpath ("//span[contains(@class, 'x-btn-icon library')]/..").click()
    
    
    def open_book(self,title = 'Prealgebra'):
        xpath = BOOK_CLASS + title + "']/.."
        click_on_element_by_xpath (self.resp,xpath)
        #self.resp.doc.xpath ("//div[contains (@class, 'title') and text () ='" + title + "']/..").click()
        
    def open_chapter (self, title = 'Exponents'):
        xpath = CHAPTER_CLASS + title + "']/.."
        click_on_element_by_xpath (self.resp,xpath)
        #self.resp.doc.xpath ("//div[contains (@class, 'x-grid-row') and text() ='" + title + "']/..").click() 
      
    def open_section (self, title = 'Squares'):
        xpath = SECTION_CLASS + title + "']/.."
        click_on_element_by_xpath (self.resp, xpath)
        #self.resp.doc.xpath ("//div[contains (@class, 'x-grid-row  x-grid-tree-node-leaf') and text () = '" + title + "']/..").click()

        
    def tearDown (self):
        self.app.close()
        