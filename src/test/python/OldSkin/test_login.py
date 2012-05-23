import module
import find_elements
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
import unittest

class Test_page(unittest.TestCase):
    def setUp(self):
        print 'setUp'
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        #self.base_url = "http://localhost:8081/NextThoughtWebApp/"
        self.base_url = "http://excelsior.nextthought.com/"
        self.driver.get(self.base_url)
        self.verificationErrors = []
        self.module = module.Module()
        self.module.setUp(self.driver)

    def test_facebook_google_login(self):
        self.module.enter_username('pacifique.mahoro')
        self.assertTrue(self.module.find_logins('google'))
        self.assertTrue(self.module.find_logins('facebook'))
        

    def test_login_with_invalid_credentials(self):
        print 'login_with_invalid_credentials'
        self.module.login('pacifique.mahoro', 'pacifique.maho')
        self.assertTrue(self.module.find_error_message () == 'Please try again, there was a problem logging in.')
       
    def test_URLS(self):
        print 'test_URLS'
        self.module.click_url("About",self.base_url)
        self.assertEqual(self.module.find_title(), 'NextThought LLC')
        
        self.module.click_url("Release Notes",self.base_url)
        self.assertEqual(self.module.find_title(), 'Alpha Release Notes')
        
        self.module.click_url("Terms",self.base_url)
        self.assertEqual(self.module.find_title(), 'Terms')
      
        self.module.click_url("Privacy",self.base_url)
        self.assertEqual(self.module.find_title(), 'Privacy Policy')
     
    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

   

class Test_login(Test_page): 
   def test_login(self):
        print 'test_login'
        self.module.login('pacifique.mahoro', 'pacifique.mahoro')
        name = 'Pacifique Mahoro'
        self.assertEqual(self.module.find_name(), name)
        
class Test_login_logout(Test_login):
    def test_login_logout(self):
        print 'test_login_logout'
        if self.module.find_name() == '':
            self.module.login('pacifique.mahoro', 'pacifique.mahoro')
        self.module.logout()
        self.assertTrue(self.module.find_login_form())
       

def suite():
    suite = unittest.TestSuite()
    
    suite.addTest(Test_page('test_facebook_google_login'))
    suite.addTest(Test_page('test_URLS'))
    suite.addTest(Test_page('test_login_with_invalid_credentials'))
    suite.addTest(Test_login('test_login'))
    suite.addTest(Test_login_logout('test_login_logout'))
  
    return suite
       
if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    test_suite = suite()
    runner.run(test_suite)
    
