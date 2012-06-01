import base
import unittest

class BasicTests(base.WebAppTestBase):
	
	def test_login_logout(self):
		self.login()
		self.logout()

if __name__ == '__main__':
	unittest.main()