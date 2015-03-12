describe('Forum Comments Paging Tests', function() {

	it('test getPageList when count is greater than maximum visible', function() {
		var pager = Ext.create('NextThought.view.forums.topic.parts.Pager', {MAX_VISIBLE: 5}),
			count = 10;

		expect(pager.getPageList(count, 1)).toEqual([1, 2, 3, 4, 5, 'last']);
		expect(pager.getPageList(count, 2)).toEqual([1, 2, 3, 4, 5, 'last']);
		expect(pager.getPageList(count, 3)).toEqual([1, 2, 3, 4, 5, 'last']);
		expect(pager.getPageList(count, 4)).toEqual(['first', 2, 3, 4, 5, 6, 'last']);
		expect(pager.getPageList(count, 8)).toEqual(['first', 6, 7, 8, 9, 10]);
		expect(pager.getPageList(count, 9)).toEqual(['first', 6, 7, 8, 9, 10]);
		expect(pager.getPageList(count, 10)).toEqual(['first', 6, 7, 8, 9, 10]);
	});

	it('test getPageList when count is less than maximum visible', function() {
		var pager = Ext.create('NextThought.view.forums.topic.parts.Pager', {MAX_VISIBLE: 6}),
			count = 4;

		expect(pager.getPageList(count, 1)).toEqual([1, 2, 3, 4]);
		expect(pager.getPageList(count, 2)).toEqual([1, 2, 3, 4]);
		expect(pager.getPageList(count, 3)).toEqual([1, 2, 3, 4]);
		expect(pager.getPageList(5, 5)).toEqual([1, 2, 3, 4, 5]);
	});
});
