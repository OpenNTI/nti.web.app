from sst.actions import get_page_source

from nti.seleniumtests import html_parse

from hamcrest.core.base_matcher import BaseMatcher

def _values_of_node(node, element, html=None):	
	items = []	
	html = html or get_page_source()
	tree = html_parse(html)
	for item in tree.iter(node):
		if element: 
			value = item.get(element)
		else: 
			value = item.text
		items.append(value)
	return items

class HasElementWithText(BaseMatcher):

	def __init__( self, element ):
		super(HasElementWithText, self).__init__( )
		self.element = element

	def _matches( self, item ):
		return _values_of_node(self.element, str(item))

	def describe_to( self, description ):
		description.append_text('text in element').append( str(self.element) )
		
def is_in_text_for_element( resp, element ):
	return HasElementWithText( resp, element )

class IsInTree(BaseMatcher):
	def __init__(self, node, element, html=None):
		self.node = node
		self.html = html
		self.element = element

	def _matches(self, item, mismatch_desciption=None):
		self.item = item
		matcher = _values_of_node(self.node, self.element, self.html)
		return item in matcher
	
	def describe_mismatch(self, item, description):
		description.append_description_of('lxml ' + self.node + ' attributes did not contain ' + item)
	
	def describe_to(self, description):
		description.append_description_of(self.node + ' attribute to contain ' + self.item)
	
def is_in_tree(node, element=None, html=None):
	return IsInTree(node, element, html)
