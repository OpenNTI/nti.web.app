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
#
#	def test_open_library(self):
#		books = self.open_library()		
#		#TO-DO: Optimize this
#		if not books: 
#			print 'Library is empty'
#					
#	def test_open_book(self):
#		chapters = self.open_book ()
#		#TO_DO: Optimize this 
#		if not chapters: 
#			print 'Book has no chapter'
#						
#	def test_open_chapter (self): 
#		sections = self.open_chapter()
#		#TO-DO: Optimize this
#		if not sections: 
#			print 'Chapter has no sections'
			
	def test_open_section(self):
		self.navigate_to(book='Prealgebra', chapter='Decimals', section='Rounding')
		value = self.get_page_section_title()
		assert_that(value, text = 'Rounding')
		
if __name__ == "__main__":
	unittest.main()