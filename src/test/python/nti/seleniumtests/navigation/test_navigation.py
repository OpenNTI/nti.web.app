import os
import unittest

from nti.seleniumtests.navigation.navigation import WebAppNavigation

from nti.seleniumtests.matchers import is_in_tree

from hamcrest import assert_that

__path__ = os.path.split(__file__)[0]

BOOKS = ('Prealgebra', 'MathCounts', 'MathCounts 2012')
#random chapters
#CHAPTERS = (('Exponents'), ('Number Theory'), ('Decimals'))
CHAPTERS = ['Exponents','Number Theory','Decimals']
#random sections
SECTIONS = ['Index', 'Squares', 'Higher Exponents']

class TestNavigation(WebAppNavigation):
	
	ini_file = os.path.join(__path__, '../config/main.ini')

#	def test_open_library(self):
#		self.open_library()		
#		#TO-DO: Optimize this
#		for book in BOOKS: 
#			assert_that (book, is_in_tree ('div'))
					
	def test_open_book(self):
		values = self.open_book ()
		print values
		#TO_DO: Optimize this 
		assert_that(CHAPTERS, list ((set(values) & set (CHAPTERS))))
		
		#Info: the code below is a better option but chapter names are buried to deep in the div to be recognizable by the lxml
		#the same applies to open_chapter and open_section
		#for chapter in CHAPTERS:
		#   assert_that (chapter, is_in_tree('div'))
				
#	def test_open_chapter (self):  
#		values = self.open_chapter()
#		
#		#TO-DO: Optimize this
#		assert_that(SECTIONS, list ((set(values) & set (CHAPTERS))))
#		#for section in SECTIONS: 
#		#   assert_that (section,is_in_tree( 'div', self.resp, 'class'))
#			
#	def test_open_section(self):
#		self.open_section()
#		value = self.get_section_chapter_title()
#		assert_that(value, text = 'Squares')
#		
if __name__ == "__main__":
	unittest.main()