Ext.define('NextThought.view.assessment.input.FileSubmission', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-filepart',

	inputTpl: Ext.DomHelper.markup({
		tag: 'input',
		type: 'file',
		cls: 'file'
	}),

	renderSelectors: {
		inputField: 'input[type=file]'
	},


	initComponent: function() {
		this.renderData = Ext.apply(this.renderData || {}, {
			tabIndex: this.tabIndexTracker.getNext()
		});

		this.reader = new FileReader();
		this.reader.onload = Ext.bind(this.onFileLoaded, this);

		this.callParent(arguments);
	},


	onFileLoaded: function(event) {
		this.unmask();
		this.value.value = event.target.result;
	},


	beforeRender: function() {
		if (this.question.tallyParts() === 1) {
			this.up('assessment-question')
					.removeCls('question')
					.addCls('file-submission');
		}

		if (this.questionSet && this.questionSet.tallyParts() === 1) {
			this.questionSet.fireEvent('hide-quiz-submission');
		}

		this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);
		var reader = this.reader,
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
