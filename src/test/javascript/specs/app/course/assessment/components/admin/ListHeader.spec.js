describe("Admin Header Tests", function (argument) {
	var testBody, noop = function(){};

	beforeEach(function(){
		//mock the testBody
		testBody = document.createElement("div");
		document.body.appendChild(testBody);
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});

	it('tests email button presence based on link', function() {
		var currentBundle = new NextThought.model.courses.CourseInstance({
				MimeType: "application/vnd.nextthought.courses.courseinstance",
				NTIID: "tag:nextthought.com,2011-10:Foo-bar-course",
				Links: [{
					Class: "Link",
					href: "/dataserver2/Foo-bar-course/Summer2015/Mail",
					rel: "Mail"
				}]
			}),
			listHeader = Ext.create('NextThought.app.course.assessment.components.admin.ListHeader', {
				currentBundle: currentBundle,
				renderTo : testBody,
				shouldAllowInstructorEmail: function(){
					return true;
				}
			}),
			emailEl = listHeader.emailEl;

		expect(emailEl && emailEl.isVisible()).toBe(true);
	});


	it('tests email button absence based on link', function() {
		var currentBundle = new NextThought.model.courses.CourseInstance({
				MimeType: "application/vnd.nextthought.courses.courseinstance",
				NTIID: "tag:nextthought.com,2011-10:Foo-bar-course",
				Links: [{}]
			}),
			listHeader = Ext.create('NextThought.app.course.assessment.components.admin.ListHeader', {
				currentBundle: currentBundle,
				renderTo : testBody,
				shouldAllowInstructorEmail: function(){
					return true;
				}
			}),
			emailEl = listHeader.emailEl;

		expect(emailEl && emailEl.isVisible()).toBe(false);
	});

	it('tests email record post link', function() {
		var currentBundle = new NextThought.model.courses.CourseInstance({
				MimeType: "application/vnd.nextthought.courses.courseinstance",
				NTIID: "tag:nextthought.com,2011-10:Foo-bar-course",
				Links: [{
					Class: "Link",
					href: "/dataserver2/Foo-bar-course/Summer2015/Mail",
					rel: "Mail"
				}]
			}),
			listHeader = Ext.create('NextThought.app.course.assessment.components.admin.ListHeader', {
				currentBundle: currentBundle,
				renderTo : testBody,
				shouldAllowInstructorEmail: function(){
					return true;
				}
			}),
			__cache = {},
			event = {getTarget: function(){}}, postURL;

		spyOn(listHeader.WindowStore, 'cacheObject').andCallFake(function(id, obj) {
			__cache[id] = {id: id, obj:obj};
		});

		spyOn(listHeader.WindowActions, 'showWindow').andCallFake(function(){});

		listHeader.showEmailEditor(event);
		
		emailRecord = __cache['new-email'] && __cache['new-email'].obj;

		expect(__cache['new-email'] && __cache['new-email'].id).toBe('new-email');
		expect(emailRecord && emailRecord.get('url')).toBe(currentBundle.getLink('Mail'));
	});
});