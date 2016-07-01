const Ext = require('extjs');
require('legacy/common/form/fields/FilePicker');
require('./Base');


module.exports = exports = Ext.define('NextThought.app.assessment.input.FileSubmission', {
	extend: 'NextThought.app.assessment.input.Base',
	alias: 'widget.question-input-filepart',

	cls: 'file-submission-part',

	reapplyProgress: true,

	inputTpl: Ext.DomHelper.markup({
		cn: [
			{cls: 'input-container no-file', cn: [
				{cls: 'drop', cn: [
					{cls: 'label-container', cn: [
						{html: 'Upload your file here.'},
						{html: 'Maximum file size is {maxSize}'}
					]},
					{cls: 'button-container', cn: [
						{cls: 'button', html: 'Upload a File'}
					]}
				]},
				{cls: 'preview-wrapper', cn: [
					{cls: 'preview', cn: [
						{cls: 'thumbnail', html: 'image thumbnail'},
						{cls: 'meta', cn: [
							{cls: 'text', cn: [
								{tag:'span', cls: 'name', html: 'Name'},
								{tag: 'span', cls: 'size', html: 'Size'}
							]},
							{cls: 'controls', cn: [
								{tag: 'span', cls: 'link preview-link', cn: [
									{tag: 'a', href: '', target: '_blank', html: 'Preview'}
								]},
								{tag: 'span', cls: 'link change-link', html: 'Change'}
							]}
						]}
					]},
					{cls: 'progress', cn: [
						{tag: 'span', html: 'progress goes here'}
					]}
				]},
				{cls: 'drop-zone', cn: [
					{cls: 'button-container', cn: [
						{cls: 'button', html: 'Drop Files Here to Upload Them.'}
					]}
				]},
				{tag: 'span', cls: 'input-wrapper', cn: [
					{tag: 'input', type: 'file', title: 'Upload File', tabindex: '1'}
				]}
			]}
		]
	}),

	renderSelectors: {
		inputContainer: '.input-container',
		downloadBtn: 'a.button',
		submitBtn: '.submit.button',
		inputField: 'input[type=file]',
		labelBoxEl: '.label',
		deleteEl: '.delete',
		progressEl: '.preview-wrapper .progress',
		previewNameEl: '.preview .meta .name',
		previewSizeEl: '.preview .meta .size',
		previewImageEl: '.preview .thumbnail'
	},


	initComponent: function () {
		this.renderData = Ext.apply(this.renderData || {}, {
			tabIndex: this.tabIndexTracker.getNext()
		});

		try {
			this.filereader = new FileReader();
			this.filereader.onload = this.onFileLoaded.bind(this);
			this.filereader.onprogress = this.updateProgress.bind(this);
			this.filereader.onloadstart = this.onLoadStart.bind(this);
		} catch (e) {
			this.filereader = false;
		}

		this.callParent(arguments);
	},


	onFileLoaded: function (event) {
		this.value.value = event.target.result;

		this.saveProgress();

		this.setUploadedNotSubmitted(this.value);
		this.markCorrect();
	},


	beforeRender: function () {
		var q = this.questionSet,
			assignment = q && q.associatedAssignment;

		if (this.question.tallyParts() === 1) {
			this.up('assessment-question')
					.removeCls('question')
					.addCls('file-submission');
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.part.get('content') || assignment.get('title'),
			enable: !!this.filereader
		});

		this.callParent(arguments);
	},


	afterRender: function () {
		this.callParent(arguments);

		this.attachInputListeners();

		if (this.submitBtn) {
			this.mon(this.submitBtn, 'click', 'unsupported');
		}

		this.setNotUploaded();

		if (this.deleteEl) {
			this.mon(this.deleteEl, 'click', 'deleteFile');
		}
	},

	unsupported: function () {
		alert(getString('NextThought.view.assessment.input.FileSubmission.unsupported-feature'));
	},

	attachInputListeners () {
		var input = this.inputField && this.inputField.dom;

		if (input) {
			input.addEventListener('change', this.onFileInputChange.bind(this));
			input.addEventListener('dragenter', this.onDragEnter.bind(this));
			input.addEventListener('dragleave', this.onDragLeave.bind(this));
			input.addEventListener('drop', this.onDragLeave.bind(this));
		}
	},


	onFileInputChange: function (e) {
		console.debug('New file was uploaded...', e);

		const p = this.part;
		const file = e.target.files[0];
		const allowed = p.isFileAcceptable(file);
		this[allowed ? 'reset' : 'markBad']();

		if (allowed) {
			this.el.mask('Uploading...');

			this.value = {
				MimeType: 'application/vnd.nextthought.assessment.uploadedfile',
				filename: file.name
			};

			this.setLabel(file.name);
			this.filereader.readAsDataURL(file);
		}
	},


	updateProgress: function (evt) {
		const progress = this.progressEl && this.progressEl.dom;
		if (evt.lengthComputable) {
			let percentLoaded = Math.round((evt.loaded / evt.total) * 100);
			// Increase the progress bar length.
			if (percentLoaded < 100) {
				progress.style.width = percentLoaded + '%';
				progress.textContent = percentLoaded + '%';
				console.log('File upload Progress: ' + percentLoaded + '%');
			}
		}
	},


	onLoadStart: function (e) {
		const progress = this.progressEl && this.progressEl.dom;
		this.inputContainer.removeCls('no-file');
		this.inputContainer.removeCls('file-over');
		this.inputContainer.addCls('has-file');

		progress.style.width = '0%';
		progress.textContent = '0%';
	},


	onDragEnter: function () {
		this.inputContainer.removeCls('no-file');
		this.inputContainer.removeCls('has-file');
		this.inputContainer.addCls('file-over');
	},


	onDragLeave: function () {
		this.inputContainer.removeCls('file-over');
		this.inputContainer.addCls('no-file');
	},


	deleteFile: function () {
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
			fn: function (str) {
				if (str === 'ok') {
					delete me.value;
					me.el.mask('Deleting...');
					me.saveProgress();
					me.disableSubmission();
				}
			}
		});
	},


	getValue: function () {
		return this.value;
	},


	setProgress: function (v) {
		this.unmask();

		if (v) {
			this.setUploadedNotSubmitted(v);
		} else {
			this.setNotUploaded();
		}
	},

	setValue: function (v) {
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


	setNotUploaded: function () {
		this.value = null;

		this.setLabel(this.renderData.label);
		this.setDownloadButton();
		this.addCls('not-submitted');
		this.removeCls(['late', 'good']);
	},


	setUploadedNotSubmitted: function (v) {
		v = v || {};

		var q = this.questionSet,
			assignment = q && q.associatedAssignment;

		this.value = v;

		if (v.filename) {
			this.setLabel(v.filename);
			this.setSubText(true);
		}

		this.addCls('not-submitted');


		// this.setDownloadButton(v.download_url || v.url);
	},


	setFileSubmitted: function (v) {
		v = v || {};

		var q = this.questionSet,
			assignment = q && q.associatedAssignment;

		this.value = v;

		if (v.filename) {
			this.setLabel(v.filename);
			this.setSubText();
		}

		this.removeCls('not-submitted');


		this.setDownloadButton(v.download_url || v.url);
	},


	setLabel: function (label) {
		console.debug('File Submission: Label => ' + label);
		// this.labelBoxEl.update(label);

		// if (label && label !== this.renderData.label) {
		// 	this.labelBoxEl.set({
		// 		'data-qtip': label
		// 	});
		// }
	},


	setSubText: function (uploadedNotSubmitted) {
		// if (uploadedNotSubmitted) {
		// 	this.dueEl.update('Ready for Submission');
		// } else {
		// 	this.dueEl.update('');
		// }
	},


	setDownloadButton: function (url) {
		// if (url) {
		// 	this.addCls('has-file');
		// 	this.removeCls('no-file');
		// 	this.downloadBtn.addCls('active');
		// 	this.downloadBtn.set({
		// 		href: url
		// 	});
		// } else {
		// 	this.removeCls('has-file');
		// 	this.addCls('no-file');
		// 	this.downloadBtn.removeCls('active');
		// }
	},


	markCorrect: Ext.emptyFn,
	markIncorrect: Ext.emptyFn,


	markUploaded: function (date, doNotDisable) {
		var q = this.questionSet,
			assignment = q && q.associatedAssignment;

		if (!doNotDisable) {
			this.addCls('disabled');
		}

		// if (!assignment || assignment.getDueDate() > date) {
		// 	this.addCls('good');
		// 	this.dueEl.update(getString('NextThought.view.assessment.input.FileSubmission.on-time'));
		// } else {
		// 	this.addCls('late');
		// 	this.dueEl.update(getString('NextThought.view.assessment.input.FileSubmission.late'));
		// }
	},


	markBad: function () {
		console.error(getString('NextThought.view.assessment.input.FileSubmission.unsupported-type'));
		// this.labelBoxEl.update(getString('NextThought.view.assessment.input.FileSubmission.unsupported-type'));
	},

	reset: function () {
		var dontSetBack,
			q = this.questionSet;

		this.setNotUploaded();

		this.removeCls('has-file');

		dontSetBack = true;

		this.callParent(arguments);

		return dontSetBack;
	}
});
