const Ext = require('extjs');
const Globals = require('../../../util/Globals');
const {AssetIcon} = require('nti-web-commons');
require('legacy/app/MessageBox');

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
						{html: '{label}'},
						{html: '{maxSize}'}
					]},
					{cls: 'button-container', cn: [
						{cls: 'button', html: 'Upload a File'}
					]}
				]},
				{cls: 'preview-wrapper', cn: [
					{cls: 'preview', cn: [
						{cls: 'thumbnail'},
						{cls: 'meta', cn: [
							{cls: 'text', cn: [
								{tag:'span', cls: 'name', html: 'Name'},
								{tag: 'span', cls: 'size', html: 'Size'}
							]},
							{cls: 'controls', cn: [
								{tag: 'span', cls: 'link preview-link', cn: [
									{tag: 'a', href: '', target: '_blank', html: 'Preview'}
								]},
								{tag: 'span', cls: 'link change-link', html: 'Change', cn: [
									{tag: 'input', type: 'file', cls: 'hidden', title: 'Change File', tabindex: '1'}
								]}
							]},
							{cls: 'clear'}
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
					{tag: 'input', type: 'file', cls: 'hidden', title: 'Upload File', tabindex: '1'}
				]}
			]}
		]
	}),

	renderSelectors: {
		inputContainer: '.input-container',
		downloadBtn: 'a.button',
		submitBtn: '.submit.button',
		inputField: '.input-wrapper input[type=file]',
		changeInputField: '.change-link input[type=file]',
		labelBoxEl: '.label',
		previewEl: '.preview',
		deleteEl: '.preview .meta .clear',
		progressEl: '.preview-wrapper .progress',
		previewNameEl: '.preview .meta .name',
		previewSizeEl: '.preview .meta .size',
		previewImageEl: '.preview .thumbnail',
		changeInputEl: '.change-link input[type=file]',
		dropZoneEl:'.drop-zone'
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


	beforeRender: function () {
		if (this.question.tallyParts() === 1) {
			this.up('assessment-question')
					.removeCls('question')
					.addCls('file-submission');
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.getDefaultTitle(),
			maxSize: this.getMaxSizeLabel(),
			enable: !!this.filereader
		});

		this.callParent(arguments);
	},


	getDefaultTitle: function () {
		const extensionList = this.getExtensionDisplayList();
		let text = '';

		if (extensionList !== '') {
			text = 'Upload your ' + extensionList + ' here';
		}
		else {
			text = 'Upload your file here';
		}

		return text;
	},


	getExtensionDisplayList: function () {
		let extensions = Ext.clone(this.part.get('AllowedExtentions') || []);
		if (extensions.length > 1) {
			let p2 = extensions.splice(-1);
			extensions = extensions.join(', ') + ' or ' + p2[0];
		}
		else if (extensions.length === 1) {
			extensions = extensions[0];
			if (extensions[0] === '*/*') {
				extensions = '';
			}
		}
		else {
			extensions = '';
		}

		return extensions;
	},


	getMaxSizeLabel: function () {
		const m = this.getDisplayMaxSize();
		let maxSize = '';
		if (m) {
			maxSize = 'Maximum file size is ' + m;
		}
		return maxSize;
	},


	getDisplayMaxSize: function () {
		let maxSize = this.part.get('MaxFileSize');
		const FileUtils = NextThought.common.form.fields.FilePicker;
		maxSize = FileUtils.getHumanReadableFileSize(maxSize, 1);
		return maxSize;
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

		this.on('destroy', this.cleanUpObjectURL.bind(this));
	},

	unsupported: function () {
		alert(getString('NextThought.view.assessment.input.FileSubmission.unsupported-feature'));
	},

	attachInputListeners () {
		const input = this.inputField && this.inputField.dom;
		const changeInput = this.changeInputField && this.changeInputField.dom;

		if (input) {
			input.addEventListener('change', this.onFileInputChange.bind(this));
			input.addEventListener('dragenter', this.onDragEnter.bind(this));
			input.addEventListener('dragover', this.onDragEnter.bind(this));
			input.addEventListener('dragleave', this.onDragLeave.bind(this));
			input.addEventListener('drop', this.onDragLeave.bind(this));
		}
		if (changeInput) {
			changeInput.addEventListener('change', this.onFileInputChange.bind(this));
		}
	},

	removeInputListeners: function () {
		const input = this.inputField && this.inputField.dom;
		const changeInput = this.changeInputField && this.changeInputField.dom;

		if (input) {
			input.removeEventListener('change', this.onFileInputChange.bind(this));
			input.removeEventListener('dragenter', this.onDragEnter.bind(this));
			input.removeEventListener('dragleave', this.onDragLeave.bind(this));
			input.removeEventListener('drop', this.onDragLeave.bind(this));
		}
		if (changeInput) {
			changeInput.removeEventListener('change', this.onFileInputChange.bind(this));
		}
	},


	onFileInputChange: function (e) {
		console.debug('New file was uploaded...', e);

		const p = this.part;
		const file = e.target.files[0];
		const allowed = p.isFileAcceptable(file);
		this[allowed ? 'reset' : 'markBad']();

		e.preventDefault();
		e.stopPropagation();

		if (allowed && file) {
			// this.el.mask('Uploading...');
			this.value = {
				MimeType: 'application/vnd.nextthought.assessment.uploadedfile',
				filename: file.name
			};

			this.setUploadedNotSubmitted(file);
			this.filereader.readAsDataURL(file);
		}
	},


	updateProgress: function () {
		// TODO: we will use the componet from the Asset Manager to show progress.
		console.log('TODO: show File upload Progress');
	},


	onLoadStart: function () {
		this.showPreview();
		this.previewEl.addCls('uploading');
	},


	onFileLoaded: function (event) {
		this.value.value = event.target.result;

		this.saveProgress();
		this.previewEl.removeCls('uploading');
		this.markCorrect();
	},


	setPreviewFromInput: function (file) {
		const FileUtils = NextThought.common.form.fields.FilePicker;
		const size = FileUtils.getHumanReadableFileSize(file.size, 1);
		// const href = this.createObjectURL(file);

		this.previewNameEl.update(file.name);
		this.previewSizeEl.update('(' + size + ')');

		// Remove current content.
		this.previewImageEl.setHTML('');

		Ext.widget({
			xtype: 'react',
			component: AssetIcon,
			mimeType: file.type || file.contentType,
			svg: true,
			renderTo: this.previewImageEl
		});
	},


	showPreview: function () {
		this.inputContainer.removeCls('no-file');
		this.inputContainer.removeCls('file-over');
		this.inputContainer.addCls('has-file');
	},


	createObjectURL: function (file) {
		var url = Globals.getURLObject();

		this.cleanUpObjectURL();

		if (!url) { return null; }

		this.objectURL = url.createObjectURL(file);

		return this.objectURL;
	},


	cleanUpObjectURL: function () {
		var url = Globals.getURLObject();

		if (this.objectURL && url) {
			url.revokeObjectURL(this.objectURL);
			delete this.objectURL;
		}
	},


	onDragEnter: function () {
		this.inputContainer.removeCls('no-file');
		this.inputContainer.addCls('file-over');
		this.dragging = true;
	},


	onDragLeave: function () {
		this.inputContainer.addCls('no-file');
		this.inputContainer.removeCls('file-over');
	},


	clearView: function () {
		this.inputContainer.addCls('no-file');
		this.inputContainer.removeCls('has-file');
		this.inputContainer.removeCls('file-over');
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
					me.clearView();
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
			this.value = v;
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
		this.addCls('not-submitted');
		console.debug('Uploaded but not submitted. Value: ', v);
		this.showPreview();
		this.setPreviewFromInput(v);
	},


	setFileSubmitted: function (v) {
		v = v || {};

		this.value = v;
		this.showPreview();
		this.setPreviewFromInput(v);

		this.removeCls('not-submitted');
		// this.setDownloadButton(v.download_url || v.url);
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
		const allowedList = this.getExtensionDisplayList();
		const accepts = allowedList !== '' ? 'You can only upload ' + allowedList + '. ' : '';
		const msg = 'The file selected is not acceptable. ' + accepts;

		alert({title: 'Attention', msg: msg, icon: 'warning-red'});
	},

	reset: function () {
		var dontSetBack;

		this.setNotUploaded();

		this.removeCls('has-file');

		dontSetBack = true;

		this.callParent(arguments);

		return dontSetBack;
	}
});
