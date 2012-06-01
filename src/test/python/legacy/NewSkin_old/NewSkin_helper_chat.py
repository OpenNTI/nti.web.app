import NewSkin_helper_navigation

class Module (NewSkin_helper_navigation.Module):
    def __init__():
        print 'chat'


    def open_chat_window(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse(self.html) 
        driver.find_element_by_class_name('chat').click()

    def find_chat_window(self):
        driver = self.driver
        return driver.find_element_by_class_name ('chat-window').is_displayed()


    def find_tab_name(self,username):
        driver = self.driver
        self.html = driver.page_source
        self.doc  = self.p.parse(self.html)
        for x in self.doc.iter('span'):
            if x.text == username:
                return True
                break
        return False

    def find_text_field(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        for node in self.doc.iter("input"):
            if node.get('class') == 'x-form-field x-form-text':
                elt = node.getparent().get('id')
                if (elt.startswith ("textfield")):
                    return node.get('id')
                    break
        return 0
   
    def start_chat(self,receiver):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        if (self.find_chat_window(driver) == False):
            driver.find_element_by_class_name('chat').click()
        #Start a chat with a friend who is online
        driver.find_element_by_id(self.find_online_friend(driver,receiver.rsplit().pop(0))).click()
       
    def find_online_friend (self,username):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        id = 0
        for node in self.doc.iter("img"):
            if node.get('title') == username:
                if (node.getparent().get('class') == 'avatar online'):
                    id = node.get('id')
                    break
        return id


    
    def chat(self, list):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        time.sleep(2)
        field_id = self.find_text_field(driver)
        for log in list: 
            driver.find_element_by_id(field_id).send_keys(log)
            driver.find_element_by_class_name('reply-to-button').click()

    def find_chat_logs (self, username):
        driver = self.driver
        time.sleep(4)
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        list_logs = [] 
        for node in self.doc.iter("span"):
            if node.get ('class') == 'name' and node.text == username:
                list_logs.append (node.getnext().text)

        return list_logs

    def end_chats(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        element = driver.find_elements_by_class_name("x-tab-close-btn")
        for x in element:
            x.click()
        
    def close_chat_window(self):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        element = driver.find_element_by_class_name('x-tool-close')
        element.click()

