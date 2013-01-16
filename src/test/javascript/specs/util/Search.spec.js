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

	describe("extractMatchFromFragment", function(){
		it("Finds partial string", function(){
			var result = SearchUtils.extractMatchFromFragment('I like cake', [2, 6]);
		   expect(result).toBe('like');
		});

		it("Finds entire string", function(){
			var result = SearchUtils.extractMatchFromFragment('I like cake', [0, 11]);
			expect(result).toBe('I like cake');
		});
	});

	describe("contentRegexPartsForHit", function(){
		it('Short ciruits for bad input', function(){
			var hit = Ext.create('NextThought.model.Hit', {
				Type: 'Content'
			});

			expect(SearchUtils.contentRegexPartsForHit(hit)).toBeFalsy();

			hit.set('Fragments', [{}]);
			hit.set('Type', 'Note');

			expect(SearchUtils.contentRegexPartsForHit(hit)).toBeFalsy();
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

			terms = SearchUtils.contentRegexPartsForHit(hit);
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

			terms = SearchUtils.contentRegexPartsForHit(hit);
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

			terms = SearchUtils.contentRegexPartsForHit(hit);
			expect(terms.length).toBe(2);
			expect(Ext.Array.contains(terms, 'quick')).toBeTruthy();
			expect(Ext.Array.contains(terms, 'spot')).toBeTruthy();
		});
	});

	describe("contentRegexForSearchHit", function(){
		it('Short ciruits for bad input', function(){
			var hit = Ext.create('NextThought.model.Hit', {
				Type: 'Content'
			});

			expect(SearchUtils.contentRegexForSearchHit(hit)).toBeFalsy();

			hit.set('Fragments', [{}]);
			hit.set('Type', 'Note');

			expect(SearchUtils.contentRegexForSearchHit(hit)).toBeFalsy();
		});
	});

});

