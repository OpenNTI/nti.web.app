from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException

class Action():
    
    def __init__(self, url):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = url 
        self.driver.get(self.base_url)
        self.verificationErrors = []
    
    
    def click_url(self, text, driver = None ):
        if driver is None: 
            driver = self.driver
        driver.get (url)
        driver.find_element_by_link_text (text).click() 
        time.sleep(5)
        
    
    def click_element_by_id(self, id,driver = None):
        if driver is None: 
            driver = self.driver
        driver.find_element_by_id(id).click()
        time.sleep(5)
    
    def click_element_by_class_name (self, className, driver = None):
        if driver is None: 
            driver = self.driver
        driver.find_element_by_class_name (className).click()
        time.sleep(5)
        

    def send_keys (self,id, keys, driver = None):
        if driver is None: 
            driver = self.driver
        driver.find_element_by_id (id).clear()
        driver.find_element_by_id (id).send_keys (keys)
        driver.sleep(5)

    def click_list_element_by_class_name (self,className,index, driver = None):
        if driver is None: 
            driver = self.driver
            
        driver.find_elements_by_class_name (className)[index].click() 
    
    def click_list_element_by_tag_name (self,tagName, index, driver = None):
        if driver is None: 
            driver = self.driver
        driver.find_elements_by_tag_name (tagName)[index].click()
    
    
        