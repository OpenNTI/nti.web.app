'''
Created on May 31, 2012

@author: ltesti
'''
import unittest

from base import WebAppTestBase
from lxml import etree
from hamcrest import assert_that, is_

class Test_Login(WebAppTestBase):
    
    ini_file = '/Users/ltesti/Projects/NextThoughtWebApp/src/test/python/NewSkin/config.ini'
    
    # --------login tests----------
    
    def test_login(self):
        self.login(self.users[0][0], self.users[0][1])
        tree = etree.ElementTree(self.resp.lxml)
        assert_that(etree.tostring(tree.find('//title')), is_('<title>NextThought App</title>'))
    
    # --------logout tests---------
    
    def test_logout(self):pass
#        self.login()
    
if __name__ == "__main__":
    unittest.main()