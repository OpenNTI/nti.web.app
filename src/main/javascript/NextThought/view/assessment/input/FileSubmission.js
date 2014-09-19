Ext.define('NextThought.view.assessment.input.FileSubmission', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-filepart',

	cls: 'file-submission-part',

	reapplyProgress: true,

	inputTpl: Ext.DomHelper.markup({
		cn: [
			{cls: 'label-container', cn: [
				{cls: 'label', html: '{label}'},
				{cls: 'meta', cn: [
					{tag: 'time', cls: 'due', datatime: '{due:date("c")}', cn: {
						tag: 'tpl', 'if': 'due', html: 'Due {due:date("l, F j")}'
					}},
					{tag: 'span', cls: 'has-file not-submitted delete', html: 'Delete'}
				]}
			]},
			{cls: 'button-container', cn: [
				{cls: 'submit button no-file not-submitted', cn: [
					'{{{NextThought.view.assessment.input.FileSubmission.upload}}}',
					{tag: 'tpl', 'if': 'enable', cn: {tag: 'input', type: 'file', cls: 'file'}}
				]},
				{tag: 'a', cls: 'download button has-file', html: '{{{NextThought.view.assessment.input.FileSubmission.download}}}', target: '_blank'}
			]}
		]
	}),

	renderSelectors: {
		downloadBtn: 'a.button',
		submitBtn: '.submit.button',
		inputField: 'input[type=file]',
		dueEl: 'time.due',
		labelBoxEl: '.label',
		deleteEl: '.delete'
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
		this.value.value = event.target.result;

		this.saveProgress();

		this.setUploadedNotSubmitted(this.value);
		this.markCorrect();
	},


	beforeRender: function() {
		var q = this.questionSet,
			assignment = q && q.associatedAssignment;

		if (this.question.tallyParts() === 1) {
			this.up('assessment-question')
					.removeCls('question')
					.addCls('file-submission');
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.part.get('content'),
			enable: !!this.filereader,
			due: assignment.getDueDate()
		});

		this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.dueString = this.dueEl.getHTML();

		if (this.inputField) {
			this.monitor();
		} else {
			this.mon(this.submitBtn, 'click', 'unsupported');
		}

		this.setNotUploaded();

		this.mon(this.deleteEl, 'click', 'deleteFile');
	},


	monitor: function() {
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

				if (allowed) {
					me.el.mask('Uploading...');
					me.setLabel(file.name);
					reader.readAsDataURL(file);
				}
				//reset it to be clickable again
				t = Ext.DomHelper.insertAfter(me.inputField, { tag: 'input', type: 'file', cls: 'file' }, true);
				me.inputField.remove();
				me.inputField = t;
				me.monitor();
			}
		});
	},


	unsupported: function() {
		alert(getString('NextThought.view.assessment.input.FileSubmission.unsupported-feature'));
	},


	deleteFile: function() {
		var me = this,
			name = me.value.filename;

		Ext.Msg.show({
			msg: 'You are about to delete ' + name + '.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: this,
			icon: 'warning-red',
			buttonText: {
				'ok': 'caution:Delete',
				'cancel': 'Cancel'
			},
			title: 'Are you sure?',
			fn: function(str) {
				if (str === 'ok') {
					delete me.value;
					me.el.mask('Deleting...');
					me.saveProgress();
				}
			}
		});
	},


	getValue: function() {
		return this.value;
	},


	setProgress: function(v) {
		this.unmask();

		if (v) {
			this.setUploadedNotSubmitted(v);
		} else {
			this.setNotUploaded();
		}
	},

	setValue: function(v) {
		/*
		We're expecting a RAW object here. Not a model. So the times will be the raw timestamps.
			CreatedTime
			filename
			download_url
			url
			value
		*/
		this.setFileSubmitted(v);
	},


	setNotUploaded: function() {
		this.value = null;

		this.setLabel(this.renderData.label);
		this.setDownloadButton();
		this.dueEl.update(this.dueString);
		this.addCls('not-submitted');
		this.removeCls(['late', 'good']);
	},


	setUploadedNotSubmitted: function(v) {
		v = v || {};

		var q = this.questionSet,
			date = Ext.Date.parse(v.CreatedTime, 'timestamp') || new Date(),
			assignment = q && q.associatedAssignment;

		this.value = v;

		if (v.filename) {
			this.setLabel(v.filename);
		}

		this.addCls('not-submitted');

		this.setDue(!assignment || assignment.getDueDate() > date);

		this.setDownloadButton(v.download_url || v.url);
	},


	setFileSubmitted: function(v) {
		v = v || {};

		var q = this.questionSet,
			date = Ext.Date.parse(v.CreatedTime, 'timestamp') || new Date(),
			assignment = q && q.associatedAssignment;

		this.value = v;

		if (v.filename) {
			this.setLabel(v.filename);
		}

		this.removeCls('not-submitted');

		this.setDue(!assignment || assignment.getDueDate() > date);

		this.setDownloadButton(v.download_url || v.url);
	},


	setLabel: function(label) {
		this.labelBoxEl.update(label);

		if (label && label !== this.renderData.label) {
			this.labelBoxEl.set({
				'data-qtip': label
			});
		}
	},


	setDue: function(onTime) {
		if (onTime) {
			this.addCls('good');
			this.dueEl.update(getString('NextThought.view.assessment.input.FileSubmission.on-time'));
		} else {
			this.addCls('late');
			this.dueEl.update(getString('NextThought.view.assessment.input.FileSubmission.late'));
		}
	},


	setDownloadButton: function(url) {
		if (url) {
			this.addCls('has-file');
			this.removeCls('no-file');
			this.downloadBtn.addCls('active');
			this.downloadBtn.set({
				href: url
			});
		} else {
			this.removeCls('has-file');
			this.addCls('no-file');
			this.downloadBtn.removeCls('active');
		}
	},


	markCorrect: Ext.emptyFn,
	markIncorrect: Ext.emptyFn,


	markUploaded: function(date, doNotDisable) {
		var q = this.questionSet,
			assignment = q && q.associatedAssignment;

		if (!doNotDisable) {
			this.addCls('disabled');
		}

		if (!assignment || assignment.getDueDate() > date) {
			this.addCls('good');
			this.dueEl.update(getString('NextThought.view.assessment.input.FileSubmission.on-time'));
		} else {
			this.addCls('late');
			this.dueEl.update(getString('NextThought.view.assessment.input.FileSubmission.late'));
		}
	},


	markBad: function() {
		this.labelBoxEl.update(getString('NextThought.view.assessment.input.FileSubmission.unsupported-type'));
	},

	reset: function() {
		var dontSetBack,
			q = this.questionSet;

		this.removeCls('has-file');
		this.addCls('not-submitted');
		this.setLabel(this.renderData.label);
		this.dueEl.update(this.dueString);

		this.downloadBtn.removeCls('active');
		dontSetBack = true;

		this.callParent(arguments);

		return dontSetBack;
	}
});
