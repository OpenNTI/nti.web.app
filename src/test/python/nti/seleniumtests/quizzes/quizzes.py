'''
Created on Jun 7, 2012

@author: ltesti
'''

from nti.seleniumtests.navigation.navigation import WebAppNavigation

class WebAppQuizzes(WebAppNavigation):
    
    def setUp(self):
        super(WebAppQuizzes, self).setUp()
        self.navigate_to('MathCounts2012', '2012', 'Warm-Up 1')
