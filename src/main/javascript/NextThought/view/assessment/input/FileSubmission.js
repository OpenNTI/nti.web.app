Ext.define('NextThought.view.assessment.input.FileSubmission', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-filepart',

	cls: 'file-submission',

	inputTpl: Ext.DomHelper.markup({
		cn: [
			{ html: '{label}' },
			{ tag: 'tpl', 'if': 'date', cn: { html: '{due}' }},
			{ tag: 'input', type: 'file', cls: 'file' }
		]
	}),

	renderSelectors: {
		inputField: 'input[type=file]'
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

				this[allowed ? 'reset' : 'markIncorrect']();
				//p.reason;
				if (allowed) {
					me.mask();
					reader.readAsDataURL(file);
				}

			}
		});
	},


	getValue: function() {
		return this.value;
	},


	setValue: function() {},


	markCorrect: function() {
		this.callParent(arguments);
		this.inputBox.removeCls('incorrect').addCls('correct');
	},


	markIncorrect: function() {
		this.callParent(arguments);
		this.inputBox.removeCls('correct').addCls('incorrect');
	},


	reset: function() {
		this.callParent(arguments);
		this.inputBox.removeCls(['incorrect', 'correct']);
	}
});
