# Due to the versatility of elements tags, I have created different functions to take care of those differences.
# It is not a very robust solution but for now it will do.
# Depending on what I am looking for, I have to first identify the best way to access it, that is why sometimes I access the tag 'span' or just checking the text.

import html5lib
from html5lib import treewalkers, serializer, treebuilders
import lxml.etree

class find_elements:
    
    def __init__(self,html):
        self.p = html5lib.HTMLParser( tree=treebuilders.getTreeBuilder("lxml"), namespaceHTMLElements=False )

    #not sure what self does in python, but I will just stick it there.
        self.doc = self.p.parse( html )

    def update_doc(html):
        self.doc = self.p.parse( html )

    
    def find_mode(index, doc):

        modes = ['x-btn-icon reader-mode-icon', 'x-btn-icon stream-mode-icon', 'x-btn-icon groups-mode-icon', 'x-btn-icon classroom-mode-icon']
        #TO-DO: Add some kind of else here....otherwise I will crash and burn several times. 
        #default id to 0
        id = 0
        for x in self.doc.iter():
        
            if x.tag == 'span':
                attributes = x.attrib
                if (attributes.get('class') == modes[index]):
                     id = attributes.get('id')
        return id


# Actions Create and Delete

    
    

    def find_group_actions(index):
        actions = ['Create', 'Delete']
        for node in self.doc.iter():
            if node.text == actions [index]:
                attributes = node.attrib
                id = attributes.get('id')
             #sender.driver.find_element_by_id(attributes.get('id')).click()
        return id



#the span on this level does not have attributes, so I had to move up to its parent.
 
    
 



