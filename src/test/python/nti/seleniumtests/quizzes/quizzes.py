from nti.seleniumtests.navigation.navigation import WebAppNavigation

class WebAppQuizzes(WebAppNavigation):
    
    def setUp(self):
        super(WebAppQuizzes, self).setUp()
        self.navigate_to(book='MathCounts2012', section='Warm-Up 1')
