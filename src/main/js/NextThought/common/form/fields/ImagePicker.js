Ext.define('NextThought.common.form.fields.ImagePicker', {
	extend: 'NextThought.common.form.fields.FilePicker',
	alias: 'widget.image-picker-field',


	renderTpl: Ext.DomHelper.markup({
		cls: 'image-picker {fileCls}', style: {width: '{width}', height: '{height}'}, cn: [
			{cls: 'preview'},
			{tag: 'input', type: 'file', accept: 'image/*'},
			{cls: 'clear has-file', html: 'Clear Image'}
		]
	}),


	renderSelectors: {
		fileContainer: '.image-picker',
		inputContainer: '.image-picker',
		previewEl: '.preview',
		inputEl: 'input[type=file]',
		clearEl: '.clear'
	},


	beforeRender: function() {
		this.callParent(arguments);

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
	},


	setPreviewFromValue: function(value) {
		if (!this.rendered) {
			this.on('afterrender', this.setPreviewFromValue.bind(this, value));
			return;
		}

		this.previewEl.setStyle({backgroundImage: 'url(' + value + ')'});
	},


	setPreviewFromInput: function(file) {
		var url = this.createObjectURL(file);

		//TODO: open up the resize and crop controls

		this.previewEl.setStyle({backgroundImage: 'url(' + url + ')'});
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
	}
});
