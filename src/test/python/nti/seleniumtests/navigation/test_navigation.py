import os
import unittest

from nti.seleniumtests.navigation.navigation import WebAppNavigation
from nti.seleniumtests.matchers import is_in_tree
from nti.seleniumtests.matchers import is_list_in_tree
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
	def test_open_library(self):
		print 'test open library'
		books = self.open_library()	 
		
#		TO-DO: Optimize this
		print 'here'
#		
		if not books: 
			print 'Library is empty'
					
	def test_open_book(self):
		print 'test open book'
		self.open_library()
		chapters = self.open_book ('Prealgebra')
		
#		TO_DO: Optimize this 
		

		if not chapters: 
			print 'Book has no chapter'
						
	def test_open_chapter (self): 
		print 'test open chapter'
		self.open_library()
		self.open_book('Prealgebra')
		sections = self.open_chapter('Decimals')
	
	
		#TO-DO: Optimize this
		if not sections: 
			print 'Chapter has no sections'
#			
	def test_open_section(self):
		
		print 'test open section'
		self.open_library()
		self.open_book('Prealgebra')
		self.open_chapter('Decimals')
		self.open_section(section = 'Rounding')
		value =  self.get_page_section_title()
		if value != 'Rounding': 
			print 'the section was not successfully opened'

	def test_pager_move(self):
		print 'test pager'
		self.navigate_to('Prealgebra', 'Decimals', 'Rounding')
		self.pager_move()
		value = self.get_page_section_title ()
		if value != 'Decimals and Fractions': 
			print 'The page did not move to the contents of the next section'
			

# TO-DO: take care of jumper
#	def test_menu_jumper_chapters(self):
#		print 'test menu jumper'
#		self.navigate_to('Prealgebra', 'Decimals', 'Rounding')
#		self.menu_jumper ('Percents')
#		
		
	def test_open_search(self):
		value = self.open_search() 
		if not value: 
			print 'Search box not found'
	
	
if __name__ == "__main__":
	unittest.main()