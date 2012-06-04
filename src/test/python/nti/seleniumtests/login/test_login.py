import os
import unittest

from nti.seleniumtests.base import  WebAppTestBase

from nti.seleniumtests.matchers import is_in_tree
from hamcrest import assert_that

__path__ = os.path.split(__file__)[0]

class TestLogin(WebAppTestBase):
	
	ini_file = os.path.join(__path__, '../config/main.ini')
	
	def test_login(self):
		self.login()
		assert_that('NextThought App', is_in_tree('title', self.resp))
	
	def test_failed_user_login(self):
		self.login('incorrect_user', 'incorrect_password')
		assert_that('NextThought Login', is_in_tree('title', self.resp))
		
	def test_failed_password_login(self):
		self.login(password='incorrect_password')
		assert_that('NextThought Login', is_in_tree('title', self.resp))
		assert_that('message', is_in_tree('div', self.resp, 'id'))
		assert_that('message', is_in_tree('div', self.resp, 'class'))
		assert_that('Please try again, there was a problem logging in.', is_in_tree('div', self.resp))
		
#	def test_logout(self):
#		self.login()
#		self.logout()
	
if __name__ == "__main__":
	unittest.main()