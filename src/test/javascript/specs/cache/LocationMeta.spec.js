describe('LocationMeta tests', function() {

	var LM;

	beforeEach(function() {
		LM = Ext.Object.chain(NextThought.cache.LocationMeta);
	});

	describe('bookPrefixIfQuestion', function() {
		var qid = 'tag:nextthought.com,2011-10:PRMIA-NAQ-PRMIA_RiskCourse.naq.1';

		it('Works for question ids', function() {
			var expected = 'tag:nextthought.com,2011-10:PRMIA-HTML-PRMIA_RiskCourse';
			expect(LM.bookPrefixIfQuestion(qid)).toBe(expected);
		});
	});

	describe('findTitleWithPrefix', function() {

		it('Returns entry with prefix', function() {
			var found = LM.findTitleWithPrefix('tag:nextthought.com,2011-10:test-HTML-book');
			expect(found).toBeTruthy();
		});

		it('Returns falsy for no match', function() {
			expect(LM.findTitleWithPrefix('foobar')).toBeFalsy();
		});
	});
});
