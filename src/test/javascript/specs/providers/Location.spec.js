describe('Library Store', function() {

	function isTopicElement(v) {
		expect(v).toBeTruthy();
		expect(v && v.tagName).toBeTruthy();
		expect(v && v.tagName).toBe('topic');
	}

	beforeEach(function() {

		//fake loading courses
		availableStore = Ext.create('Ext.data.Store', {
			fields: [
				{name: 'firstName', type: 'string'},
				{name: 'lastName',  type: 'string'},
				{name: 'age',       type: 'int'},
				{name: 'eyeColor',  type: 'string'}
			],
			storeId: 'courseware.AvailableCourses',
			onceLoaded: function() {
				return Promise.resolve();
			}
		});

		administeredStore = Ext.create('Ext.data.Store', {
			fields: [
				{name: 'firstName', type: 'string'},
				{name: 'lastName',  type: 'string'},
				{name: 'age',       type: 'int'},
				{name: 'eyeColor',  type: 'string'}
			],
			storeId: 'courseware.AdministeredCourses',
			onceLoaded: function() {
				return Promise.resolve();
			}
		});

		enrolledStore = Ext.create('Ext.data.Store', {
			fields: [
				{name: 'firstName', type: 'string'},
				{name: 'lastName',  type: 'string'},
				{name: 'age',       type: 'int'},
				{name: 'eyeColor',  type: 'string'}
			],
			storeId: 'courseware.EnrolledCourses',
			onceLoaded: function() {
				return Promise.resolve();
			}
		});

		Library.clearListeners(); //don't invoke the UI
		Library.getStore().removeAll();
		Library.load();

		waitsFor(
			function() { return Library.loaded; },
			'Library load never completed',
			4000
		);
	});


	it('can determine navigation', function() {
		var n = ContentUtils.getNavigationInfo('tag:nextthought.com,2011-10:test-HTML-book2-1-1');
		expect(n).toBeTruthy();
		expect(n.value.next).toBe('tag:nextthought.com,2011-10:test-HTML-book2-1-2');
		expect(n.value.previous).toBe('tag:nextthought.com,2011-10:test-HTML-book2-1-0');
	});


	it('can find the section', function() {
		var l = ContentUtils.find('tag:nextthought.com,2011-10:test-HTML-book2-1-1');
		expect(l).toBeTruthy();
		expect(l.toc).toBeTruthy();
		expect(l.NTIID).toBeTruthy();
		expect(l.ContentNTIID).toBeTruthy();
		expect(typeof l.NTIID === 'string').toBeTruthy();
		expect(typeof l.ContentNTIID === 'string').toBeTruthy();

		expect(Object.prototype.toString.call(l.toc)).toMatch('[object(.*?)+Document]');
		expect(Object.prototype.toString.call(l.location)).toBe('[object Element]');

		isTopicElement(l.location);
	});




	it('can find the title of the section', function() {
		expect(ContentUtils.findTitle('tag:nextthought.com,2011-10:test-HTML-book1-1-1')).toBe('section b');
	});



	it('can find the title of the book', function() {
		var t = Library.getTitle('/book2/eclipse-toc.xml');
		expect(t.get('title')).toBe('book2');
	});


	it('can handle Structured NTI IDs', function() {
		expect(ContentUtils.find('tag:nextthought.com,2011-07-14:AOPS-HTML-prealgebra-69')).toBeTruthy();
	});
});
