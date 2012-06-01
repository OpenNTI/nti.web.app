import NewSkin_helper_login

class Module (NewSkin_helper_login.Module):

    def __init__():
        print 'a group'


    def create_group(self,groupName, members):
        driver = self.driver
        time.sleep(4)
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        driver.find_element_by_class_name("groups-mode-icon").click()
        time.sleep(5)
        try:
            driver.find_element_by_class_name("create-button").click()
        except IndexError:
            print ('element not found')

        print 'here after finding button'
        time.sleep(4)
        driver.find_element_by_id(self.find_add_group_items(driver,0)).send_keys(groupName)
        userfield = self.find_add_group_items(driver,1)

        for member in members:
            driver.find_element_by_id(userfield).send_keys(member)
            time.sleep(6)
            driver.find_element_by_id(userfield).send_keys(Keys.ARROW_DOWN)
            time.sleep(4)
            driver.find_element_by_id(userfield).send_keys(Keys.RETURN)
            time.sleep(3)
        driver.find_element_by_xpath("//div[2]/div/div[2]/em/button").click()  #save button


    def delete_group(self,groupName):
        driver = self.driver
        time.sleep(4)
        driver.find_element_by_id(self.find_group(driver,groupName)).click()
        driver.find_element_by_class_name('delete-button').click()
        time.sleep(3)

    
    def find_add_group_items(self,index):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        ids = ['textfield', 'usersearchinput', 'searchBox']

        for node in self.doc.iter("input"):
            id = node.getparent().get('id')
            if (id.startswith(ids[index])):
               el_id = node.get('id')
               break
            else:
                el_id = 0
        return el_id

    def find_errortips(self,text):
        driver = self.driver
        time.sleep(2)
        self.html = driver.page_source
        self.doc = self.p.parse( self.html )
        for node in self.doc.iter("li"):
            if node.text == text:
                return True
                break
        return False

    def find_group(self, name):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        for node in self.doc.iter("span"):
            if node.text == name:
                parent = node.getparent()
                id = parent.attrib.get('id')
                break
            else:
                id = 0
        return id


