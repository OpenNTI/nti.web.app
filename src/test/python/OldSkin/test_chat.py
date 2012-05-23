import module
import find_elements
import unittest, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
import test_login


class Test_chat(unittest.TestCase):

    def setUp(self):
        print 'setUp'
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        #self.base_url = "http://localhost:8081/NextThoughtWebApp/"
        #self.base_url = "http:excelsior.nextthought.com"
        self.driver.get(self.base_url)
        self.verificationErrors = []
        self.module = module.Module()
        self.module.setUp(self.driver)
        self.module.login('pacifique.mahoro', 'pacifique.mahoro')
        self.module.change_mode('groups')

        self.groups = ['test1234', 'test12345', 'test12345']
        self.members = ['logan testi', 'suzie stewart']

        self.module.create_group(self.groups[0], self.members)
        
        '''self.driver2 = webdriver.Chrome()
        self.driver2.implicitly_wait(30)
        #self.base_url = "http://localhost:8081/NextThoughtWebApp/"
        #self.base_url = "http:excelsior.nextthought.com"
        self.driver2.get(self.base_url)
        self.verificationErrors = []
        time.sleep(3)
        self.module2 = module.Module()
        self.module2.setUp(self.driver2)
        self.module2.login(self.driver2, 'logan.testi', 'logan.testi')
        self.module2.change_mode(self.driver2,'groups')
        '''
        
    def test_open_chat_window(self):
        self.module.open_chat_window()
        assertTrue (self.module.find_chat_window())
        

    def send_simple_chat(self):
        print 'Simple chat'
        self.module.open_chat_window()
        self.module.start_chat('Logan Testi')
        self.module.chat()
        

    def test_chat_request_received(self):
        time.sleep(2)
        print 'Simple chat request received'
        assertTrue(True, self.module.find_chat_window()) 
        assertTrue(True, self.find_tab_name('Logan'))

def suite():
    suite = unittest.TestSuite()
    #suite.addTest(Test_chat('test_simple_chat'))
    return suite


class Chat_user(object):
    def __init__(self, name, driver, module,list_chats, *args, **kwargs):
        self.exception = None
        self.name = name
        self.module = module
        self.driver = driver
        username = name.split()[0].lower()+ '.'+ name.split()[1].lower()
        password = name.split()[0].lower()+ '.'+ name.split()[1].lower()
        self.module.setUp(self.driver)
        self.module.login(username,password )
        self.module.change_mode('groups')
        self.module.open_chat_window(driver)
        print 'in init'
        self.list_chats = list_chats

        
    def __call__(self):
        print self.list_chats
        try:
            print 'in callable object'
            self.module.chat( self.list_chats)
        except IndexError:
            self.exeception = 'Something failed: ' + IndexError

    def init_chat(self, username):
        print 'init chat'
        self.module.start_chat(username)
    

import threading

def main():

    list_chats = ['test1', 'test2', 'test3']
    
    driver_1 =  webdriver.Firefox()
    #base_url = "http://localhost:8081/NextThoughtWebApp/"
    base_url = "http://excelsior.nextthought.com/"
    driver_1.get(base_url)
    module_1 = module.Module()
    driver_2 = webdriver.Firefox()
    driver_2.get(base_url)
    module_2 = module.Module()
    threads = []
    user_1 = Chat_user('Logan Testi', driver_1, module_1, list_chats)
    user_2 = Chat_user('Pacifique Mahoro', driver_2, module_2, list_chats)
    user_1.init_chat('Pacifique Mahoro')

     
    threads.append(threading.Thread(target = user_1, args = ()))
    threads.append(threading.Thread(target = user_2, args = ()))
        
    for t in threads:
        t.start()
        print 'start thread'

    for t in threads:
        t.join()
 
    if user_1.exception:
        print user_1.username

    if user_2.exception:
        print user_2.username

    if (set(list_chats) == set(module_1.find_chat_logs(driver_1, 'Pacifique'))):
        print 'The chat logs are visible'

    else:
        print 'The chat logs are not visible'

    if (set(list_chats) == set(module_2.find_chat_logs(driver_2, 'Logan'))):
        print 'The chat logs are visible'

    else:
        print 'The chat logs are invisible'
    
    
    
        # exceptions, errors, good reply   
if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    test_suite = suite()
    runner.run(test_suite)
