describe("Search utils", function() {

	var TestSearchUtils;

	beforeEach(function(){
		TestSearchUtils = Ext.create('NextThought.util.Search');
	});

	it("Makes Global SearchUtils available", function(){
		expect(SearchUtils).toBeTruthy();
		expect(Ext.getClassName(SearchUtils)).toEqual('NextThought.util.Search');
	});

	describe("contentRegexFromSearchTerm", function(){
		it("Deals with funky unicode equality", function(){
			var content = 'Court\u0027s',
				term = 'Court\'s', re;

			re = TestSearchUtils.contentRegexFromSearchTerm(term);
			expect(new RegExp(re).test(content)).toBeTruthy();
		});

		it('Non-phrase doesn\'t span space', function(){
			var content = 'sand which',
				term = 'sandwhich', re;

			re = TestSearchUtils.contentRegexFromSearchTerm(term);
			expect(new RegExp(re).test(content)).toBeFalsy();
		});

		it('Phrase search ignores punctuation', function(){
			var content = 'were, did? Court\u0027s belong!',
				term = 'were did Court\'s belong', re;

			re = TestSearchUtils.contentRegexFromSearchTerm(term, true);
			expect(new RegExp(re).test(content)).toBeTruthy();
		});

		it('Allows phrase search to span ?', function(){
			var content = 'beef? chicken',
				term = 'beef chicken', re;

			re = TestSearchUtils.contentRegexFromSearchTerm(term, true);
			expect(new RegExp(re).test(content)).toBeTruthy();
		});
	});

	describe("extractMatchFromFragment", function(){
		it("Finds partial string", function(){
			var result = TestSearchUtils.extractMatchFromFragment('I like cake', [2, 6]);
		   expect(result).toBe('like');
		});

		it("Finds entire string", function(){
			var str = 'I like cake', match=[0, 11],
				result = TestSearchUtils.extractMatchFromFragment(str, match);
			expect(result).toBe('I like cake');
		});
	});

	describe("contentRegexPartsForHit", function(){
		it('Short ciruits for bad input', function(){
			var hit = Ext.create('NextThought.model.Hit', {
				Type: 'Content'
			});

			expect(TestSearchUtils.contentRegexPartsForHit(hit)).toBeFalsy();

			hit.set('Fragments', [{}]);
			hit.set('Type', 'Note');

			expect(TestSearchUtils.contentRegexPartsForHit(hit)).toBeFalsy();
		});

		function hitWithFragments(frags){
			var hit = Ext.create('NextThought.model.Hit', {
				Type: 'Content',
				Fragments: Ext.isArray(frags) ? frags : [frags]
			});

			return hit;
		}

		it("Will pull multiple matches from one fragment", function(){
			var hit = hitWithFragments({
				text: 'The quick brown fox',
				matches: [[1,3], [10, 19]]
			}), terms;

			terms = TestSearchUtils.contentRegexPartsForHit(hit);
			expect(terms.length).toBe(2);
			expect(Ext.Array.contains(terms, 'he')).toBeTruthy();
			expect(Ext.Array.contains(terms, 'brown fox')).toBeTruthy();
		});

		it("Pulls from multiple fragments", function(){
			var hit = hitWithFragments([{
				text: 'The quick brown fox',
				matches: [[1,3], [10, 19]]
			},{
				text: 'See spot run',
				matches: [[4, 8]]
			}]), terms;

			terms = TestSearchUtils.contentRegexPartsForHit(hit);
			expect(terms.length).toBe(3);
			expect(Ext.Array.contains(terms, 'he')).toBeTruthy();
			expect(Ext.Array.contains(terms, 'brown fox')).toBeTruthy();
			expect(Ext.Array.contains(terms, 'spot')).toBeTruthy();
		});

		it("Returns unique terms", function(){
			var hit = hitWithFragments([{
				text: 'The quick quick fox',
				matches: [[4,9], [10, 15]]
			},{
				text: 'See quick spot run',
				matches: [[4,9], [10, 14]]
			}]), terms;

			terms = TestSearchUtils.contentRegexPartsForHit(hit);
			expect(terms.length).toBe(2);
			expect(Ext.Array.contains(terms, 'quick')).toBeTruthy();
			expect(Ext.Array.contains(terms, 'spot')).toBeTruthy();
		});
	});

	describe("contentRegexForSearchHit", function(){

		var MockSearchUtils;
		var MockTerms;

		it('Short ciruits for bad input', function(){
			var hit = Ext.create('NextThought.model.Hit', {
				Type: 'Content'
			});

			expect(TestSearchUtils.contentRegexForSearchHit(hit)).toBeFalsy();

			hit.set('Fragments', [{}]);
			hit.set('Type', 'Note');

			expect(TestSearchUtils.contentRegexForSearchHit(hit)).toBeFalsy();
		});

		beforeEach(function(){
			MockSearchUtils = Ext.create('NextThought.util.Search');
			MockTerms = ['cat', 'dog', 'plecostomus'];
			spyOn(MockSearchUtils, 'contentRegexPartsForHit').andReturn(MockTerms);
			spyOn(MockSearchUtils, 'contentRegexFromSearchTerm').andCallThrough();
		});

		it('Escapes each term', function(){
			var spy;

			expect(MockSearchUtils.contentRegexForSearchHit(null, true)).toBeTruthy();
			spy = MockSearchUtils.contentRegexFromSearchTerm;
			expect(spy.calls.length).toBe(MockTerms.length);
			Ext.each(MockTerms, function(term){
				expect(spy).toHaveBeenCalledWith(term, true);
			});
		});

		it('ORs the terms', function(){
			var re = MockSearchUtils.contentRegexForSearchHit(null, true);
			expect(re).toBeTruthy();

			Ext.each(MockTerms, function(term){
				expect(re.test(term)).toBeTruthy();
				re.lastIndex = 0; //reset it
			});

			expect(re.test('monkey')).toBeFalsy();
		});

	});

});

