from sst.actions import get_element
from sst.actions import get_elements
from sst.actions import switch_to_frame
from sst.actions import click_element
from sst.actions import get_elements_by_xpath
from nti.seleniumtests import wait_for_element_id
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
        self.books = [] 
        self.chapters = []    # list of chapter elements for the current book being navigated
        self.section_elements = []      # list of sections
        
    def open_library (self):
        wait_for_element_xpath (self.xpath_contains_builder('//span', 'class', 'library') + '/..')
        element = get_element(css_class='library', tag='span')
        click_element (element)
        wait_for_element_xpath ('//div[contains (@class, "title")]/..')
        self.books = get_elements(css_class = 'title', tag= 'div')
        self.library_values  = [element.text for element in self.books if element.text]
    
    def open_book(self, book):
        #Find a better way to handle opening a book
        wait_for_element_xpath ('//div[contains (@class, "title")]/..')
        element = get_element(css_class='title', tag='div', text=book)
        click_element(element)
        wait_for_element_xpath ('//div[contains (@class, "x-grid-row")]/..')
        self.chapter_elements = get_elements(css_class = 'x-grid-row', tag= 'tr')
        self.chapters  = [element.text for element in self.chapters if element.text]
            
    def open_chapter (self, chapter):
        wait_for_element_xpath ('//div[contains (@class, "x-grid-row")]/..')
        element = get_element (css_class='x-grid-row', tag='tr', text=chapter)
        click_element (element, wait=False)
        time.sleep(1)
        xpath = "//tr[contains (@class, 'x-grid-tree-node-leaf')]/*"
        self.section_elements = get_elements_by_xpath(xpath)
        self.sections  = [element.text for element in self.section_elements if element.text]
    
    def open_section (self, section):
        xpath = "//tr[contains (@class, 'x-grid-tree-node-leaf')]/*"
        self.section_elements = get_elements_by_xpath(xpath)
        for elem in self.section_elements:
            if elem.text == section:
                click_element (elem)
                time.sleep(3)
        #wait_for_element_xpath ('//div[contains (@class. "x-grid-cell-treecolumn")]/..')
        #element = get_element (css_class='x-grid-cell-treecolumn', tag='td', text=title)
        #element = self.sections[4]
        #print element.text
        #click_element(element)
    
    def navigate_to(self, book, chapter=None, section=None):
        
        if not book:
            return
        
        # for a book with no chapters or sections
        if not section and not chapter:
            pass
            
        # for a book with only chapters, no sections
        if chapter and not section:
            pass
        
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
        wait_for_element_id (frameName)
        switch_to_frame (frameName)
        element_chapter = get_element (css_class ='chapter title')
        return element_chapter.find_element_by_class_name ('label').text
        
    def tearDown (self):
        super(WebAppNavigation, self).tearDown()
        