from nti.seleniumtests.base import WebAppTestBase
import time



class WebAppNavigation (WebAppTestBase):
     
    
    def setUp(self):
        super (WebAppNavigation, self).setUp()
        self.login()
        
    def open_library (self):
        
        #Remove time.sleep()
        time.sleep(3)
        self.resp.doc.xpath ("//span[contains(@class, 'x-btn-icon library')]/..").click()
    
    
    def open_book(self,title = 'Prealgebra'):
        time.sleep(3)
        self.resp.doc.xpath ("//div[contains (@class, 'title') and text () ='" + title + "']/..").click()
        
    def open_chapter (self, title = 'Exponents'):
        time.sleep(5)
        self.resp.doc.xpath ("//div[contains (@class, 'x-grid-cell-inner') and text() ='" + title + "']/..").click() 
      

        
        
    
    def tearDown (self):
        self.app.close()
        