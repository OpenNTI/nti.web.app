import time
from nti.seleniumtests.navigation.navigation import WebAppNavigation
from nti.seleniumtests import html_parse

class WebAppContentItem (WebAppNavigation):
    
    def setUp(self):
        super(WebAppContentItem, self).setUp()
        self.navigate_to('Prealgebra', 'Decimals', 'Rounding')
        print 'before switching to the frame'
        self.driver.switch_to_frame ('component-1036')
        print 'after setup'
        
    def tearDown(self):
        super(WebAppContentItem, self).tearDown()
        
    
    def select_text (self,end, index,start = 0):
        #make sure you are in right frame. 
       # if (self.driver.title): 
        #    self.driver.switch_to_frame('component-1036')
        script = 'function selectElementContents (el,start, end) {var sel = window.getSelection(); var range = window.document.createRange();  range.setStart(el,start); range.setEnd(el,end); sel.removeAllRanges(); sel.addRange(range);} selectElementContents(window.document.getElementsByTagName ("p")' + '[' + str(index) + '].firstChild,' + str(start) + ',' + str(end) + ')'
        self.driver.execute_script(script)

    def index_of_text(self):
    #Find the next non-empty paragraph
        i = 0
        size = 0
        index = 0     
        self.doc = html_parse(html = self.driver.page_source)
        for node in self.doc.iter ('p'):
            if node.text and not (node.get ('id')):
                size = len(node.text)
                index = i
                break
            i = i+1
        
        var = (index, size) 
        return var
    
    
    def create_highlight(self):
        var = self.index_of_text()
        self.select_text(end = var[1], index = var[0])
        time.sleep(10)
        