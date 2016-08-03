const Ext = require('extjs');
const Globals = require('legacy/util/Globals');
const ParseUtils = require('legacy/util/Parsing');
const {default: autobind} = require('nti-commons/lib/autobind');
const StateStore = require('legacy/app/context/StateStore');

const {ContentResources} = require('nti-web-commons');

require('legacy/model/ContentBlobFile');
require('legacy/model/courseware/ContentFile');

module.exports = exports = Ext.define('NextThought.common.form.fields.FilePicker', {
	extend: 'Ext.Component',
	alias: 'widget.file-picker-field',

	statics: {
		UNITS: ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],

		/**
		 * Convert bytes to a human readable form
		 *
		 * http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
		 *
		 * @param  {Number} bytes	 the size to convert
		 * @param  {Number} decimals how many decimals
		 * @param {String} unit force the result to be in a certain unit
		 * @return {String}			 human readable version
		 */
		getHumanReadableFileSize: function (bytes, decimals, unit) {
			if (!bytes) {
				return '0 ' + (unit || this.UNITS[2]);
			}

			var sizes = this.UNITS,
				i;

			if (unit) {
				i = sizes.indexOf(unit);
			} else {
				i = Math.floor(Math.log(bytes) / Math.log(1024));
			}

			return (bytes / Math.pow(1024, i)).toFixed(decimals).replace(/\.0+$/, '') + ' ' + sizes[i];
		},


		getUnit: function (bytes) {
			if (!bytes) {
				return this.UNITS[2];
			}

			var sizes = this.UNITS,
				i = Math.floor(Math.log(bytes) / Math.log(1024));

			return sizes[i];
		}
	},

	WARNING_SIZE: 52428800,

	//50 mb


	inputTpl: new Ext.XTemplate(Ext.DomHelper.markup({tag: 'input', type: 'file', tabindex: '1'})),

	renderTpl: Ext.DomHelper.markup({
		cls: 'file-picker {fileCls}',
		cn: [
			{cls: 'preview', cn: [
				{cls: 'name', html: ''},
				{cls: 'size', html: ''},
				{tag: 'a', cls: 'preview-link', href: '', target: '_blank', html: 'Preview'}
			]},
			{cls: 'input-container', cn: [
				{cls: 'no-file', cn: [
					{cls: 'drop', html: 'Drop a file here or'},
					{cls: 'choose', html: 'choose file'}
				]},
				{cls: 'has-file', cn: [
					{cls: 'change', html: 'Change'}
				]},
				{tag: 'tpl', 'if': '!readonly', cn: [
					{tag: 'span', cls: 'input-wrapper'}
				]}
			]}
		]
	}),

	renderSelectors: {
		fileContainer: '.file-picker',
		nameEl: '.preview .name',
		sizeEl: '.preview .size',
		previewLink: '.preview .preview-link',
		inputContainer: '.input-container',
		inputWrapper: '.input-wrapper',
		inputEl: 'input[type=file]'
	},


	initComponent () {
		this.callParent(arguments);

		autobind(this,
			'selectCourseResource',
			'onFileInputChange',
			'onDragEnter',
			'onDragLeave',
			'onDragLeave',
			'onInputFocus',
			'onInputBlur'
		);
	},


	beforeRender: function () {
		this.callParent(arguments);

		if (this.defaultValue) {
			this.setPreviewFromValue(this.defaultValue);
		}


		this.renderData = Ext.apply(this.renderData || {}, {
			fileCls: this.defaultValue ? 'has-file' : 'no-file',
			name: this.schema.name,
			readonly: this.schema.readonly
		});

		this.on('destroy', this.cleanUpObjectURL.bind(this));
	},


	afterRender: function () {
		this.callParent(arguments);

		this.createInput();

		this.attachInputListeners();

		if (this.focusOnRender) {
			this.focus();
		}
	},


	focus: function () {
		if (!this.rendered) {
			this.focusOnRender = true;
			return;
		}

		let inputEl = this.getInput();

		return inputEl && inputEl.focus();
	},


	getInput: function () {
		return this.inputDom;
	},


	isEmpty: function () {
		return !!this.currentFile;
	},


	isValid: function () {
		var input = this.getInput();

		return input && input.checkValidity() ? input.checkValidity() : true;
	},


	showError: function () {
		this.fileContainer.addCls('error');
	},


	removeError: function () {
		this.fileContainer.removeCls('error');
	},


	hasFile: function () {
		return this.currentFile && typeof this.currentFile !== 'string';
	},


	getErrors: function () {
		var input = this.getInput();

		return {
			missing: input.validity && input.validity.missingValue
		};
	},


	getValue: function () {
		return this.currentFile || this.defaultValue;
	},


	getValueName: function () {
		var value = this.getValue();

		return value ? value.name : '';
	},


	appendToFormData: function (data) {
		var value = this.getValue(),
			name = this.getValueName();

		if (value) {
			if (value !== this.defaultValue) {
				if (typeof value === 'string') {
					data.append(this.schema.name, value);
				}
				else {
					data.append(this.schema.name, value, name);
				}
			}
		} else {
			data.append(this.schema.name, '');
		}
	},


	attachInputListeners: function () {
		var input = this.getInput();

		if (input) {
			input.addEventListener('click', this.selectCourseResource);
			input.addEventListener('change', this.onFileInputChange);
			input.addEventListener('dragenter', this.onDragEnter);
			input.addEventListener('dragleave', this.onDragLeave);
			input.addEventListener('drop', this.onDragLeave);
			input.addEventListener('focus', this.onInputFocus);
			input.addEventListener('blur', this.onInputBlur);
		}
	},


	removeInputListeners: function () {
		var input = this.getInput();

		if (input) {
			input.removeEventListener('click', this.selectCourseResource);
			input.removeEventListener('change', this.onFileInputChange);
			input.removeEventListener('dragenter', this.onDragEnter);
			input.removeEventListener('dragleave', this.onDragLeave);
			input.removeEventListener('drop', this.onDragLeave);
			input.removeEventListener('focus', this.onInputFocus);
			input.removeEventListener('blur', this.onInputBlur);
		}
	},


	maybeWarnForSize: function (file) {
		var size = this.schema.warningSize || this.WARNING_SIZE;

		if (file && !file.NTIID && file.size > size) {
			console.warn('Large File attached.');

			if (this.schema.showWarning) {
				this.schema.showWarning();
			}
		}
	},


	selectCourseResource (e) {
		e.preventDefault();
		e.stopPropagation();

		const bundle = StateStore.getInstance().getRootBundle();
		const sourceID = bundle.getId();

		const accept = x => !x.isFolder && (!this.acceptsContentFileFilter || this.acceptsContentFileFilter(x));
		const filter = x => !this.contentFileFilter || this.contentFileFilter(x);

		ContentResources.selectFrom(sourceID, accept, filter)
			.then(file => {
				this.currentFile = file.getID();
				this.onFileChange(file);
			});
	},


	onInputFocus: function () {
		this.fileContainer.addCls('focused');
	},


	onInputBlur: function () {
		this.fileContainer.removeCls('focused');
	},


	onFileInputChange: function (e) {
		var input = this.getInput(),
			file = input && input.files && input.files[0];

		if (e.target !== input) {
			return;
		}

		//Since you can't null out a file input
		//keep track of the file locally, cancel
		//default to prevent the input from getting the value
		this.currentFile = file;
		this.createInput();
		e.preventDefault();

		if (file && (!this.accepts || file.type.match(this.accepts))) {
			this.onFileChange(file);
		}
	},


	onFileChange: function (file) {
		this.maybeWarnForSize(file);

		this.setPreviewFromInput(file);

		if (this.schema.onFileAdded) {
			this.schema.onFileAdded(file.getFileMimeType ? file.getFileMimeType() : file.type);
		}

		if (this.onChange) {
			this.onChange();
		}

		this.fileContainer.removeCls('no-file');
		this.fileContainer.addCls('has-file');
	},


	onDragEnter: function () {
		this.inputContainer.addCls('file-over');
	},


	onDragLeave: function () {
		this.inputContainer.removeCls('file-over');
	},


	setPreviewFromValue: function (value) {
		if (!ParseUtils.isNTIID(value)) { return; }

		Service.getObject(value)
			.then((m) => (m.get('ContentFile') || m))
			.then(this.setPreviewFromBlob.bind(this))
			.catch(this.onFailToLoadPreview.bind(this));
	},


	setPreviewFromBlob: function (blob) {
		if (!this.rendered) {
			this.on(('afterrender'), this.setPreviewFromBlob.bind(this, blob));
			return;
		}

		var size = this.self.getHumanReadableFileSize(blob.get('size') || 0, 1);

		this.nameEl.update(blob.get('filename'));
		this.sizeEl.update('(' + size + ')');

		this.previewLink.dom.setAttribute('href', blob.get('url'));
	},


	onFailToLoadPreview: function (reason) {
		//TODO: Show some error state
		console.error('Failed to load file preview: ', reason);
	},


	setPreviewFromInput: function (file) {
		if (!this.rendered) {
			this.on('afterrender', this.setPreviewFromInput.bind(this, file));
			return;
		}

		if (file.NTIID) {
			return this.setPreviewFromValue(file.NTIID);
		}

		var size = this.self.getHumanReadableFileSize(file.size, 1),
			href = this.createObjectURL(file);

		this.nameEl.update(file.name);
		this.sizeEl.update('(' + size + ')');

		this.previewLink.dom.setAttribute('href', href);
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


	createInput () {
		if (!this.rendered) { return; }

		let tip = (this.inputDom && this.inputDom.getAttribute('data-qtip')) || this.defaultToolTip;

		this.removeInputListeners();

		this.inputWrapper.dom.innerHTML = '';
		this.inputDom = this.inputTpl.append(this.inputWrapper, {qtip: tip});
		this.attachInputListeners();
	},


	clearInput: function () {
		delete this.currentFile;
	}
});
