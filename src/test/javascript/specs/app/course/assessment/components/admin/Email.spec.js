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

		scopeEl = editor.el.down('.receiver .field');
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


	it('tests instructor to individual student email', function() {
		var student = NextThought.model.User({
				'realname': 'Test User1',
				'NTIID': 'Foo-bar_User'
			}),
		 	emailRecord = NextThought.model.Email.create({
				url: '/dataserver2/foo-bar-course/student/mail',
				receiver: student,
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

	it('changes scope from Open to All students', function(){
		var scope = 'Open',
		 	emailRecord = NextThought.model.Email.create({
				url: '/dataserver2/foo-bar-course/mail',
				scope: scope
			}),
			emailWin = Ext.create('NextThought.app.course.assessment.components.admin.email.Window', {
				record: emailRecord,
				renderTo: testBody
			}), 
			editor = emailWin.editor, 
			item = {text: 'All Students', studentFilter: 'All'};

		expect(emailRecord.get('scope')).toBe('Open');
		editor.receiverScopeChanged(item);
		expect(emailRecord.get('scope')).toBe('All');
	});

	it('changes scope from Open to All students, then checks allow reply checkbox', function(){
		var scope = 'Open',
		 	emailRecord = NextThought.model.Email.create({
				url: '/dataserver2/foo-bar-course/mail',
				scope: scope
			}),
			emailWin = Ext.create('NextThought.app.course.assessment.components.admin.email.Window', {
				record: emailRecord,
				renderTo: testBody
			}), 
			editor = emailWin.editor, 
			item = {text: 'All Students', studentFilter: 'All'},
			e = {target: {checked: true}};

		expect(emailRecord.get('replyScope')).toBeFalsy();
		editor.receiverScopeChanged(item);

		editor.replyCheckboxClicked(e);
		expect(emailRecord.get('NoReply')).toBeFalsy();
		expect(emailRecord.get('replyScope')).toBe('ForCredit');
	});
});