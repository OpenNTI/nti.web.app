var Ext = require('extjs');
var FieldsFilePicker = require('./FilePicker');
var PromptActions = require('../../../app/prompt/Actions');
var CroppingPrompt = require('../../../app/image/cropping/Prompt');


module.exports = exports = Ext.define('NextThought.common.form.fields.ImagePicker', {
	extend: 'NextThought.common.form.fields.FilePicker',
	alias: 'widget.image-picker-field',

	renderTpl: Ext.DomHelper.markup({
		cls: 'image-picker {fileCls}', style: {width: '{width}', height: '{height}'}, cn: [
			{cls: 'preview'},
			{tag: 'input', type: 'file', 'data-qtip': 'Add Cover Image', accept: 'image/*', tabindex: '1'},
			{cls: 'clear has-file', html: 'Clear Image'}
		]
	}),

	accepts: 'image/*',

	renderSelectors: {
		fileContainer: '.image-picker',
		inputContainer: '.image-picker',
		previewEl: '.preview',
		inputEl: 'input[type=file]',
		clearEl: '.clear'
	},

	initComponent: function() {
		this.callParent(arguments);

		this.on('destroy', this.cleanUpCroppedImage.bind(this));
	},

	beforeRender: function() {
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

	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.clearEl, 'click', this.onClearImage.bind(this));

		if (this.placeholder) {
			this.setPlaceholder(this.placeholder);
		}
	},

	getValue: function() {
		if (this.croppedImage) {
			return this.croppedImage.getBlob();
		}

		return this.callParent(arguments);
	},

	getValueName: function() {
		if (this.croppedImage) {
			return this.croppedImage.getName();
		}

		return this.callParent(arguments);
	},

	onFileChange: function(file) {
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
			.then(function(blob) {
				me.croppedImage = blob;
				me.setPreviewFromCrop(blob);
			})
			.fail(function() {
				me.onClearImage();
			})
			.always(function() {
				me.cleanUpObjectURL(url);
			});
	},

	setPlaceholder: function(value) {
		this.placeholder = value;

		if (!this.hasFile() && !this.defaultValue) {
			if (value) {
				this.previewEl.setStyle({backgroundImage: 'url(' + value + ')'});
			} else {
				this.previewEl.setStyle({backgroundImage: ''});
			}
		}
		else {
			this.updateTooltip(true);
		}
	},

	setPreviewFromValue: function(value) {
		if (!this.rendered) {
			this.on('afterrender', this.setPreviewFromValue.bind(this, value));
			return;
		}

		this.previewEl.setStyle({backgroundImage: 'url(' + value + ')'});
		this.updateTooltip(true);
	},

	setPreviewFromInput: function(file) {
		var url = this.createObjectURL(file);

		this.previewEl.setStyle({backgroundImage: 'url(' + url + ')'});
		this.updateTooltip(true);
	},

	setPreviewFromCrop: function(crop) {
		var url = crop.getURL();

		this.previewEl.setStyle({backgroundImage: 'url(' + url + ')'});
		this.updateTooltip(true);

		this.fileContainer.removeCls('no-file');
		this.fileContainer.addCls('has-file');
	},

	updateTooltip: function(hasImage) {
		if (hasImage) {
			this.inputEl.set({'data-qtip': 'Cover Image'});
		}
		else {
			this.inputEl.set({'data-qtip': 'Add Cover Image'});
		}
	},

	showPreviewFromSchema: function() {
		var url = this.placeholder || this.schema.placeholder || '';

		this.previewEl.setStyle({backgroundImage: 'url(' + url + ')'});
	},

	onClearImage: function() {
		delete this.defaultValue;
		this.clearInput();

		this.showPreviewFromSchema();

		this.cleanUpObjectURL();

		this.fileContainer.removeCls('has-file');
		this.fileContainer.addCls('no-file');
		this.updateTooltip();
	},

	cleanUpCroppedImage: function() {
		if (this.croppedImage) {
			this.croppedImage.cleanUp();
		}

		delete this.croppedImage;
	}
});
