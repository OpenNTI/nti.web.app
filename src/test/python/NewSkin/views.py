import NewSkin_actions as Actions 
import NewSkin_items as Items
from ConfigParser import SafeConfigParser

class Views(): 
	def __init__(self):
		self.action = Actions.Action() 
        self.item   = Items.Item(action.driver)
        self.parser_config = SafeConfigParser()
        self.parser_config.read ('config.ini')
        self.url = parser.get ('data', 'url')
        self.parser_info = SafeConfigParser()
        self.parser_info.read('information.ini')
       