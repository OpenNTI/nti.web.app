import os
import unittest

from nti.seleniumtests.base import WebAppTestBase

from hamcrest import assert_that, is_

__path__ = os.path.split(__file__)[0]

class TestLogin(WebAppTestBase):
    
    ini_file = os.path.join(__path__, '../config/main.ini')
    
    def test_login(self):
        self.login()
        assert_that(self.has_element_with_text('title', 'NextThought App'), is_(True))
    
    def test_failed_user_login(self):
        self.login('incorrect_user', 'incorrect_password')
        assert_that(self.has_element_with_text('title', 'NextThought Login'), is_(True))
        
    def test_failed_password_login(self):
        self.login(password='incorrect_password')
        assert_that(self.has_element_with_text('title', 'NextThought Login'), is_(True))
        assert_that(self.has_element_with_attr_value('div', 'id', 'message'), is_(True))
        assert_that(self.has_element_with_attr_value('div', 'class', 'message'), is_(True))
        assert_that(self.has_element_with_text('div', 'Please try again, there was a problem logging in.'), is_(True))
    
#    def test_logout(self):pass
#        self.login()
    
if __name__ == "__main__":
    unittest.main()