import os
import unittest

from lxml import etree
from base import WebAppTestBase
from hamcrest import assert_that, is_

__path__ = os.path.split(__file__)[0]

class TestLogin(WebAppTestBase):
    
    ini_file = os.path.join(__path__, 'config.ini')
    
    def test_login(self):
        print self.ini_file
        self.login(self.users[0][0], self.users[0][1])
        tree = etree.ElementTree(self.resp.lxml)
        assert_that(etree.tostring(tree.find('//title')), is_('<title>NextThought App</title>'))
    
    def test_logout(self):pass
#        self.login()
    
if __name__ == "__main__":
    unittest.main()