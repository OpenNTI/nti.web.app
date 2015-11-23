Ext.define('NextThought.common.form.Form', {
	extend: 'Ext.Component',
	alias: 'widget.common-form',

	cls: 'form-container',

	renderTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'form', cn: [
			{tag: 'tpl', 'for': 'schema', cn: [
				{tag: 'tpl', 'if': 'this.isText(type)', cn: [
					{cls: 'field {name}', cn: [
						{tag: 'tpl', 'if': 'displayName', cn: [
							{tag: 'label', html: '{displayName}'}
						]},
						{tag: 'input', type: '{type}', placeholder: '{placeholder}', value: '{[this.getDefaultValue(values.name)]}'}
					]}
				]},
				{tag: 'tpl', 'if': 'this.isTextArea(type)', cn: [
					{cls: 'field {name}', cn: [
						{tag: 'tpl', 'if': 'displayName', cn: [
							{tag: 'label', html: '{displayName}'}
						]},
						{tag: 'textarea', type: '{type}', placeholder: '{placeholder}', html: '{[this.getDefaultValue(values.name)]}'}
					]}
				]},
				{tag: 'tpl', 'if': 'this.isFile(type)', cn: [
					{cls: 'field {name}', cn: [
						{
							cls: 'img',
							style: { backgroundImage: 'url({[this.getDefaultValue(values.name)]})'},
							cn: [
								{tag: 'input', type: 'file', 'data-value': '{[this.getDefaultValue(values.name)]}'}
							]
						},
						{
							cls: 'img-name'
						}
					]}
				]},
				{tag: 'tpl', 'if': 'this.isHidden(type)', cn: [
					{cls: 'field {name} hidden', cn: [
						{tag: 'input', type: 'hidden', value: '{[this.getDefaultValue(values.name}]}'}
					]}
				]}
			]}
		]}
	]), {
		isText: function(type) {
			return type === 'text';
		},
		isTextArea: function(type) {
			return type === 'textarea';
		},
		isFile: function(type) {
			return type === 'file';
		},
		isHidden: function(type) {
			return type === 'hidden';
		},
		getDefaultValue: function(name, defaultValues) {
			return this.defaultValues[name];
		}
	}),


	defaultValues: {
		'title': 'title'
	},


	DEFAULT_DOC_THUMBNAIL: '',

	DEFAULT_PDF_THUMBNAIL: '',

	DEFAULT_THUMBNAIL: '',


	beforeRender: function() {
		this.callParent(arguments);

		this.renderTpl.defaultValues = Ext.applyIf(this.data || {}, this.defaultValues);

		this.renderData = Ext.apply(this.renderData || {}, {
			schema: this.schema
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.attachChangeListeners();
	},


	attachChangeListeners: function() {
		var inputFields = this.el.query('.field input, .field textarea'),
			fileInputFields = document.querySelectorAll('input[type=file]'),
			me = this;

		Ext.each(inputFields, function(field) {
			var el = Ext.get(field);

			me.mon(el, {
				keyup: me.formChanged.bind(me)
			});
		});

		Ext.each(fileInputFields, function(field) {
			field.addEventListener('change', me.onFileChanged.bind(me));
		});

	},


	/**
	 * When a field is edited, call the onChange listener if it's provided.
	 * This allows the creator of the form to act on form change events.
	 * The onChange function is passed a key-value object for the schema fields of the form.
	 *
	 * NOTE: while in the future, we will optimize this to only return the value of the field that changed,
	 * for now, we will return the entire form values.
	 *
	 * @param  {[type]} e Browser Event.
	 *
	 */
	formChanged: function(e) {
		var vals = this.getValues();
		if (this.onChange) {
			this.onChange(vals);
		}
	},

	/**
	 * This function returns an object of key-value pairs for each field of the schema.
	 *
	 * @return {[type]} [description]
	 */
	getValues: function() {
		var vals = {}, me = this;

		Ext.each(this.schema, function(entry) {
			var el = me.el.down('.field.' + entry.name + ' [type=' + entry.type + ']');
			if (entry.type === 'file') {
				vals[entry.name] = el.dom.getAttribute('data-value');
			}
			else {
				vals[entry.name] = el.dom.value;
			}
		});

		return vals;
	},


	/**
	 * Handles file upload and broadcast the change
	 *
	 * @param  {Event} e Event representing a new file upload.
	 */
	onFileChanged: function(e) {
		var i = e.target,
			f = i && i.files && i.files[0],
			thumb, img;

		console.log('File Uploaded: event=', e, ' input=', i, ' files=', i.files);
		if (f) {
			thumb = this.resolveFileThumbnail(f);
			if (thumb) {
				img = Ext.fly(i).up('.img');
				if (img && img.setStyle) {
					img.setStyle('backgroundImage', 'url(' + thumb + ')');

					// set the thumbnail url name on the input file field.
					i.setAttribute('data-value', thumb);

					// Broadcast the change.
					this.formChanged();
				}
			}
		}
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


	/**
	 * Build and return a thumbnail URL for a File object.
	 *
	 * @param  {File} fileObj JS File object.
	 * @return {String} URL for the newly generated thumbnail.
	 */
	getFileThumbnail: function(fileObj) {
		var url = null,
			objectURL = null;
		if (URL && URL.createObjectURL) {
			url = URL;
		} else if (webkitURL && webkitURL.createObjectURL) {
			url = webkitURL;
		}

		if (url && fileObj) {
			objectURL = url.createObjectURL(fileObj);

			// Attach destroy listen to cleanup
			if (objectURL) {
				this.on('destroy', function() {
					url.revokeObjectURL(objectURL);
				});
			}
		}

		return objectURL;
	},


	/**
	 * Get a form data. We are using HTML5 FormData object to return an object that contains
	 * the whole form object.
	 *
	 * @return {FormData} JS FormData object.
	 */
	getData: function() {
		var formDom = this.el.dom.querySelector('form');
		if (formDom) {
			return new FormData(formDom);
		}
		return null;
	},


	/**
	 * Provides a way to update the default value of a particular field after it's been rendered.
	 *
	 * @param {[type]} fieldName  [description]
	 * @param {[type]} fieldValue [description]
	 */
	setValue: function(fieldName, fieldValue) {
		var me = this,
			selector = this.getTypeSelector(fieldName);

		if (!selector) {
			console.warn('No selector for schema field: ' + fieldName);
			return;
		}

		this.onceRendered
			.then(function() {
				var el = me.el.down('.field ' + selector);
				if (el) {
					el.setValue(fieldName, fieldValue);
				}
			});
	},


	/**
	 * Get a selector for a particular field. Fields of each form are going to have different selectors
	 * based on the schema and each field's type.
	 * This method builds a selector to get to one particular field value given its name.
	 *
	 * @param  {String} fieldName schema's name for a particular field.
	 * @return {[type]}           [description]
	 */
	getTypeSelector: function(fieldName) {
		// We will need to loop through the schema to find the field with the given name.
		// TODO: To be implemented
	}
});
