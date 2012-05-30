import os, time, unittest, webtest

class WebAppTestBase(unittest.TestCase):
	
	@classmethod
	def setUpClass(cls):
		cls.url = os.environ.get('TEST_URL', 'http://localhost:8081/NextThoughtWebApp/')
		cls.app = webtest.SeleniumApp(url=cls.url)
	
	@classmethod
	def tearDownClass(cls):
		cls.app.close()
	
	def setUp(self):
		try:
			self.resp = self.app.get(self.url)
		except Exception, e:
			self.fail(str(e))
			
	def login(self, user=None, password=None):
		resp = self.resp
		
		user = user or "jonathan.grimes@nextthought.com"
		password = password or "jonathan.grimes"
		self.wait_for_text("Username:","//label")
		
		resp.doc.input(name="username").value = user
		resp.doc.input(name="password").value = password
		resp.doc.button(buttonid='loginButton-btnEl').click()
		
		self.wait_for_node('//div[@id="top-controls"]')
	
	def logout(self):
		self.resp.doc.xpath("//img[contains(@class, 'session-logout')]/..").click()		
		self.wait_for_text("Username:","//label")
	
	def wait_for_text(self, text, xpath, timeout=60):
		resp = self.resp
		for _ in range(timeout):
			try:
				if text == resp.doc.xpath(xpath).text():
					break
			except: 
				pass
			time.sleep(1)
		else: 
			self.fail("time out")
	
	def wait_for_node(self, xpath, timeout=60):
		resp = self.resp
		for _ in range(timeout):
			try:
				if resp.doc.xpath(xpath).exist(): 
					break
			except:
				pass
			time.sleep(1)
		else: 
			self.fail("time out")

if __name__ == '__main__':
	unittest.main()
