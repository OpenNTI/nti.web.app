describe("Search utils", function() {

	var SearchUtils;

	beforeEach(function(){
		SearchUtils = NextThought.util.Search;
	});

	describe("contentRegexFromSearchTerm", function(){
		it("Deals with funky unicode equality", function(){
			var content = 'Court\u0027s',
				term = 'Court\'s', re;

			re = SearchUtils.contentRegexFromSearchTerm(term);
			expect(new RegExp(re).test(content)).toBeTruthy();
		});

		it('Non-phrase doesn\'t span space', function(){
			var content = 'sand which',
				term = 'sandwhich', re;

			re = SearchUtils.contentRegexFromSearchTerm(term);
			expect(new RegExp(re).test(content)).toBeFalsy();
		});

		it('Phrase search ignores punctuation', function(){
			var content = 'were, did? Court\u0027s belong!',
				term = 'were did Court\'s belong', re;

			re = SearchUtils.contentRegexFromSearchTerm(term, true);
			expect(new RegExp(re).test(content)).toBeTruthy();
		});
	});

});

