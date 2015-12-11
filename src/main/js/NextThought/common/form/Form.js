Ext.define('NextThought.common.form.Form', {
	extend: 'Ext.Component',
	alias: 'widget.common-form',

	cls: 'form-container',

	requires: [
		'NextThought.common.form.fields.FilePicker',
		'NextThought.common.form.fields.DatePicker'
	],

	renderTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'form', enctype: 'multipart/form-data', 'autocomplete': 'off', method: 'post', name: 'form', cn: [
			{tag: 'tpl', 'for': 'schema', cn: [
				{tag: 'tpl', 'if': 'this.isText(type)', cn: [
					{cls: 'field {name}', cn: [
						{tag: 'tpl', 'if': 'displayName', cn: [
							{tag: 'label', html: '{displayName}'}
						]},
						{tag: 'input', type: '{type}', name: '{name}', placeholder: '{placeholder}', value: '{[this.getDefaultValue(values.name)]}'}
					]}
				]},
				{tag: 'tpl', 'if': 'this.isTextArea(type)', cn: [
					{cls: 'field {name}', cn: [
						{tag: 'tpl', 'if': 'displayName', cn: [
							{tag: 'label', html: '{displayName}'}
						]},
						{tag: 'textarea', type: '{type}', name: '{name}', placeholder: '{placeholder}', html: '{[this.getDefaultValue(values.name)]}'}
					]}
				]},
				{tag: 'tpl', 'if': 'this.isFile(type)', cn: [
					{cls: 'field {name}', 'data-name': '{name}', 'data-type': '{type}'}
				]},
				{tag: 'tpl', 'if': 'this.isHidden(type)', cn: [
					{cls: 'field {name} hidden', cn: [
						{tag: 'input', type: 'hidden', 'name': '{name}', value: '{[this.getDefaultValue(values.name)]}'}
					]}
				]},
				{tag: 'tpl', 'if': 'this.isDate(type)', cn: [
					{cls: 'field {name}', 'data-name': '{name}', 'data-type': '{type}', cn: [
						{tag: 'tpl', 'if': 'displayName', cn: [
							{tag: 'label', html: '{displayName}'}
						]}
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
		isDate: function(type) {
			return type === 'date';
		},
		getDefaultValue: function(name, defaultValues) {
			return this.defaultValues[name];
		}
	}),


	defaultValues: {
		'title': 'title'
	},

	COMPONENT_MAP: {},

	renderSelectors: {
		formEl: 'form'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.defaultValues = this.defaultValues || {};
		this.renderTpl.defaultValues = this.defaultValues;

		this.renderData = Ext.apply(this.renderData || {}, {
			schema: this.schema
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.attachChangeListeners();
		this.setupFilePickerFields();
		this.setupDatePickerFields();
	},


	attachChangeListeners: function() {
		var inputFields = document.querySelectorAll('form .field input, form .field textarea'),
			me = this, field, el;

		for (var i = 0; i < inputFields.length; i++) {
			field = inputFields[i];
			if (field) {
				field.addEventListener('keyup', this.formChanged.bind(this));
			}
		}
	},


	setupFilePickerFields: function() {
		this.setupComponentFields('file', 'file-picker-field');
	},


	setupDatePickerFields: function() {
		this.setupComponentFields('date', 'date-picker-field');
	},


	setupComponentFields: function(fieldName, cmpType) {
		var fields = document.querySelectorAll('form .field[data-type=' + fieldName + ']'),
			me = this, field, el, name, cmp;

		for (var i = 0; i < fields.length; i++) {
			field = fields[i];
			el = Ext.get(field);

			if (el) {
				name = field.getAttribute && field.getAttribute('data-name');

				cmp = Ext.widget(cmpType, {
					defaultValue: name && me.defaultValues[name],
					name: name,
					renderTo: el,
					formChanged: me.formChanged.bind(me)
				});

				this.COMPONENT_MAP[name] = cmp;

				// cleanup the file picker.
				me.on('destroy', cmp.destroy.bind(cmp));
			}
		}
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


	isValid: function() {
		//TODO: See if we can use html5 validation for this
		return true;
	},


	/**
	 * This function returns an object of key-value pairs for each field of the schema.
	 *
	 * @return {[type]} [description]
	 */
	getValues: function() {
		var vals = {}, me = this;

		(this.schema || []).forEach(function(entry) {
			var dom = document.querySelector('.field.' + entry.name + ' [type=' + entry.type + ']'),
				cmp = me.COMPONENT_MAP[entry.name],
				value = cmp && cmp.getValue ? cmp.getValue() : dom.value;

			//If we don't have a cmp, set the value
			//if we do have a cmp, only set it if the value isn't null
			if (!cmp || value !== null) {
				vals[entry.name] = value;
			}
		});

		return vals;
	},


	/**
	 * Get a form data. We are using HTML5 FormData object to return an object that contains
	 * the whole form object.
	 *
	 * @return {FormData} JS FormData object.
	 */
	getData: function() {
		var formDom = document.querySelector('form'),
			formData;

		if (formDom) {
			formData = new FormData(formDom);
			return formData;
		}

		return null;
	},


	/**
	 * Provides a way to update the default value of a particular field after it's been rendered.
	 *
	 * @param {[type]} fieldName  [description]
	 * @param {[type]} fieldValue [description]
	 *
	 * // TODO: Incomplete.
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


	setAction: function(action) {
		this.action = action;
	},


	/**
	 * Handle form submision
	 *
	 * NOTE: detects if we have file changes(i.e. a file upload) in order to
	 * use the appropriate submission mechanism. If we have file changes, submit a form data.
	 * Otherwise, submit a json object. For the json object, only pass the values that actually changed.
	 *
	 */
	onSubmit: function() {
		var hasFileChanged = this.shouldSubmitFormData(),
			submit;

		if (hasFileChanged) {
			submit = this.saveFormData(this.getData(), this.action, this.method);
		} else {
			submit = this.saveJsonObject(this.getChangedValues(), this.action, this.method);
		}

		return submit;
	},


	/**
	 * Given a url, submit the form values
	 * @param  {String} url where to submit
	 * @return {Promise}
	 */
	submitTo: function(url) {
		this.setAction(url);
		return this.onSubmit();
	},


	/**
	 * Update a given record with the values in the form.
	 * On success sync the record with the response values from the server
	 * @param  {Object} record model to save to
	 * @return {Promise}
	 */
	submitToRecord: function(record) {
		var link = record.getLink('edit'),
			values = this.getChangedValues();

		if (!link) {
			return Promise.reject('No Edit Link');
		}

		this.setAction(link);

		return this.onSubmit()
			.then(function(response) {
				record.set(values);
				record.syncWithResponse(response);

				return record;
			});
	},


	/**
	 * Checks for file inputs and returns true if any of file was uploaded.
	 * @return {Boolean} Returns true if a file was uploaded, false otherwise.
	 */
	shouldSubmitFormData: function() {
		var fileInputs = document.querySelectorAll('form input[type=file]'),
			changed = false;
		for (var i = fileInputs.length - 1; i >= 0; i--) {
			input = fileInputs[i];
			if (input.files && input.files[0]) {
				changed = true;
			}
		}

		return changed;
	},


	/**
	 * Saves a FormData object
	 *
	 * @param  {FormData} data   FormData to be submitted.
	 * @param  {String} action the URL to save the form data to.
	 * @param  {String} method the action method to use (i.e POST or PUT)
	 * @return {Promise} fulfills or rejects with the save
	 */
	saveFormData: function(data, action, method) {
		var xhr = new XMLHttpRequest(),
			me = this;

		if (!data) {
			console.warn('Cannot save an empty form data.');
			return Promise.reject();
		}

		if (!action || !method) {
			console.error('The action (URL) and/or method (PUT, POST) of submission is missing.');
			return Promise.reject();
		}

		return new Promise(function(fulfill, reject) {
			xhr.open(method, action);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.onreadystatechange = function() {
				//TODO: clean up this logic to not have potentially unhandled cases
				if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 201)) {
			        // me.record.syncWithResponse(xhr.responseText);
			        fulfill(xhr.responseText);
			        if (me.onSuccess) {
					 	me.onSuccess(xhr.responseText);
					}
			    } else {
			    	if (xhr.readyState === 4) {
			    		reject();
			    		if (me.onFailure) {
							me.onFailure(xhr.responseText);
						}
			    	}
			    }
			};

			xhr.send(data);
		});
	},


	/**
	 * Saves a JSON object
	 *
	 * @param  {Object} object the data to save
	 * @param  {String} action the url to save to
	 * @param  {String} method POST or PUT
	 * @return {Promise} fulfills or rejects with the save
	 */
	saveJsonObject: function(object, action, method) {
		var me = this;
		if (!action || !method) {
			console.error('The action (URL) and/or method (PUT, POST) of submission is missing.');
			return;
		}

		if (Object.keys(object).length === 0) {
			return;
		}

		method = method.toLocaleLowerCase();

		if (Service[method]) {
			return Service[method](action, object)
				.then(function(response) {
				 	if (me.onSuccess) {
				 		me.onSuccess(response);
				 	}

				 	return response;
				})
				.fail(function(reason) {
					//TODO: figure out how to handle this
					if (me.onFailure) {
						me.onFailure(reason);
					}

					return reason;
				});
		}

		//TODO: have a reasonable reason
		return Promise.reject();
	},


	/**
	 * Compares the default values against the current values to check for fields that actually changed.
	 * We also add in hidden values, since it's an easier way to pass necessary date (i.e. MimeTypes)
	 * Returns object of key-value pairs that changed.
	 *
	 * @return {Object} Map for key-value pairs that changed.
	 */
	getChangedValues: function() {
		var currentValues = this.getValues(),
			changed = {},
			key;

		for (key in currentValues) {
			if (currentValues.hasOwnProperty(key)) {
				if (currentValues[key] !== this.defaultValues[key]) {
					changed[key] = currentValues[key];
				}
			}
		}

		(this.schema || []).forEach(function(entry) {
			var key = entry && entry.name;
			if (entry && entry.type === 'hidden') {
				changed[key] = currentValues[key];
			}
		});

		return changed;
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
