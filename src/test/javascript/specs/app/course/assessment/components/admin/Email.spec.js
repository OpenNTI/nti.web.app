describe("Instructor Email Tests", function () {
	var testBody, noop = function(){};

	beforeEach(function(){
		//mock the testBody
		testBody = document.createElement("div");
		document.body.appendChild(testBody);
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});

	it('test initial scope/receiver set', function(){
		var scope = 'ForCredit',
		 	emailRecord = NextThought.model.Email.create({
				url: '/dataserver2/foo-bar-course/mail',
				scope: scope
			}),
			emailWin = Ext.create('NextThought.app.course.assessment.components.admin.email.Window', {
				record: emailRecord,
				renderTo: testBody
			}), 
			editor = emailWin.editor,
			scopeEl;

		scopeEl = editor.el.down('.receiver .token');
		expect(scopeEl && scopeEl.dom.innerText)
			.toBe(editor.RECEIVER_MAP[scope]);
	});

	it('test sending valid email', function(){
		var scope = 'ForCredit',
		 	emailRecord = NextThought.model.Email.create({
				url: '/dataserver2/foo-bar-course/mail',
				scope: scope
			}),
			emailWin = Ext.create('NextThought.app.course.assessment.components.admin.email.Window', {
				record: emailRecord,
				renderTo: testBody
			}), 
			editor = emailWin.editor,
			title = "Test Email Title",
			body = "Test the body. Thanks.",
			titleInputEl = editor.titleEl,
			bodyInputEl = editor.titleEl,
			c = editor.el.down('.content'),
			e = {stopEvent: function(){}},
			postRecord
			b = document.createElement('div');

		editor.presentSuccessMessage = function(){};

		if (titleInputEl && titleInputEl.dom) {
			titleInputEl.dom.value = title;	
		}

		b.innerText = body;
		if (c && c.dom) {
			c.dom.appendChild(b);
		}

		spyOn(editor.EmailActions, 'sendEmail').andCallFake(function(record){
			postRecord = record;
			return Promise.resolve();
		});
		
		editor.onSave(e);
		expect(postRecord && postRecord.get('Body')).toBe(body);
		expect(postRecord && postRecord.get('Subject')).toBe(title);
	});
});