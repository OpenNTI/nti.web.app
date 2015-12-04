Ext.define('NextThought.common.form.fields.FilePicker', {
	extend: 'Ext.Component',
	alias: 'widget.file-picker-field',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'img',
			style: { backgroundImage: 'url({thumbnail})'},
			cn: [
				{tag: 'input', type: 'file', name: '{name}', 'data-value': '{thumbnail}'},
				{cls: 'placeholder', html: '{placeholder}'},
				{
					cls: 'meta-data',
					cn: [
						{cls: 'thumb'},
						{cls: 'name'},
						{cls: 'type item'},
						{cls: 'size item right'}
					]
				}
			]
		}
	]),

	DEFAULT_DOC_THUMBNAIL: '',

	DEFAULT_PDF_THUMBNAIL: '',

	DEFAULT_THUMBNAIL: '',

	placeholder: '',

	renderSelectors: {
		nameEl: '.name',
		sizeEl: '.size',
		typeEl: '.type',
		metaEl: '.meta-data',
		placeholderEl: '.placeholder'
	},

	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			thumbnail: this.thumbnail,
			name: this.name,
			placeholder: this.placeholder
		});
	},

	afterRender: function() {
		this.callParent(arguments);
		this.attachChangeListeners();
	},


	attachChangeListeners: function() {
		var inputs = document.querySelectorAll('input[type=file]'),
			me = this;

		for (var i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i];
			input.addEventListener('change', me.onFileChanged.bind(me));
		}
	},

	/**
	 * Handles file upload and broadcast the change
	 *
	 * @param  {Event} e Event representing a new file upload.
	 */
	onFileChanged: function(e) {
		var i = e.target,
			f = i && i.files && i.files[0],
			thumb, img, type;

		console.log('File Uploaded: event=', e, ' input=', i, ' files=', i.files);

		if (f) {
			this.placeholderEl.hide();

			if (this.name === 'href') {
				type = f.type.split('/').last();
				size = f.size / 1000;
				this.nameEl.update('Name: ' + f.name);
				this.typeEl.update('Type: ' + type.toUpperCase());
				this.sizeEl.update(size + 'kb');
				this.metaEl.addCls('visible');
			}

			thumb = this.resolveFileThumbnail(f);
			if (thumb) {
				img = Ext.fly(i).up('.img');
				if (img && img.setStyle) {
					if (this.name === 'icon') {
						img.setStyle('backgroundImage', 'url(' + thumb + ')');
					}

					// set the thumbnail url name on the input file field.
					i.setAttribute('data-value', thumb);

					// Broadcast the change.
					if (this.formChanged) {
						this.formChanged();
					}
				}
			}
		}
	},


	getValue: function() {
		var t = document.querySelector('input[type=file]'),
			value = t && t.getAttribute && t.getAttribute('data-value');

		//TODO: does this need to return anything on get value?
		//Since file upload can only be done through form data
		return value || null;
	},


	/**
	 * Resolve the thumbnail for the newly uploaded image or document.
	 * As a rule of thumb, for images, we will create a thumbnail
	 * for other documents, we will return a default icon for recognized types (i.e. PDF, Doc)
	 * Otherwise, we will return the default icon for all other types.
	 *
	 * @param  {File} fileObj JS File object
	 * @return {String} string representing the url of the thumbnail
	 */
	resolveFileThumbnail: function(fileObj) {
		var type = fileObj && fileObj.type || '';

		// cleanup previous object URL.
		this.cleanupObjectURL();

		if (type.indexOf('image') >= 0) {
			return this.getFileThumbnail(fileObj);
		}
		if (type === 'application/pdf') {
			// PDF default thumbnail file
			return this.DEFAULT_PDF_THUMBNAIL;
		}
		if (type === 'application/doc') {
			// PDF default thumbnail file
			return this.DEFAULT_DOC_THUMBNAIL;
		}

		// default thumbnail
		return this.DEFAULT_THUMBNAIL;
	},


	onDestroy: function() {
		this.cleanupObjectURL();
	},

	cleanupObjectURL: function() {
		var url = this.getGlobalURL();
		if (this.currentObjectURL && url && url.revokeObjectURL) {
			url.revokeObjectURL(this.currentObjectURL);
		}
	},


	getGlobalURL: function() {
		var url = null;
		if (URL && URL.createObjectURL) {
			url = URL;
		} else if (webkitURL && webkitURL.createObjectURL) {
			url = webkitURL;
		}

		return url;
	},


	/**
	 * Build and return a thumbnail URL for a File object.
	 *
	 * @param  {File} fileObj JS File object.
	 * @return {String} URL for the newly generated thumbnail.
	 */
	getFileThumbnail: function(fileObj) {
		var url = this.getGlobalURL(),
			objectURL = null;

		if (url && url.createObjectURL && fileObj) {
			objectURL = url.createObjectURL(fileObj);
			this.currentObjectURL = objectURL;
		}

		return objectURL;
	}
});
