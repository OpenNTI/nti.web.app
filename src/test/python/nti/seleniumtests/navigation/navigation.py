from nti.seleniumtests.base import WebAppTestBase
import time



class WebAppNavigation (WebAppTestBase):
     
    
    def setUp(self):
        super (WebAppNavigation, self).setUp()
        self.login()
        
    def open_library (self):
        self.resp.doc.xpath ("//span[contains(@class, 'x-btn-icon library')]/..").click()
    
    
    def open_book(self,title = 'Prealgebra'):
        self.resp.doc.xpath ("//div[contains (@class, 'title') and text () ='" + title + "']/..").click()
        
    def open_chapter (self, title = 'Exponents'):
        self.resp.doc.xpath ("//div[contains (@class, 'x-grid-row') and text() ='" + title + "']/..").click() 
      
    def open_section (self, title = 'Squares'):
        self.resp.doc.xpath ("//div[contains (@class, 'x-grid-row  x-grid-tree-node-leaf') and text () = '" + title + "']/..").click()
        
        
    def switch_frame (self):
        print 'switch frame'
        
    def tearDown (self):
        self.app.close()
        