const Ext = require('extjs');
const {AssetIcon, ProgressBar} = require('nti-web-commons');

const Globals = require('legacy/util/Globals');
const {getString} = require('legacy/util/Localization');
const FilePicker = require('legacy/common/form/fields/FilePicker');

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
					{cls: 'progress'}
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

	emptySubmissionTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ cls: 'empty-submission', cn: [
			{cls: 'icon'},
			{cls: 'title', html: 'Submitted Assignment Without Adding a File'}
		]}
	])),

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
		dropZoneEl:'.drop-zone',
		previewLinkEl: '.preview .controls .preview-link a'
	},


	initComponent: function () {
		this.renderData = Ext.apply(this.renderData || {}, {
			tabIndex: this.tabIndexTracker.getNext()
		});

		try {
			this.filereader = new FileReader();
			this.filereader.onload = this.onFileLoaded.bind(this);
			this.filereader.onloadend = this.onLoadEnd.bind(this);
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
		return this.part && this.part.getExtensionDisplayList();
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
		const FileUtils = FilePicker;
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

		if (this.inputIsDisabled) {
			this.disableInput();
		}
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
			changeInput.addEventListener('change', this.onChangeFileInputChange.bind(this));
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
			changeInput.removeEventListener('change', this.onChangeFileInputChange.bind(this));
		}
	},


	onFileInputChange: function (e) {
		const p = this.part;
		const file = e.target.files[0];
		const allowed = p.isFileAcceptable(file);
		this[allowed ? 'reset' : 'markBad'](p.reasons);

		if (!allowed) {
			this.inputField.dom.value = null;
		}
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


	onChangeFileInputChange: function (e) {
		this.onFileInputChange(e);

		// Clear the main input field.
		this.inputField.dom.value = null;
	},


	updateProgress: function (e) {
		if (this.progressBar) {
			this.progressBar.setProps({value: e.loaded});
		}
	},


	onLoadEnd (e) {
		if (this.progressBar) {
			this.progressBar.setProps({value: e.total});
		}
	},


	onLoadStart: function (e) {
		this.showPreview();
		this.uploading = true;
		this.previewEl.addCls('uploading');

		const name = this.value && (this.value.filename || this.value.name);
		if (!this.progressBar) {
			let me = this;
			this.progressBar = Ext.widget({
				xtype: 'react',
				component: ProgressBar,
				max: e.total,
				value: e.loaded,
				text: name,
				renderTo: this.progressEl,
				onDismiss: function () {
					me.progressBar.destroy();
					delete me.progressBar;
					me.updateLayout();
				}
			});

			this.updateLayout();
		}
		else {
			this.progressBar.setProps({
				max: e.total,
				value: e.loaded,
				text: name
			});
		}
	},


	onFileLoaded: function (event) {
		this.value.value = event.target.result;

		this.saveProgress();
		this.previewEl.removeCls('uploading');
		this.uploading = false;
	},


	setPreviewFromInput: function (file) {
		const FileUtils = FilePicker;
		const size = FileUtils.getHumanReadableFileSize(file.size, 1);
		// const href = this.createObjectURL(file);

		this.previewNameEl.update(file.filename || file.name);
		this.previewSizeEl.update('(' + size + ')');

		// Remove current content.
		this.previewImageEl.setHTML('');
		const type = file && (file.type || file.contentType);
		if (type) {
			Ext.widget({
				xtype: 'react',
				component: AssetIcon,
				mimeType: file.type || file.contentType,
				svg: true,
				renderTo: this.previewImageEl
			});
		}
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
	},


	onDragLeave: function () {
		this.inputContainer.addCls('no-file');
		this.inputContainer.removeCls('file-over');
	},


	clearView: function () {
		this.inputField.dom.value = null;
		this.changeInputField.dom.value = null;
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


	enableInput () {
		delete this.inputIsDisabled;

		if (this.rendered && this.inputField && this.inputField.dom) {
			this.inputField.dom.removeAttribute('disabled');
			this.removeCls('disabled');
		}
	},


	disableInput () {
		this.inputIsDisabled = true;

		if (this.rendered && this.inputField && this.inputField.dom) {
			this.inputField.dom.setAttribute('disabled', 'disabled');
			this.addCls('disabled');
		}
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

	setValue: function (v, placeholder) {
		/*
		We're expecting a RAW object here. Not a model. So the times will be the raw timestamps.
			CreatedTime
			filename
			download_url
			url
			value
		*/
		if (v) {
			this.setFileSubmitted(v);
		} else if (placeholder) {
			this.disableInput();
		} else {
			this.showEmptySubmission();
		}
	},


	showEmptySubmission: function () {
		var q = this.questionSet,
			assignment = q && q.associatedAssignment,
			submitted = assignment && assignment.get('SubmittedCount');

		this.clearView();
		if (submitted > 0) {
			this.emptySubmissionEl = this.emptySubmissionTpl.append(this.el);
		}
		else {
			this.up('assessment-question')
					.addCls('no-data');
		}
	},


	setNotUploaded: function () {
		this.value = null;

		this.setDownloadButton();
		this.addCls('not-submitted');
		this.removeCls(['late', 'good']);
	},


	setUploadedNotSubmitted: function (v) {
		console.debug('Uploaded but not submitted. Value: ', v);

		v = v || {};
		this.addCls('not-submitted');
		this.showPreview();
		this.setPreviewFromInput(v);
		this.setDownloadButton(v.download_url || v.url);
	},


	setFileSubmitted: function (v) {
		v = v || {};

		this.value = v;
		this.showPreview();
		this.setPreviewFromInput(v);
		this.removeCls('not-submitted');

		const url = v.download_url || v.url;
		this.setDownloadButton(url);
		if (!url) {
			this.previewLinkEl.hide();
		}
	},


	setDownloadButton: function (url) {
		if (url) {
			this.previewLinkEl.set({
				href: url
			});
		}
	},


	markCorrect: Ext.emptyFn,
	markIncorrect: Ext.emptyFn,


	markUploaded: function (date, doNotDisable) {
		// var q = this.questionSet,
		// 	assignment = q && q.associatedAssignment;

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


	markBad: function (reasons) {
		let msg = 'There was an error uploading your file';
		if (reasons && reasons.length > 0) {
			msg = reasons[0].message;
		}

		alert({title: 'Attention', msg, icon: 'warning-red'});
	},


	instructorReset: function () {
		this.reset();
		this.up('assessment-question')
				.addCls('no-data');
	},


	reset: function () {
		var dontSetBack;

		this.setNotUploaded();

		if (this.emptySubmissionEl) {
			this.emptySubmissionEl.remove();
		}
		this.clearView();

		dontSetBack = true;

		this.callParent(arguments);

		return dontSetBack;
	}
});
