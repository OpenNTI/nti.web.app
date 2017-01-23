const Ext = require('extjs');
const XRegExp = require('xregexp');
const SearchUtils = require('../Search');
const Hit = require('legacy/model/Hit');

describe('Search utils', () => {

	/*global XRegExp*/
	describe('contentRegexFromSearchTerm', () => {
		it('Deals with funky unicode equality', () => {
			const content = 'Court\u0027s';
			const term = 'Court\'s';
			const re = SearchUtils.contentRegexFromSearchTerm(term);

			expect(new XRegExp(re).test(content)).toBeTruthy();
		});

		it('Non-phrase doesn\'t span space', () => {
			const content = 'sand which';
			const term = 'sandwhich';
			const re = SearchUtils.contentRegexFromSearchTerm(term);

			expect(new XRegExp(re).test(content)).toBeFalsy();
		});

		it('Phrase search ignores punctuation', () => {
			const content = 'were, did? Court\u0027s belong!';
			const term = 'were did Court\'s belong?';
			const re = SearchUtils.contentRegexFromSearchTerm(term, true);

			expect(new XRegExp(re).test(content)).toBeTruthy();
		});

		it('Allows phrase search to span ?', () => {
			const content = 'beef? chicken';
			const term = 'beef chicken';
			const re = SearchUtils.contentRegexFromSearchTerm(term, true);

			expect(new XRegExp(re).test(content)).toBeTruthy();
		});

		it('checks a long phrase search', () => {
			const content = 'to shareholders, how to apply what little I\u0027d learned about management to the business of the company, how to maintain editorial quality while exercising financial';
			const term = 'to shareholders how to apply what little I\'d learned about management to the business of the company how to maintain editorial quality while exercising financial';
			const re = SearchUtils.contentRegexFromSearchTerm(term, true);

			expect(new XRegExp(re).test(content)).toBeTruthy();
		});

		it('Survives punctuation that are regex special chars', () => {
			const content = 'of basketball have developed for casual play. Competitive basketball is primarily an indoor sport played';
			const re = SearchUtils.contentRegexFromSearchTerm(content, true);

			expect(new XRegExp(re).test(content)).toBeTruthy();
		});
	});

	describe('extractMatchFromFragment', () => {
		it('Finds partial string', () => {
			const result = SearchUtils.extractMatchFromFragment('I like cake', [2, 6]);

			expect(result).toBe('like');
		});

		it('Finds entire string', () => {
			const str = 'I like cake';
			const match = [0, 11];
			const result = SearchUtils.extractMatchFromFragment(str, match);

			expect(result).toBe('I like cake');
		});
	});

	describe('contentRegexPartsForHit', () => {

		function hitWithFragments (frags) {
			return Hit.create({
				Type: 'Content',
				Fragments: Array.isArray(frags) ? frags : [frags]
			});
		}

		it('Will pull multiple matches from one fragment', () => {
			const hit = hitWithFragments({
				Matches: ['T<em>he</em> quick <em>brown fox</em>']
			});
			const terms = SearchUtils.contentRegexPartsForHit(hit);

			expect(terms.length).toBe(2);
			expect(Ext.Array.contains(terms, 'he')).toBeTruthy();
			expect(Ext.Array.contains(terms, 'brown fox')).toBeTruthy();
		});

		it('Pulls from multiple fragments', () => {
			const hit = hitWithFragments([{
				Matches: ['T<em>he</em> quick <em>brown fox</em>']
			},{
				Matches: ['See <em>spot</em> run']
			}]);
			const terms = SearchUtils.contentRegexPartsForHit(hit);

			expect(terms.length).toBe(3);
			expect(Ext.Array.contains(terms, 'he')).toBeTruthy();
			expect(Ext.Array.contains(terms, 'brown fox')).toBeTruthy();
			expect(Ext.Array.contains(terms, 'spot')).toBeTruthy();
		});

		it('Returns unique terms', () => {
			const hit = hitWithFragments([{
				Matches: ['The <em>quick</em> <em>quick</em> fox']
			},{
				Matches: ['See quick <em>spot</em> run']
			}]);
			const terms = SearchUtils.contentRegexPartsForHit(hit);

			expect(terms.length).toBe(2);
			expect(Ext.Array.contains(terms, 'quick')).toBeTruthy();
			expect(Ext.Array.contains(terms, 'spot')).toBeTruthy();
		});
	});

	//TODO rewrite this test to not use Ext.create
	xdescribe('contentRegexForSearchHit', () => {

		var MockSearchUtils;
		var MockTerms;

		it('Short ciruits for bad input', () => {
			var hit = Ext.create('NextThought.model.Hit', {
				Type: 'Content'
			});

			expect(SearchUtils.contentRegexForSearchHit(hit)).toBeFalsy();

			hit.set('Fragments', [{}]);
			hit.set('Type', 'Note');

			expect(SearchUtils.contentRegexForSearchHit(hit)).toBeFalsy();
		});

		beforeEach(() => {
			MockSearchUtils = Ext.create('NextThought.util.Search');
			MockTerms = ['cat', 'dog', 'plecostomus'];
			spyOn(MockSearchUtils, 'contentRegexPartsForHit').andReturn(MockTerms);
			spyOn(MockSearchUtils, 'contentRegexFromSearchTerm').andCallThrough();
		});

		it('Escapes each term', () => {
			var spy;

			expect(MockSearchUtils.contentRegexForSearchHit(null, true)).toBeTruthy();
			spy = MockSearchUtils.contentRegexFromSearchTerm;
			expect(spy.calls.length).toBe(MockTerms.length);
			Ext.each(MockTerms, (term) => {
				expect(spy).toHaveBeenCalledWith(term, true);
			});
		});

		it('ORs the terms', () => {
			var re = MockSearchUtils.contentRegexForSearchHit(null, true);
			expect(re).toBeTruthy();

			Ext.each(MockTerms, (term) => {
				expect(re.test(term)).toBeTruthy();
				re.lastIndex = 0; //reset it
			});

			expect(re.test('monkey')).toBeFalsy();
		});

	});

});
