import os
import unittest
from nti.seleniumtests.navigation.navigation import WebAppNavigation

from nti.seleniumtests.base import  WebAppTestBase

from nti.seleniumtests import as_the_text_of
from nti.seleniumtests import as_the_value_of
from nti.seleniumtests.matchers import is_in_tree
from hamcrest import assert_that

__path__ = os.path.split(__file__)[0]

BOOKS = ('Prealgebra', 'MathCounts', 'MathCounts 2012')
#random chapters
CHAPTERS = ('Exponents', 'Number Theory', 'Decimals')
#random sections
SECTIONS = ('Index', 'Squares', 'Higher Exponents')

class TestNavigation(WebAppNavigation):
    
    ini_file = os.path.join(__path__, '../config/main.ini')
    
    
    def test_open_library(self):
        self.open_library()
        
        #TO-DO: Optimize this
        for book in BOOKS: 
            assert_that (book, is_in_tree (as_the_text_of('div', self.resp)))
        
    def test_open_book(self):
        self.open_library()
        self.open_book ()
        for chapter in CHAPTERS: 
            assert_that (chapter, is_in_tree(as_the_text_of ('div', self.resp)))
                
    def test_open_chapter (self):  
    
        self.open_library()
        self.open_book()
        self.open_chapter()
    
        for section in SECTIONS: 
            assert_that (section,is_in_tree(as_the_text_of ('div', self.resp)))
            
    def test_open_section(self):
        self.open_section()
    
        
        
if __name__ == "__main__":
    unittest.main()