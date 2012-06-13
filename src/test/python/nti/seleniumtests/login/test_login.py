import os
import unittest

from nti.seleniumtests.base import  WebAppTestBase
from nti.seleniumtests import wait_for_element

from nti.seleniumtests.matchers import is_in_tree
from hamcrest import assert_that

__path__ = os.path.split(__file__)[0]

class TestLogin(WebAppTestBase):
    
    ini_file = os.path.join(__path__, '../config/main.ini')
    
    def test_login_with(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
        

    def test_login_with1(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
        
        
    def test_login_with2(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))


    def test_login_with3(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with4(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with5(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with6(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
        

    def test_login_with7(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
        
        
    def test_login_with8(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))


    def test_login_with9(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with10(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with11(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
        
        
        
        
        
   
    def test_login_witha(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
        

    def test_login_with1a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
        
        
    def test_login_with2a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))


    def test_login_with3a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with4a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with5a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with6a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
        

    def test_login_with7a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
        
        
    def test_login_with8a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))


    def test_login_with9a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with10a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))



    def test_login_with11a(self):
        self.login()
        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought App') 
        assert_that('NextThought App', is_in_tree('title', driver = self.driver))
   
    
#    def test_failed_user_login(self):
#        try:
#            self.login('incorrect_user', 'incorrect_password')
#            self.fail("it should not have login")
#        except:
#            pass
#        finally:
#            #wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought Login')
#            assert_that('NextThought Login', is_in_tree('title',driver = self.driver))
##        
#    def test_failed_password_login_with_click(self):
#        self.login(password='incorrect_password', boolean = False)
#        wait_for_element(driver = self.driver, tag = 'title', text = 'NextThought Login')
#        assert_that('NextThought Login', is_in_tree('title', driver = self.driver))
#        wait_for_element(driver = self.driver, tag = 'div', attribute = 'id', attribute_value = 'message')
#        assert_that('Please try again, there was a problem logging in.', is_in_tree('div', driver = self.driver))
        
#    def test_logout(self):
#        self.login()
#        assert_that('NextThought App', is_in_tree('title'))
#        self.logout()
#        assert_that('NextThought Login', is_in_tree('title'))
#    
if __name__ == "__main__":
    unittest.main()