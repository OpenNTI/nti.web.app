describe('Entry Link Tests',function(){
	var Entry, testBody, noop = function(){};

	beforeEach(function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
		Entry = Ext.create('NextThought.view.chat.log.Entry',{
			renderTo: testBody,
			afterRender: noop,
			initComponent: noop
		});
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});

	it('External Link',function(){
		var link = Entry.getHashChange('www.google.com','www.facebook.com');

		expect(link).toBeNull();
	});

	it('Internal Link',function(){
		var link = Entry.getHashChange('www.google.com#!newlink','www.google.com');

		expect(link).toBe('!newlink');
	})
});
