/* globals spyOn */
/* eslint-env jest */
const Ext = require('@nti/extjs');

const Hit = require('legacy/model/Hit');

const SearchUtils = require('../Search');

describe('Search utils', () => {
	describe('contentRegexFromSearchTerm', () => {
		test('Deals with funky unicode equality', () => {
			const content = 'Court\u0027s';
			const term = "Court's";
			const re = SearchUtils.contentRegexFromSearchTerm(term);

			expect(new RegExp(re, 'ui').test(content)).toBeTruthy();
		});

		test("Non-phrase doesn't span space", () => {
			const content = 'sand which';
			const term = 'sandwhich';
			const re = SearchUtils.contentRegexFromSearchTerm(term);

			expect(new RegExp(re, 'ui').test(content)).toBeFalsy();
		});

		test('Phrase search ignores punctuation', () => {
			const content = 'were, did? Court\u0027s belong!';
			const term = "were did Court's belong?";
			const re = SearchUtils.contentRegexFromSearchTerm(term, true);

			expect(new RegExp(re, 'ui').test(content)).toBeTruthy();
		});

		test('Allows phrase search to span ?', () => {
			const content = 'beef? chicken';
			const term = 'beef chicken';
			const re = SearchUtils.contentRegexFromSearchTerm(term, true);

			expect(new RegExp(re, 'ui').test(content)).toBeTruthy();
		});

		test('checks a long phrase search', () => {
			const content =
				'to shareholders, how to apply what little I\u0027d learned about management to the business of the company, how to maintain editorial quality while exercising financial';
			const term =
				"to shareholders how to apply what little I'd learned about management to the business of the company how to maintain editorial quality while exercising financial";
			const re = SearchUtils.contentRegexFromSearchTerm(term, true);

			expect(new RegExp(re, 'ui').test(content)).toBeTruthy();
		});

		test('Survives punctuation that are regex special chars', () => {
			const content =
				'of basketball have developed for casual play. Competitive basketball is primarily an indoor sport played';
			const re = SearchUtils.contentRegexFromSearchTerm(content, true);

			expect(new RegExp(re, 'ui').test(content)).toBeTruthy();
		});
	});

	describe('extractMatchFromFragment', () => {
		test('Finds partial string', () => {
			const result = SearchUtils.extractMatchFromFragment('I like cake', [
				2,
				6,
			]);

			expect(result).toBe('like');
		});

		test('Finds entire string', () => {
			const str = 'I like cake';
			const match = [0, 11];
			const result = SearchUtils.extractMatchFromFragment(str, match);

			expect(result).toBe('I like cake');
		});
	});

	describe('contentRegexPartsForHit', () => {
		function hitWithFragments(frags) {
			return Hit.create({
				Type: 'Content',
				Fragments: Array.isArray(frags) ? frags : [frags],
			});
		}

		test('Will pull multiple matches from one fragment', () => {
			const hit = hitWithFragments({
				Matches: ['T<hit>he</hit> quick <hit>brown fox</hit>'],
			});
			const terms = SearchUtils.contentRegexPartsForHit(hit);

			expect(terms.length).toBe(2);
			expect(terms.includes('he')).toBeTruthy();
			expect(terms.includes('brown fox')).toBeTruthy();
		});

		test('Pulls from multiple fragments', () => {
			const hit = hitWithFragments([
				{
					Matches: ['T<hit>he</hit> quick <hit>brown fox</hit>'],
				},
				{
					Matches: ['See <hit>spot</hit> run'],
				},
			]);
			const terms = SearchUtils.contentRegexPartsForHit(hit);

			expect(terms.length).toBe(3);
			expect(terms.includes('he')).toBeTruthy();
			expect(terms.includes('brown fox')).toBeTruthy();
			expect(terms.includes('spot')).toBeTruthy();
		});

		test('Returns unique terms', () => {
			const hit = hitWithFragments([
				{
					Matches: ['The <hit>quick</hit> <hit>quick</hit> fox'],
				},
				{
					Matches: ['See quick <hit>spot</hit> run'],
				},
			]);
			const terms = SearchUtils.contentRegexPartsForHit(hit);

			expect(terms.length).toBe(2);
			expect(terms.includes('quick')).toBeTruthy();
			expect(terms.includes('spot')).toBeTruthy();
		});
	});

	//TODO rewrite this test to not use Ext.create
	describe.skip('contentRegexForSearchHit', () => {
		let MockSearchUtils;
		let MockTerms;

		test('Short ciruits for bad input', () => {
			let hit = Ext.create('NextThought.model.Hit', {
				Type: 'Content',
			});

			expect(SearchUtils.contentRegexForSearchHit(hit)).toBeFalsy();

			hit.set('Fragments', [{}]);
			hit.set('Type', 'Note');

			expect(SearchUtils.contentRegexForSearchHit(hit)).toBeFalsy();
		});

		beforeEach(() => {
			MockSearchUtils = Ext.create('NextThought.util.Search');
			MockTerms = ['cat', 'dog', 'plecostomus'];
			spyOn(MockSearchUtils, 'contentRegexPartsForHit').andReturn(
				MockTerms
			);
			spyOn(
				MockSearchUtils,
				'contentRegexFromSearchTerm'
			).andCallThrough();
		});

		test('Escapes each term', () => {
			let spy;

			expect(
				MockSearchUtils.contentRegexForSearchHit(null, true)
			).toBeTruthy();
			spy = MockSearchUtils.contentRegexFromSearchTerm;
			expect(spy.calls.length).toBe(MockTerms.length);
			for (let term of MockTerms) {
				expect(spy).toHaveBeenCalledWith(term, true);
			}
		});

		test('ORs the terms', () => {
			let re = MockSearchUtils.contentRegexForSearchHit(null, true);
			expect(re).toBeTruthy();

			for (let term of MockTerms) {
				expect(re.test(term)).toBeTruthy();
				re.lastIndex = 0; //reset it
			}

			expect(re.test('monkey')).toBeFalsy();
		});
	});
});
