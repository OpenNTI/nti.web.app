from sst.actions import get_element
from sst.actions import get_elements
from sst.actions import switch_to_frame
from sst.actions import click_element
from sst.actions import get_elements_by_xpath
from nti.seleniumtests import wait_for_element
from nti.seleniumtests import wait_for_element_xpath
import time

from nti.seleniumtests.base import WebAppTestBase

LIBRARY_CLASS = "//span[contains(@class, 'x-btn-icon library')]/.."
BOOK_CLASS = "//div[contains (@class, 'title') and text () ='"
CHAPTER_CLASS = "//div[contains (@class, 'x-grid-row') and text() ='"
SECTION_CLASS = "//div[contains (@class, 'x-grid-row  x-grid-tree-node-leaf') and text () = '"

class WebAppNavigation (WebAppTestBase):

    def setUp(self):
        super (WebAppNavigation, self).setUp()
        self.login()
        
    def open_level (self, tag = None, attribute = None, attribute_value = None, text_value = None):
        wait_for_element (css_class = attribute_value, tag = tag, text = text_value)
        element = get_element (css_class = attribute_value, tag = tag, text = text_value)
        click_element (element, wait=False)
    
    def open_library (self):
        self.open_level('span', 'class', 'library')
        library_elements = get_elements (css_class = 'title', tag = 'div')  
        return [element.text for element in library_elements if element.text]
    
    def open_book(self, book):
        self.open_level('div', 'class', 'title', book)
        wait_for_element_xpath (self.xpath_contains_builder('tr', 'class', 'x-grid-row') + '/..')
        book_elements = get_elements(css_class = 'x-grid-row', tag= 'tr')
        return [element.text for element in book_elements if element.text]
    
    def open_chapter (self, chapter):
        self.open_level ('tr', 'class', 'x-grid-row', chapter) 
        xpath = self.xpath_contains_builder('tr', 'class', 'x-grid-tree-node-leaf') + '/*'
        print 'getting'
        wait_for_element_xpath (xpath)
        self.chapter_elements = get_elements_by_xpath(xpath)
        return [element.text for element in self.chapter_elements if element.text]
    
    def open_section (self, section):
        
        self.open_level ('tr', 'class', 'x-grid-tree-node-leaf', section)
        self.open_library()
        
#        xpath = self.xpath_contains_builder('tr', 'class', 'x-grid-tree-node-leaf') + '/*' 
#        #chapter_elements = get_elements_by_xpath(xpath)
#        
#        for elem in self.chapter_elements:
#            if elem.text == section:
#        # find an xpath builder for expressions with more than contains...
#                wait_for_element_xpath(self.xpath_contains_and_text_builder ('tr', 'class', 'x-grid=tree-node-keaf', section) + '/..')
#                click_element(elem, wait = True)
#                break 
    
    def navigate_to(self, book, chapter=None, section=None):
        
        if not book:
            return
        
        # for a book with no chapters or sections
        if not section and not chapter:
            self.open_library()
            self.open_book(book)
            
        # for a book with only chapters, no sections
        if chapter and not section:
            self.open_library()
            self.open_book(book)
            self.open_chapter(chapter)
        
        # for a book with only sections, no chapters
        if section and not chapter:
            self.open_library()
            self.open_book(book)
            self.open_section(section)
        
        # for a book with sections and chapters
        if section and chapter:
            self.open_library()
            self.open_book(book)
            self.open_chapter(chapter)
            self.open_section(section)
    
    def get_page_section_title (self, frameName='component-1036'):
        wait_for_element(frameName)
        switch_to_frame (frameName)
        element_chapter = get_element (css_class ='chapter title')
        return element_chapter.find_element_by_class_name ('label').text
        
    def tearDown (self):
        super(WebAppNavigation, self).tearDown()
        