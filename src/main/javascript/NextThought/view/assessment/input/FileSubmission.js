Ext.define('NextThought.view.assessment.input.FileSubmission', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-filepart',

	cls: 'file-submission-part',

	inputTpl: Ext.DomHelper.markup({
		cn: [
			{ cls: 'label', html: '{label}' },
			{ tag: 'tpl', 'if': 'due', cn: { tag: 'time', cls: 'due', datetime: '{due:date("c")}', html: 'Due {due:date("l, F j")}'}},
			{ cls: 'submit button {enable:boolStr("","disabled")}', cn: ['Upload a File',
				 { tag: 'tpl', 'if': 'enable', cn: { tag: 'input', type: 'file', cls: 'file' }}
			]},
			{ tag: 'a', cls: 'download button', html: 'Download', target: '_blank' }
		]
	}),

	renderSelectors: {
		downloadBtn: 'a.button',
		submitBtn: '.submit.button',
		inputField: 'input[type=file]',
		dueEl: 'time.due',
		labelBoxEl: '.label'
	},


	initComponent: function() {
		this.renderData = Ext.apply(this.renderData || {}, {
			tabIndex: this.tabIndexTracker.getNext()
		});

		try {
			this.filereader = new FileReader();
			this.filereader.onload = Ext.bind(this.onFileLoaded, this);
		} catch (e) {
			this.filereader = false;
		}

		this.callParent(arguments);
	},


	onFileLoaded: function(event) {
		this.unmask();
		this.value.value = event.target.result;

		var me = this,
			q = this.questionSet,
			p = new Promise();

		p.done(function() {
			me.markSubmitted(new Date());
			me.markCorrect();
		}).fail(function(reason) {
			console.error(reason);
			me.markIncorrect();
		});

		if (q && q.tallyParts() === 1) {
			console.debug('Auto submitting...');
			q.fireEvent('do-submission', {stopEvent: Ext.emptyFn});
			//eventually pass promise down and let it be fulfilled when submission finishes
		//} else {
			//p.fulfill();//nothing to do.
		}
		p.fulfill();
	},


	beforeRender: function() {
		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.part.get('content'),
			enable: !!this.filereader
		});

		var q = this.questionSet,
			assignment = q && q.associatedAssignment;

		if (this.question.tallyParts() === 1) {
			this.up('assessment-question')
					.removeCls('question')
					.addCls('file-submission');
		}

		if (q && q.tallyParts() === 1) {
			Ext.defer(q.fireEvent, 1, q, ['hide-quiz-submission']);
			if (assignment) {
				this.renderData.due = assignment.getDueDate();
				this.renderData.label = assignment.get('title');
			}
		}

		this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);
		var reader = this.filereader,
			me = this;

		if (this.inputField) {
			this.mon(this.inputField, {
				scope: this,
				change: function(e) {
					var p = this.part,
						t = e.getTarget(),
						file = t.files[0],
						allowed = p.isFileAcceptable(file);

					me.value = {
						MimeType: 'application/vnd.nextthought.assessment.uploadedfile',
						filename: file.name
					};

					this[allowed ? 'reset' : 'markBad']();
					//p.reason;
					if (allowed) {
						me.mask();
						me.labelBoxEl.update(file.name);
						reader.readAsDataURL(file);
					}

				}
			});
		} else {
			this.mon(this.submitBtn, 'click', 'unsupported');
		}
	},


	unsupported: function() {
		alert('This browser does not support HTML5 file submission.');
	},


	getValue: function() {
		return this.value;
	},


	setValue: function(v) {
		/*
			filename
			download_url
			url
			value
		*/

		v = this.value = v || {};
		this.labelBoxEl.update(v.filename || 'Not Submitted');

		if (v.CreatedTime || v.filename) {
			this.markSubmitted(v.CreatedTime || new Date());
		} else {
			this.addCls('hide-buttons');
		}

		if (v.url) {
			this.downloadBtn.addCls('active');
			this.downloadBtn.set({
				href: v.download_url || v.url
			});
		}
	},


	markCorrect: Ext.emptyFn,
	markIncorrect: Ext.emptyFn,


	markSubmitted: function(date) {
		var q = this.questionSet,
			assignment = q && q.associatedAssignment;

		if (!assignment || assignment.getDueDate() > date) {
			this.addCls('good');
			this.dueEl.update('Submitted On-Time');
		} else {
			this.addCls('late');
			this.dueEl.update('Submitted Late');
		}
	},


	markBad: function() {
		this.labelBoxEl.update('That file is not acceptable. Please pick another.');
	},

	reset: function() {
		this.callParent(arguments);
	}
});
