import module
import find_elements
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
import test_login

class Test_groups(unittest.TestCase):

    
    def setUp(self):
        print 'setUp'
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        #self.base_url = "http://localhost:8081/NextThoughtWebApp/"
        self.base_url = "http://excelsior.nextthought.com"
        self.driver.get(self.base_url)
        self.verificationErrors = []
        self.module = module.Module()
        self.module.setUp(self.driver)
        self.module.login( 'pacifique.mahoro', 'pacifique.mahoro')
        self.module.change_mode('groups')
        self.groups = ['test1234', 'test12345', 'test12345']
        self.members = ['logan testi', 'suzie stewart']
    

    def test_create_group(self):
        print 'test create group'
        self.module.create_group(self.groups[0], self.members)
        self.assertTrue(self.module.find_group, self.groups[0])

    def test_create_and_delete_group(self):
        print 'test delete group'
        self.module.create_group(self.groups[1], self.members)
        self.module.delete_group (self.groups[1])
        self.assertTrue (self.module.find_group(self.groups[1]) == 0)

    """def test_create_multiple_groups(self):
        print 'test create multiple groups'
        for group in self.groups:
            if (self.module.find_group(self.driver,group) == 0):
                self.module.create_group (self.driver,group,self.members)
    """

    def test_create_same_name_groups(self):
        self.module.create_group(self.groups[2], self.members)
        self.module.create_group(self.groups[2], self.members)
        self.module.find_errortips('Group named ' +self.groups[2] + ' already exists.')

   
    def tearDown(self):
        for group in self.groups:
            if (self.module.find_group(group) != 0):
                self.module.delete_group (group)
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)
        

def suite():
    suite = unittest.TestSuite()
    suite.addTest(Test_groups('test_create_group'))
    suite.addTest(Test_groups('test_create_and_delete_group'))
    suite.addTest(Test_groups('test_create_same_name_groups'))

    return suite
    #suite.addTest(Test_page

if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    test_suite = suite()
    runner.run(test_suite)
    
   
