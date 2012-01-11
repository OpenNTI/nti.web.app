import os, time, unittest, webtest

class WebAppTestBase(unittest.TestCase):
	
	@classmethod
	def setUpClass(cls):
		cls.url = os.environ.get('TEST_URL',None)
		cls.app = webtest.SeleniumApp(url=cls.url)
	
	@classmethod
	def tearDownClass(cls):
		cls.app.close()
	
	def setUp(self):
		try:
			self.resp = self.app.get(self.url)
		except Exception, e:
			self.fail(str(e))
	
	
	def login(self):
		resp = self.resp
		self.wait_for_text("Username:","//label")
		
		resp.doc.input(name="username").value = "jonathan.grimes@nextthought.com"
		resp.doc.input(name="password").value = "jonathan.grimes"
		resp.doc.button(buttonid='loginButton-btnEl').click()
		
		self.wait_for_node('//div[@id="top-controls"]')
	
	
	def logout(self):
		self.resp.doc.xpath("//img[contains(@class, 'session-logout')]/..").click()		
		self.wait_for_text("Username:","//label")
	
	
	def wait_for_text(self, text, xpath):
		resp = self.resp
		
		for i in range(60):
			try:
				if text == resp.doc.xpath(xpath).text(): break
			except: pass
			time.sleep(1)
		else: self.fail("time out")
	
	def wait_for_node(self, xpath):
		resp = self.resp
		
		for i in range(60):
			try:
				if resp.doc.xpath(xpath).exist(): break
			except: pass
			time.sleep(1)
		else: self.fail("time out")


if __name__ == '__main__':
	unittest.main()
