'''
Created on May 29, 2012

@author: ltesti
'''
import time
import selenium
import unittest

from selenium import webdriver
from selenium.webdriver.common.keys import Keys

# give enough time for elements to appear and be selectable
def listen_for_element_presents(element_name, obj, timeout=30):
    start_time = time.time()
    while(not obj.find_element_by_id(element_name).is_displayed()):
        time.sleep(0.2)
        if (time.time() - start_time) > timeout: raise Exception
    time.sleep(1)

class TestChat(unittest.TestCase):

    def test_x(self):
        try:
            # start up webapp
            driver = webdriver.Firefox()
            driver.implicitly_wait(30)
            driver.get("http://localhost:8081/NextThoughtWebApp/")
            
            # select and enter username
            username_field = driver.find_element_by_id("username")
            username_field.click()
            username_field.send_keys("logan.testi@nextthought.com")
            username_field.send_keys(Keys.RETURN)
            
            # select and enter password
            listen_for_element_presents("password", driver)
            password_field = driver.find_element_by_id("password")
            password_field.send_keys("logan.testi")
            listen_for_element_presents("submit", driver)
            password_field.send_keys(Keys.RETURN)
            driver.find_element_by_id("submit").click()
            
            # wait 5 seconds so we(users) can varify results
            time.sleep(5)
            driver.quit()
            
        # any exception encountered will print its message and quit the webapp
        except Exception, e:
            print e.message
            driver.quit()
        
if __name__ == "__main__":
    unittest.main()