import os
import unittest

from nti.seleniumtests.quizzes.quizzes import WebAppQuizzes

__path__ = os.path.split(__file__)[0]

class TestQuizzes(WebAppQuizzes):
    
    ini_file = os.path.join(__path__, '../config/main.ini')
    
    def test_quiz(self):
        print 'hello'
        
if __name__ == "__main__":
    unittest.main()