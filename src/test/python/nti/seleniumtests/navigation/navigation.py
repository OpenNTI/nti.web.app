from nti.seleniumtests import wait_for_element
from nti.seleniumtests.base import WebAppTestBase
from nti.seleniumtests import wait_for_element_xpath
import time


class WebAppNavigation (WebAppTestBase):

    def setUp(self):
        super (WebAppNavigation, self).setUp()
        self.login()
        
        
    def tearDown (self):
        super(WebAppNavigation, self).tearDown()
        
    def open_level (self, tag = None, attribute = None, attribute_value = None, text_value = None, dicts = None):
    
        xpath = self.xpath_contains_builder(tag, attribute, attribute_value)
        if text_value is None: 
            
            wait_for_element (self.driver, tag = tag, attribute = attribute, attribute_value = attribute_value) 
            self.driver.find_element_by_xpath (xpath).click()
        
        elif text_value:
            
            if dicts and (text_value.strip() in dicts.keys()):
                self.driver.find_elements_by_class_name(attribute_value)[dicts[text_value.strip()]].click()
            


    def find_and_parse_elements(self, xpath):
        dicts = {}
        i = 0
        time.sleep(1)

        elements = self.driver.find_elements_by_xpath (xpath)
        for node in elements:
            if node.text.strip() != '':
                dicts[node.text.strip()] = i
                i = i+1

        return dicts
    
    def open_library (self):

        self.open_level (tag = 'span', attribute = 'class', attribute_value = 'library')
        wait_for_element(self.driver, tag = 'div', attribute = 'class', attribute_value = 'title')
        xpath = self.xpath_contains_builder ( tag = 'div', attribute = 'class', attribute_value = 'title')
        self.books = self.find_and_parse_elements (xpath)
      
        return self.books
    
   
    
    def open_book(self, book):
        
        self.open_level(tag = 'div', attribute = 'class', attribute_value = 'title', text_value = book, dicts = self.books)
        xpath = self.xpath_contains_builder ( tag = 'tr', attribute = 'class', attribute_value = 'x-grid-row')
        self.chapters = self.find_and_parse_elements(xpath)
       
        return self.chapters
    
    def open_chapter (self, chapter = None):
        self.open_level (tag = 'tr', attribute = 'class', attribute_value ='x-grid-row', text_value = chapter, dicts = self.chapters) 
        xpath = self.xpath_contains_builder(tag = 'tr', attribute = 'class', attribute_value ='x-grid-tree-node-leaf') 
        self.sections = self.find_and_parse_elements(xpath)
        
     
        return  self.sections

    
    def open_section (self, section = None):        
        self.open_level (tag = 'tr', attribute = 'class', attribute_value = 'x-grid-tree-node-leaf', text_value = section, dicts = self.sections)
        self.driver.find_element_by_class_name ('library').click()
        
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
        wait_for_element(driver = self.driver,tag = 'iframe',  attribute = 'id', attribute_value = frameName)
        self.driver.switch_to_frame(frameName)
        element_chapter = self.driver.find_element_by_class_name ('chapter')
        return element_chapter.find_element_by_class_name ('label').text

#__________________________________________________________________________
#SEARCH FUNCTIONS 
    def open_search(self):
        self.open_level(tag = 'span', attribute = 'class', attribute_value = 'search')
        xpath = self.xpath_contains_builder(tag = 'input', attribute = 'placeholder', attribute_value = 'Search')
        return self.driver.find_element_by_xpath (xpath)
        
    
#---------------------------------------------------------------------------
#PAGER 
    def pager_move(self):
        wait_for_element(driver = self.driver, tag = 'div', attribute = 'class', attribute_value = 'next')
        self.driver.find_element_by_class_name ('next').click()
        
        
    def menu_jumper (self, chapter = None, section = None):
        wait_for_element(driver = self.driver, tag = 'div', attribute = 'class', attribute_value = 'jumpto')
        xpath = self.xpath_contains_builder('div', 'class', 'jumpto')
        elt = self.driver.find_element_by_xpath(xpath)
        label_select_elt = elt.find_element_by_class_name('label')
        label_select_elt.click()
        time.sleep(3)
        #xpath = self.xpath_contains_and_text_builder(tag = 'div', attribute = 'class',value = 'x-component-jumpto-menuitem', text =  chapter)
        #wait for element here? 
        #chapter = elt.find_element_by_xpath(xpath).click()
        #if section is not None: 
        #    wait_for_element(driver = self.driver, tag = 'div', attribute = 'id', attribute_value = 'content-jumper')
        
        