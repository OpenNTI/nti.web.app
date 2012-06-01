'''
Created on May 31, 2012

@author: ltesti
'''

from hamcrest.core.base_matcher import BaseMatcher

class IsInTree(BaseMatcher):
    def __init__(self, matcher):
        self.node = matcher[0]
        self.matcher = matcher[1:]
        
    def _matches(self, item, mismatch_desciption=None):
        self.item = item
        return item in self.matcher
    
    def describe_mismatch(self, item, description):
        description.append_description_of('lxml ' + self.node + ' attributes did not contain ' + item)
    
    def describe_to(self, description):
        description.append_description_of(self.node + ' attribute to contain ' + self.item)
     
def is_in_tree(attr):
    return IsInTree(attr)