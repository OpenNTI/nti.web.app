import os
import six
import ConfigParser

# ----------------------------------

def get_str_option(config, section=ConfigParser.DEFAULTSECT, name=None, default=None):
	return get_option(config.get, section, name, default)

def get_bool_option(config, section=ConfigParser.DEFAULTSECT, name=None, default=False):
	return get_option(config.getboolean, section, name, default)

def get_int_option(config, section=ConfigParser.DEFAULTSECT, name=None, default=None):
	return get_option(config.getint, section, name, default)

def get_float_option(config, section=ConfigParser.DEFAULTSECT, name=None, default=None):
	return get_option(config.getfloat, section, name, default)
	
def get_option(cls, method, section, name, default):
	try:
		return method(section, name)
	except:
		return default

# ----------------------------------
		
class Configuration():
	
	def __init__(self, url=None, users=(), driver=None):
		self.url = url
		self.users = users
		self.driver = driver
		
	@classmethod
	def read(cls, source):
		source = os.path.expanduser(source)
		config = ConfigParser.ConfigParser()
		config.read(source) 
		
		# users
		users = get_str_option(config, section='data', name="users")
		assert  users, 'users were not found in config file'
		users = eval(users)
		if not users or not isinstance(users, (list, tuple)):
			raise ValueError('invalid users array value')
		
		tmp = []
		for t in users:
			if isinstance(t, six.string_types): # if string change to a tuple
				t = (t,)
			
			# check type
			assert isinstance(t, tuple), 'incorrect user/password tuple'
			
			# gather username and pwd
			name = t[0]
			pwd = t[1] if len(t) >=2 else name
			pwd = pwd or name
			if '@' not in name:
				name += '@nextthought.com'
			tmp.append((name, pwd))
		users = tuple(tmp)
		
		# url
		url = get_str_option(config, section='data', name="url")
		
		# driver
		driver = get_str_option(config, section='data', name="driver")
		
		result = Configuration(url, users, driver)
		result.config = config
		return result
