import base

class BasicTests(base.WebAppTestBase):
	
	def test_login_logout(self):
		self.login()
		self.logout()
