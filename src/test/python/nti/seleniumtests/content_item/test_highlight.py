import os
import unittest
from nti.seleniumtests.content_item.content_item import WebAppContentItem

__path__ = os.path.split(__file__)[0]

class TestHighlight(WebAppContentItem):
    
    ini_file = os.path.join(__path__, '../config/main.ini')
    
    def test_select_text(self):
        self.create_highlight()
        print 'here'
        
        
if __name__ == "__main__":
    unittest.main()