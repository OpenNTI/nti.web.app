Ext.define('NextThought.common.form.fields.FilePicker', {
	extend: 'Ext.Component',
	alias: 'widget.file-picker-field',

	statics: {
		/**
		 * Convert bytes to a human readable form
		 *
		 * http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
		 *
		 * @param  {Number} bytes    the size to convert
		 * @param  {Number} decimals how many decimals
		 * @return {String}          human readable version
		 */
		getHumanReadableFileSize: function(bytes, decimals) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
				i = Math.floor(Math.log(bytes) / Math.log(1024));

			return (bytes / Math.pow(1024, i)).toFixed(decimals).replace(/[\.0]+$/, '') + ' ' + sizes[i];
		}
	},

	WARNING_SIZE: 52428800,//50 mb

	renderTpl: Ext.DomHelper.markup({
		cls: 'file-picker {fileCls}',
		cn: [
			{cls: 'preview', cn: [
				{cls: 'name', html: ''},
				{cls: 'size', html: ''},
				{tag: 'a', cls: 'preview-link', href: '', html: 'Preview'}
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
					{tag: 'input', type: 'file', name: '{name}'}
				]}
			]}
		]
	}),


	renderSelectors: {
		fileContainer: '.file-picker',
		nameEl: '.preview .name',
		sizeEl: '.preview .size',
		inputContainer: '.input-container',
		inputEl: 'input[type=file]'
	},


	beforeRender: function() {
		this.callParent(arguments);

		//TODO: figure out how to show a preview, when
		//editing

		this.renderData = Ext.apply(this.renderData || {}, {
			fileCls: this.defaultValue ? 'has-file' : 'no-file',
			name: this.schema.name,
			readonly: this.schema.readonly
		});

		this.on('destroy', this.cleanUpObjectURL.bind(this));
	},


	afterRender: function() {
		this.callParent(arguments);

		this.attachInputListeners();
	},


	attachInputListeners: function() {
		var input = this.inputEl && this.inputEl.dom;

		if (input) {
			input.addEventListener('change', this.onFileChange.bind(this));
			input.addEventListener('dragenter', this.onDragEnter.bind(this));
			input.addEventListener('dragleave', this.onDragLeave.bind(this));
			input.addEventListener('drop', this.onDragLeave.bind(this));
		}
	},


	maybeWarnForSize: function(file) {
		var size = this.schema.warningSize || this.WARNING_SIZE;

		if (file && file.size > size) {
			console.warn('Large File attached.');

			if (this.schema.showWarning) {
				this.schema.showWarning();
			}
		}
	},


	onFileChange: function() {
		var input = this.inputEl && this.inputEl.dom,
			file = input && input.files && input.files[0];

		if (!file) { return; }

		this.maybeWarnForSize(file);

		this.setPreviewFromInput(file);

		if (this.schema.onFileAdded) {
			this.schema.onFileAdded(file.type);
		}

		this.fileContainer.removeCls('no-file');
		this.fileContainer.addCls('has-file');
	},


	onDragEnter: function() {
		this.inputContainer.addCls('file-over');
	},


	onDragLeave: function() {
		this.inputContainer.removeCls('file-over');
	},


	setPreviewFromInput: function(file) {
		if (!this.rendered) {
			this.on('afterrender', this.setPreviewFromInput.bind(this, file));
			return;
		}

		var size = this.self.getHumanReadableFileSize(file.size, 1);

		this.nameEl.update(file.name);
		this.sizeEl.update('(' + size + ')');

		//TODO: fill in preview link
	},


	createObjectURL: function(file) {
		var url = Globals.getURLObject();

		this.cleanUpObjectURL();

		if (!url) { return null; }

		this.objectURL = url.createObjectURL(file);

		return this.objectURL;
	},


	cleanUpObjectURL: function() {
		var url = Globals.getURLObject();

		if (this.objectURL && url) {
			url.revokeObjectURL(this.objectURL);
			delete this.objectURL;
		}
	}

});
