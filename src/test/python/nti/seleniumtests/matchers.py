from hamcrest.core.base_matcher import BaseMatcher

from . import as_the_text_of as hewt

class HasElementWithText(BaseMatcher):

	def __init__( self, resp, element ):
		super(HasElementWithText, self).__init__( )
		self.resp = resp
		self.element = element

	def _matches( self, item ):
		return hewt(self.resp, self.element, str(item))

	def describe_to( self, description ):
		description.append_text('text in element').append( str(self.element) )
		
def is_in_text_for_element( resp, element ):
	return HasElementWithText( resp, element )

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