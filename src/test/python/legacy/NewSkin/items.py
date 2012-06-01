from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
import html5lib
from html5lib import treewalkers, serializer, treebuilders
import lxml.etree
import time, re, unittest


class Item(): 
    def __init__(self, driver):
        self.item ={}
        self.driver = driver
        self.html = self.driver.page_source
        self.p = html5lib.HTMLParser( tree=treebuilders.getTreeBuilder("lxml"), namespaceHTMLElements=False )
        self.doc = self.p.parse( self.html )
    
    def refresh(self):
        self.html = self.driver.page_source
        self.doc = self.p.parse(self.html)
    

    
    def find_item_id(self, tag, attribute, attributeValue, doc = None):
        self.refresh()
        
        if doc is None: 
            doc = self.doc
        id = None
        for node in doc.iter(tag):
            if (node.get(attribute) is not None and node.get(attribute) == attributeValue):
                id = node.get('id') 
                break
    
        return id
    
    def find_item_text(self,tag, attribute, attributeValue, doc = None ):
        self.refresh() 
        
        if doc is None: 
            doc = self.doc
        text = None
        for node in doc.iter(tag): 
            if (node.get(attribute) is not None and node.get(attribute) == attributeValue):
                text = node.get('text')
                break
            
        return text 
    
    def find_item_name (self,  tag, attribute, attributeValue, doc = None):
        self.refresh()
        if doc is None: 
            doc = self.doc
        name = None
        for node in doc.iter(tag): 
            if (node.get(attribute) is not None and node.get(attribute) == attributeValue):
                text = node.get('text')
                break
            
        return name
    
    def find_item_by_xpath(self, xpath, doc = None):
        self.refresh()
        if doc is None: 
            doc = self.doc
        result = doc.find (xpath)
        
        return result
    
    
    def find_item(self, tag, attribute, attributeValue, doc = None):
        self.refresh() 
        if doc is None: 
            doc = self.doc
        boolVal = False
        for node in doc.iter(tag): 
            if (node.get(attribute) is not None and node.get(attribute) == attributeValue):  
                boolVal = True
                break
                
        return boolValue   
    
    import re 
    def return_node (self, tag, attribute, attributeValue ,doc = None):
        elt = None
        self.refresh() 
        if doc is None: 
            doc = self.doc
        for node in doc.iter(tag):
            if (node.get (attribute) is not None and re.search (attributeValue.strip(), node.get(attribute))):
                elt = node
        return elt
       
    def dict_of_items (self, tag, attribute, attributeValue,doc = None):
        self.refresh() 
        if doc is None: 
            doc = self.doc
        i = 0 
        items = {}
        for node in doc.iter (tag): 
                if node.get (attribute) is not None and re.search (attributeValue.strip(),node.get (attribute)): 
                    items[node.text] = i 
                    i = i+1 
        return items
    
    
            
        
        
            
            