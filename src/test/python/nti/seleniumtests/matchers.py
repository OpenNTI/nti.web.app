from hamcrest.core.base_matcher import BaseMatcher

from . import has_element_with_text as hewt

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