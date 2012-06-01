import os
import unittest

from nti.seleniumtests.base import  WebAppTestBase

from nti.seleniumtests import as_the_text_of
from nti.seleniumtests import as_the_value_of
from nti.seleniumtests.isintree import is_in_tree
from hamcrest import assert_that

__path__ = os.path.split(__file__)[0]

class TestLogin(WebAppTestBase):
    
    ini_file = os.path.join(__path__, '../config/main.ini')
    def test_login(self):
        self.login()
        assert_that('NextThought App', is_in_tree(as_the_text_of('title', self.resp)))
    
    def test_failed_user_login(self):
        self.login('incorrect_user', 'incorrect_password')
        assert_that('NextThought Login', is_in_tree(as_the_text_of('title', self.resp)))
        
    def test_failed_password_login(self):
        self.login(password='incorrect_password')
        assert_that('NextThought Login', is_in_tree(as_the_text_of('title', self.resp)))
        assert_that('message', is_in_tree(as_the_value_of('id', 'div', self.resp)))
        assert_that('message', is_in_tree(as_the_value_of('class', 'div', self.resp)))
        assert_that('Please try again, there was a problem logging in.', is_in_tree(as_the_text_of('div', self.resp)))
    
#    def test_logout(self):pass
#        self.login()
    
if __name__ == "__main__":
    unittest.main()