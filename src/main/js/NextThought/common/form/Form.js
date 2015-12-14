Ext.define('NextThought.common.form.Form', {
	extend: 'Ext.Component',
	alias: 'widget.common-form',

	requires: [
		'NextThought.common.form.fields.FilePicker',
		'NextThought.common.form.fields.ImagePicker',
		'NextThought.common.form.fields.DatePicker'
	],

	cls: 'form-container',

	INPUT_TYPES: {
		group: new Ext.XTemplate(Ext.DomHelper.markup({
			cls: 'group {name}'
		})),

		text: new Ext.XTemplate(Ext.DomHelper.markup({
			cls: 'field {name}', cn: [
				{tag: 'tpl', 'if': 'displayName', cn: [
					{tag: 'label', 'for': '{name}', html: '{displayName}'}
				]},
				{tag: 'tpl', 'if': 'required', cn: [
					{tag: 'input', type: '{type}', name: '{name}', placeholder: '{placeholder}', required: true, value: '{value}'}
				]},
				{tag: 'tpl', 'if': '!required', cn: [
					{tag: 'input', type: '{type}', name: '{name}', placeholder: '{placeholder}', value: '{value}'}
				]}
			]
		})),

		textarea: new Ext.XTemplate(Ext.DomHelper.markup({
			cls: 'field {name}', cn: [
				{tag: 'tpl', 'if': 'displayName', cn: [
					{tag: 'label', 'for': '{name}', html: '{displayName}'}
				]},
				{tag: 'tpl', 'if': 'required', cn: [
					{tag: 'textarea', type: '{type}', name: '{name}', placeholder: '{placeholder}', required: true, html: '{value}'}
				]},
				{tag: 'tpl', 'if': '!required', cn: [
					{tag: 'textarea', type: '{type}', name: '{name}', placeholder: '{placeholder}', html: '{value}'}
				]}
			]
		})),

		image: new Ext.XTemplate(Ext.DomHelper.markup({
			cls: 'field {name} image', cn: [
				{tag: 'tpl', 'if': 'displayName', cn: [
					{tag: 'label', 'for': '{name}', html: '{displayName}'}
				]}
			]
		})),

		file: new Ext.XTemplate(Ext.DomHelper.markup({
			cls: 'field {name} file', cn: [
				{tag: 'tpl', 'if': 'displayName', cn: [
					{tag: 'label', 'for': '{name}', html: '{displayName}'}
				]}
			]
		})),

		date: new Ext.XTemplate(Ext.DomHelper.markup({
			cls: 'field {name}', cn: [
				{tag: 'tpl', 'if': 'displayName', cn: [
					{tag: 'label', 'for': '{name}', html: '{displayName}'}
				]}
			]
		})),

		hidden: new Ext.XTemplate(Ext.DomHelper.markup([
			{tag: 'input', type: 'hidden', 'name': '{name}', value: '{value}'}
		]))
	},


	renderTpl: Ext.DomHelper.markup([
		{tag: 'form', enctype: '{enctype}', autocomplete: '{autocomplete}', name: '{name}'}
	]),


	renderSelectors: {
		formEl: 'form'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.filePickers = {};
		this.imagePickers = {};
		this.datePickers = {};
		this.defaultValues = this.defaultValues || {};

		this.renderData = Ext.apply(this.renderData || {}, {
			enctype: this.enctype || 'multipart/form-data',
			autocomplete: this.autocomplete || 'off',
			name: this.formName || 'form'
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.buildInputs(this.schema, this.formEl);

		this.setUpChangeListeners();
	},


	buildInputs: function(schema, el) {
		var me = this;

		schema.forEach(function(inputSchema) {
			me.addInput(inputSchema, el);
		});
	},


	addInput: function(schema, el) {
		var type = schema.type,
			tpl = this.INPUT_TYPES[type],
			inputEl;

		if (!tpl) {
			console.warn('Unknown input type: ', schema);
			return;
		}

		schema.required = schema.required || false;
		schema.value = this.defaultValues[schema.name];
		inputEl = tpl.append(el, schema, true);

		if (type === 'group') {
			this.buildInputs(schema.inputs, inputEl);
		} else if (type === 'image') {
			this.buildImageInput(schema, inputEl);
		} else if (type == 'file') {
			this.buildFileInput(schema, inputEl);
		} else if (type === 'date') {
			this.buildDateInput(schema, inputEl);
		}
	},


	buildImageInput: function(schema, inputEl) {
		var cmp = new NextThought.common.form.fields.FilePicker({
			defaultValue: schema.value,
			schema: schema,
			renderTo: inputEl,
			onChange: this.onFormChange.bind(this)
		});

		this.on('destroy', cmp.destroy.bind(this));

		this.imagePickers[schema.name] = cmp;
	},


	buildFileInput: function(schema, inputEl) {
		var cmp = new NextThought.common.form.fields.FilePicker({
			defaultValue: schema.value,
			schema: schema,
			renderTo: inputEl,
			onChange: this.onFormChange.bind(this)
		});

		this.on('destroy', cmp.destroy.bind(cmp));

		this.filePickers[schema.name] = cmp;
	},


	buildDateInput: function(schema, inputEl) {
		var cmp = new NextThought.common.form.fields.DatePicker({
			defaultValue: schema.value,
			schema: schema,
			renderTo: inputEl,
			onChange: this.onFormChange.bind(this)
		});

		this.on('destroy', cmp.destroy.bind(cmp));

		this.datePickers[schema.name] = cmp;
	},


	setUpChangeListeners: function() {
		var me = this,
			inputs = this.el.dom.querySelectorAll('.field input[type=text], .field textarea');

		inputs = Array.prototype.slice.call(inputs);

		inputs.forEach(function(input) {
			input.addEventListener('keyup', me.onFormChange.bind(me));
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
	 * @param  {Object} e Browser Event.
	 *
	 */
	onFormChange: function(e) {
		var vals = this.getValues();

		if (this.onChange) {
			this.onChange(vals);
		}
	},

	/**
	 * Whether or not all the validation has been met
	 *
	 * @return {Boolean}
	 */
	isValid: function() {
		return true;
	},


	getValues: function() {
		var me = this,
			values = {},
			schema = me.schema || [];

		schema.forEach(function(entry) {
			var name = entry.name;

			values[name] = me.getValueOf(name);
		});

		return values;
	},


	getChangedValues: function() {
		var schema = this.schema,
			newValues = this.getValues(),
			oldValues = this.defaultValues,
			changed = {};

		schema.forEach(function(part) {
			var oldValue = oldValues[part.name],
				newValue = newValues[part.name];

			if (oldValue !== newValue || part.type === 'hidden') {
				changed[part.name] = newValue;
			}
		});

		return changed;
	},


	getValueOf: function(name) {
		var filePicker = this.filePickers[name],
			datePicker = this.datePickers[name],
			inputEl = this.el.dom.querySelector('input[name="' + name + '"]'),
			textarea = this.el.dom.querySelector('textarea[name="' + name + '"]'),
			value;

		if (filePicker) {
			value = filePicker.getValue();
		} else if (datePicker) {
			value = datePicker.getValue();
		} else if (inputEl) {
			value = inputEl.value;
		} else if (textarea) {
			value = textarea.value;
		}

		return value;
	},


	getFormData: function() {
		var form = this.formEl.dom,
			filePickers = this.filePickers,
			keys, formData;

		if (!form) { return; }

		formData = new FormData(form);

		keys = Object.keys(filePickers);

		keys.forEach(function(key) {
			var picker = filePickers[key];

			formData.append(picker.name, picker.getFile(), picker.getFileName());
		});


		return formData;
	},


	hasFiles: function() {
		var filePickers = this.filePickers,
			keys = Object.keys(filePickers),
			hasFile = false;

		keys.forEach(function(key) {
			var picker = filePickers[key];

			if (picker.hasFile()) {
				hasFile = true;
			}
		});

		return hasFile;
	},


	onSubmitProgress: function() {},


	__submitFormData: function(formData, url, method) {
		var me = this,
			xhr = new XMLHttpRequest();

		return new Promise(function(fulfill, reject) {
			xhr.open(method || 'POST', url, true);
			xhr.onprogress = me.onSubmitProgress.bind(me);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 && xhr.status < 300) {
						fulfill(xhr.responseText);
					} else {
						reject(xhr.responseText);
					}
				}
			};

			xhr.send(formData);
		});
	},


	__submitJSON: function(values, url, method) {
		var me = this,
			xhr = new XMLHttpRequest();

		return new Promise(function(fulfill, reject) {
			xhr.open(method || 'POST', url, true);
			xhr.onprogress = me.onSubmitProgress.bind(me);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 && xhr.status < 300) {
						fulfill(xhr.responseText);
					} else {
						reject(xhr.responseText);
					}
				}
			};

			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(values));
		});

	},


	/**
	 * Handle form submision
	 *
	 * NOTE: detects if we have file changes(i.e. a file upload) in order to
	 * use the appropriate submission mechanism. If we have file changes, submit a form data.
	 * Otherwise, submit a json object. For the json object, only pass the values that actually changed.
	 *
	 */
	submitTo: function(url) {
		var hasFiles = this.hasFiles(),
			submit;

		if (!url) {
			return Promise.reject('No Link Provided');
		}

		if (hasFiles) {
			submit = this.__submitFormData(this.getFormData(), url, this.method || 'POST');
		} else {
			submit = this.__submitJSON(this.getChangedValues(), url, this.method || 'POST');
		}

		return submit;
	},


	doSubmit: function() {
		var submit;

		if (this.action) {
			submit = this.submitTo(this.action);
		} else {
			submit = Promise.reject('No action to submit to');
		}

		return submit;
	},


	submitToRecord: function(record) {
		var link = record.getLink('edit'),
			values = this.getChangedValues();

		if (!link) {
			return Promise.reject('No Edit Link');
		}

		return this.submitTo(link)
			.then(function(response) {
				record.set(values);
				record.syncWithResponse(response);

				return record;
			});
	}
});


// 	isValid: function() {
// 		//TODO: See if we can use html5 validation for this
// 		return true;
// 	},


// 	/**
// 	 * This function returns an object of key-value pairs for each field of the schema.
// 	 *
// 	 * @return {[type]} [description]
// 	 */
// 	getValues: function() {
// 		var vals = {}, me = this;

// 		(this.schema || []).forEach(function(entry) {
// 			var dom = document.querySelector('.field.' + entry.name + ' [type=' + entry.type + ']'),
// 				cmp = me.COMPONENT_MAP[entry.name],
// 				value = cmp && cmp.getValue ? cmp.getValue() : dom.value;

// 			//If we don't have a cmp, set the value
// 			//if we do have a cmp, only set it if the value isn't null
// 			if (!cmp || value !== null) {
// 				vals[entry.name] = value;
// 			}
// 		});

// 		return vals;
// 	},


// 	/**
// 	 * Get a form data. We are using HTML5 FormData object to return an object that contains
// 	 * the whole form object.
// 	 *
// 	 * @return {FormData} JS FormData object.
// 	 */
// 	getData: function() {
// 		var formDom = document.querySelector('form'),
// 			formData;

// 		if (formDom) {
// 			formData = new FormData(formDom);
// 			return formData;
// 		}

// 		return null;
// 	},


// 	/**
// 	 * Provides a way to update the default value of a particular field after it's been rendered.
// 	 *
// 	 * @param {[type]} fieldName  [description]
// 	 * @param {[type]} fieldValue [description]
// 	 *
// 	 * // TODO: Incomplete.
// 	 */
// 	setValue: function(fieldName, fieldValue) {
// 		var me = this,
// 			selector = this.getTypeSelector(fieldName);

// 		if (!selector) {
// 			console.warn('No selector for schema field: ' + fieldName);
// 			return;
// 		}

// 		this.onceRendered
// 			.then(function() {
// 				var el = me.el.down('.field ' + selector);
// 				if (el) {
// 					el.setValue(fieldName, fieldValue);
// 				}
// 			});
// 	},


// 	setAction: function(action) {
// 		this.action = action;
// 	},


// 	/**
// 	 * Handle form submision
// 	 *
// 	 * NOTE: detects if we have file changes(i.e. a file upload) in order to
// 	 * use the appropriate submission mechanism. If we have file changes, submit a form data.
// 	 * Otherwise, submit a json object. For the json object, only pass the values that actually changed.
// 	 *
// 	 */
// 	onSubmit: function() {
// 		var hasFileChanged = this.shouldSubmitFormData(),
// 			submit;

// 		if (hasFileChanged) {
// 			submit = this.saveFormData(this.getData(), this.action, this.method);
// 		} else {
// 			submit = this.saveJsonObject(this.getChangedValues(), this.action, this.method);
// 		}

// 		return submit;
// 	},


// 	/**
// 	 * Given a url, submit the form values
// 	 * @param  {String} url where to submit
// 	 * @return {Promise}
// 	 */
// 	submitTo: function(url) {
// 		this.setAction(url);
// 		return this.onSubmit();
// 	},


// 	/**
// 	 * Update a given record with the values in the form.
// 	 * On success sync the record with the response values from the server
// 	 * @param  {Object} record model to save to
// 	 * @return {Promise}
// 	 */
// 	submitToRecord: function(record) {
// 		var link = record.getLink('edit'),
// 			values = this.getChangedValues();

// 		if (!link) {
// 			return Promise.reject('No Edit Link');
// 		}

// 		this.setAction(link);

// 		return this.onSubmit()
// 			.then(function(response) {
// 				record.set(values);
// 				record.syncWithResponse(response);

// 				return record;
// 			});
// 	},


// 	/**
// 	 * Checks for file inputs and returns true if any of file was uploaded.
// 	 * @return {Boolean} Returns true if a file was uploaded, false otherwise.
// 	 */
// 	shouldSubmitFormData: function() {
// 		var fileInputs = document.querySelectorAll('form input[type=file]'),
// 			changed = false;
// 		for (var i = fileInputs.length - 1; i >= 0; i--) {
// 			input = fileInputs[i];
// 			if (input.files && input.files[0]) {
// 				changed = true;
// 			}
// 		}

// 		return changed;
// 	},


// 	/**
// 	 * Saves a FormData object
// 	 *
// 	 * @param  {FormData} data   FormData to be submitted.
// 	 * @param  {String} action the URL to save the form data to.
// 	 * @param  {String} method the action method to use (i.e POST or PUT)
// 	 * @return {Promise} fulfills or rejects with the save
// 	 */
// 	saveFormData: function(data, action, method) {
// 		var xhr = new XMLHttpRequest(),
// 			me = this;

// 		if (!data) {
// 			console.warn('Cannot save an empty form data.');
// 			return Promise.reject();
// 		}

// 		if (!action || !method) {
// 			console.error('The action (URL) and/or method (PUT, POST) of submission is missing.');
// 			return Promise.reject();
// 		}

// 		return new Promise(function(fulfill, reject) {
// 			xhr.open(method, action);
// 			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
// 			xhr.onreadystatechange = function() {
// 				//TODO: clean up this logic to not have potentially unhandled cases
// 				if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 201)) {
// 			        // me.record.syncWithResponse(xhr.responseText);
// 			        fulfill(xhr.responseText);
// 			        if (me.onSuccess) {
// 					 	me.onSuccess(xhr.responseText);
// 					}
// 			    } else {
// 			    	if (xhr.readyState === 4) {
// 			    		reject();
// 			    		if (me.onFailure) {
// 							me.onFailure(xhr.responseText);
// 						}
// 			    	}
// 			    }
// 			};

// 			xhr.send(data);
// 		});
// 	},


// 	/**
// 	 * Saves a JSON object
// 	 *
// 	 * @param  {Object} object the data to save
// 	 * @param  {String} action the url to save to
// 	 * @param  {String} method POST or PUT
// 	 * @return {Promise} fulfills or rejects with the save
// 	 */
// 	saveJsonObject: function(object, action, method) {
// 		var me = this;
// 		if (!action || !method) {
// 			console.error('The action (URL) and/or method (PUT, POST) of submission is missing.');
// 			return;
// 		}

// 		if (Object.keys(object).length === 0) {
// 			return;
// 		}

// 		method = method.toLocaleLowerCase();

// 		if (Service[method]) {
// 			return Service[method](action, object)
// 				.then(function(response) {
// 				 	if (me.onSuccess) {
// 				 		me.onSuccess(response);
// 				 	}

// 				 	return response;
// 				})
// 				.fail(function(reason) {
// 					//TODO: figure out how to handle this
// 					if (me.onFailure) {
// 						me.onFailure(reason);
// 					}

// 					return reason;
// 				});
// 		}

// 		//TODO: have a reasonable reason
// 		return Promise.reject();
// 	},


// 	/**
// 	 * Compares the default values against the current values to check for fields that actually changed.
// 	 * We also add in hidden values, since it's an easier way to pass necessary date (i.e. MimeTypes)
// 	 * Returns object of key-value pairs that changed.
// 	 *
// 	 * @return {Object} Map for key-value pairs that changed.
// 	 */
// 	getChangedValues: function() {
// 		var currentValues = this.getValues(),
// 			changed = {},
// 			key;

// 		for (key in currentValues) {
// 			if (currentValues.hasOwnProperty(key)) {
// 				if (currentValues[key] !== this.defaultValues[key]) {
// 					changed[key] = currentValues[key];
// 				}
// 			}
// 		}

// 		(this.schema || []).forEach(function(entry) {
// 			var key = entry && entry.name;
// 			if (entry && entry.type === 'hidden') {
// 				changed[key] = currentValues[key];
// 			}
// 		});

// 		return changed;
// 	},


// 	/**
// 	 * Get a selector for a particular field. Fields of each form are going to have different selectors
// 	 * based on the schema and each field's type.
// 	 * This method builds a selector to get to one particular field value given its name.
// 	 *
// 	 * @param  {String} fieldName schema's name for a particular field.
// 	 * @return {[type]}           [description]
// 	 */
// 	getTypeSelector: function(fieldName) {
// 		// We will need to loop through the schema to find the field with the given name.
// 		// TODO: To be implemented
// 	}
// });
