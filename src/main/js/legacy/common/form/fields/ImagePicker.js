const Ext = require('extjs');

require('./FilePicker');
require('../../../app/prompt/Actions');
require('../../../app/image/cropping/Prompt');


module.exports = exports = Ext.define('NextThought.common.form.fields.ImagePicker', {
	extend: 'NextThought.common.form.fields.FilePicker',
	alias: 'widget.image-picker-field',

	defaultToolTip: 'Add Cover Image',

	inputTpl: new Ext.XTemplate(Ext.DomHelper.markup({tag: 'input', type: 'file', 'data-qtip': '{qtip}', accept: 'image/*', tabindex: '1'})),

	renderTpl: Ext.DomHelper.markup({
		cls: 'image-picker {fileCls}', style: {width: '{width}', height: '{height}'}, cn: [
			{cls: 'preview'},
			{tag: 'span', cls: 'input-wrapper'},
			{cls: 'clear has-file', html: 'Clear Image'}
		]
	}),

	iconTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ cls: 'icon {extension} {iconCls}', style: 'background-image: url(\'{url}\');', cn: [
			{tag: 'label', cls: 'extension', html: '{extension}'}
		]}
	])),

	accepts: 'image/*',

	renderSelectors: {
		fileContainer: '.image-picker',
		inputContainer: '.image-picker',
		previewEl: '.preview',
		inputWrapper: '.input-wrapper',
		inputEl: 'input[type=file]',
		clearEl: '.clear'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.on('destroy', this.cleanUpCroppedImage.bind(this));
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.PromptActions = NextThought.app.prompt.Actions.create();

		this.placeholder = this.schema.placeholder;

		var width = this.schema.width,
			height = this.schema.height;

		if (width) {
			width = width + 'px';
		} else {
			width = 'auto';
		}

		if (height) {
			height = height + 'px';
		} else {
			height = 'auto';
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			width: width,
			height: height
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.clearEl, 'click', this.onClearImage.bind(this));

		if (this.placeholder) {
			this.setPlaceholder(this.placeholder);
		}
	},

	getValue: function () {
		if (this.croppedImage) {
			return this.croppedImage.getBlob();
		}

		return this.callParent(arguments);
	},

	getValueName: function () {
		if (this.croppedImage) {
			return this.croppedImage.getName();
		}

		return this.callParent(arguments);
	},

	onFileChange: function (file) {
		var me = this,
			url = me.createObjectURL(file);

		me.PromptActions.prompt('image-cropping', {
			src: url,
			name: file.name,
			crop: {
				minWidth: me.schema.width,
				minHeight: me.schema.height,
				aspectRatio: me.schema.width / me.schema.height
			}
		})
			.then(function (blob) {
				me.croppedImage = blob;
				me.setPreviewFromCrop(blob);
			})
			.catch(function () {
				me.onClearImage();
			})
			.always(function () {
				me.cleanUpObjectURL(url);
			});
	},

	setPlaceholder: function (value) {
		this.placeholder = value;

		if (!this.hasFile() && !this.defaultValue) {
			this.previewEl.setHTML('');
			this.iconTpl.append(this.previewEl, value || {});
		}
		else {
			this.updateTooltip(true);
		}
	},

	setPreviewFromValue: function (value) {
		if (!this.rendered) {
			this.on('afterrender', this.setPreviewFromValue.bind(this, value));
			return;
		}

		this.previewEl.setStyle({backgroundImage: 'url(' + value + ')'});
		this.updateTooltip(true);
	},

	setPreviewFromInput: function (file) {
		var url = this.createObjectURL(file);

		this.previewEl.setStyle({backgroundImage: 'url(' + url + ')'});
		this.updateTooltip(true);
	},

	setPreviewFromCrop: function (crop) {
		var url = crop.getURL();

		this.previewEl.setStyle({backgroundImage: 'url(' + url + ')'});
		this.updateTooltip(true);

		this.fileContainer.removeCls('no-file');
		this.fileContainer.addCls('has-file');
	},

	updateTooltip: function (hasImage) {
		let inputEl = this.getInput();

		if (hasImage) {
			inputEl.setAttribute('data-qtip', 'Cover Image');
		}
		else {
			inputEl.setAttribute('data-qtip', 'Add Cover Image');
		}
	},

	showPreviewFromSchema: function () {
		var url = this.placeholder || this.schema.placeholder || '';

		this.previewEl.setStyle({backgroundImage: 'url(' + url + ')'});
	},

	onClearImage: function () {
		delete this.defaultValue;
		delete this.croppedImage;

		this.clearInput();

		this.showPreviewFromSchema();

		this.cleanUpObjectURL();

		this.fileContainer.removeCls('has-file');
		this.fileContainer.addCls('no-file');
		this.updateTooltip();
	},

	cleanUpCroppedImage: function () {
		if (this.croppedImage) {
			this.croppedImage.cleanUp();
		}

		delete this.croppedImage;
	}
});
