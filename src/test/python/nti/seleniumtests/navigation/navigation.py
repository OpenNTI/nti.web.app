from sst.actions import get_element
from sst.actions import get_elements
from sst.actions import switch_to_frame
from sst.actions import click_element
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
		self.sections = []	  # list of sections
		
	def open_library (self):
		print 'in library'
		wait_for_element_xpath ('//span[contains (@class, "library")]/..')
		element = get_element(css_class='library', tag='span')
		click_element (element)
		wait_for_element_xpath ('//div[contains (@class, "title")]/..')
		self.books = get_elements(css_class = 'title', tag= 'div')
		values  = [element.text for element in self.books if element.text]	
		print values 
		return values
	
	def open_book(self, title='Prealgebra'):
		print 'in book'
		self.open_library()
		#Find a better way to handle opening a book
		wait_for_element_xpath ('//div[contains (@class, "title")]/..')
		element = get_element(css_class='title', tag='div', text= self.books[0].text)
		click_element(element)
		wait_for_element_xpath ('//div[contains (@class, "x-grid-row")]/..')
		self.chapters = get_elements(css_class = 'x-grid-row', tag= 'tr')
		values  = [element.text for element in self.chapters if element.text]		
		print values
		return values
			
	def open_chapter (self, title='Exponents'):
		print 'in chapter'
		self.open_book()
		wait_for_element_xpath ('//div[contains (@class, "x-grid-row")]/..')
		element = get_element (css_class='x-grid-row', tag='tr', text=title)
		click_element (element)
		wait_for_element_xpath ('//div[contains (@class, "x-grid-cell-treecolumn")]/..')
		self.sections = get_elements (css_class='x-grid-cell-treecolumn', tag='td')
		
		values  = [element.text for element in self.sections if element.text]	
		print values
		return values
	
	def open_section (self, title='Squares'):
		print ('Searching for section')
		#print self.sections[4].text
		self.open_chapter()
		time.sleep(5)
		#wait_for_element_xpath ('//div[contains (@class. "x-grid-cell-treecolumn")]/..')
		#element = get_element (css_class='x-grid-cell-treecolumn', tag='td', text=title)
		#element = self.sections[4]
		#print element.text
		#click_element(element)
	
	def get_page_section_title (self, frameName='component-1036'):
		wait_for_element_id (frameName)
		switch_to_frame (frameName)
		element_chapter = get_element (css_class ='chapter title')
		return element_chapter.find_element_by_class_name ('label').text
		
	def tearDown (self):
		super(WebAppNavigation, self).tearDown()
		