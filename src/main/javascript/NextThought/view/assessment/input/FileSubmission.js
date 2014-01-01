Ext.define('NextThought.view.assessment.input.FileSubmission', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-filepart',

	cls: 'file-submission-part',

	inputTpl: Ext.DomHelper.markup({
		cn: [
			{ cls: 'label', html: '{label}' },
			{ tag: 'tpl', 'if': 'due', cn: { tag: 'time', cls: 'due', datetime: '{due:date("c")}', html: 'Due {due:date("l, F j")}'}},
			{ cls: 'submit button', cn: ['Upload a File',
				{ tag: 'input', type: 'file', cls: 'file' }
			]},
			{ tag: 'a', cls: 'download button', html: 'Download', target: '_blank' }
		]
	}),

	renderSelectors: {
		downloadBtn: 'a.button',
		inputField: 'input[type=file]',
		dueEl: 'time.due',
		labelBoxEl: '.label'
	},


	initComponent: function() {
		this.renderData = Ext.apply(this.renderData || {}, {
			tabIndex: this.tabIndexTracker.getNext()
		});

		this.filereader = new FileReader();
		this.filereader.onload = Ext.bind(this.onFileLoaded, this);

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
			label: this.part.get('content')
		});

		var q = this.questionSet,
			assignment = q && q.associatedAssignment;

		if (this.question.tallyParts() === 1) {
			this.up('assessment-question')
					.removeCls('question')
					.addCls('file-submission');
		}

		if (q && q.tallyParts() === 1) {
			q.fireEvent('hide-quiz-submission');
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
	},


	getValue: function() {
		return this.value;
	},


	setValue: function(v) {
		/*
		filename: "build.xml"
		url:
		value: url
		*/
		this.value = v;
		this.labelBoxEl.update(v.filename);
		this.markCorrect();
		this.markSubmitted(v.CreatedTime || new Date());
		this.downloadBtn.set({
			href: v.url
		});
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
