Ext.define('NextThought.common.form.Form', {
	extend: 'Ext.Component',
	alias: 'widget.common-form',

	requires: [
		'NextThought.common.form.fields.FilePicker',
		'NextThought.common.form.fields.ImagePicker',
		'NextThought.common.form.fields.DatePicker',
		'NextThought.common.form.fields.URL',
		'NextThought.common.form.ErrorMessages'
	],


	statics: {

		__getMessages: function() {
			this.__errorMessages = this.__errorMessages || new NextThought.common.form.ErrorMessages();

			return this.__errorMessages;
		},


		getMessageForError: function(errors) {
			var message = this.__getMessages();

			return message.getMessageForErrors(errors);
		}
	},


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

		url: new Ext.XTemplate(Ext.DomHelper.markup({
			cls: 'field {name} url', cn: [
				{tag: 'tpl', 'if': 'displayName', cn: [
					{tag: 'label', 'for': '{name}', html: '{displayName}'}
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
		{tag: 'form', cls: 'common-form', enctype: '{enctype}', autocomplete: '{autocomplete}', name: '{name}'}
	]),


	renderSelectors: {
		formEl: 'form'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.componentMap = {};

		this.on('destroy', this.onDestroy.bind(this));

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

		this.onFormChange();
	},


	onDestroy: function() {
		var componentMap = this.componentMap || {},
			keys = Object.keys(componentMap);

		keys.forEach(function(key) {
			var cmp = componentMap[key];

			cmp.destroy();
		});
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
		} else if (type === 'url') {
			this.buildUrlInput(schema, inputEl);
		}
	},


	__buildComponent: function(cls, schema, inputEl) {
		var cmp = cls.create({
			defaultValue: schema.value,
			schema: schema,
			renderTo: inputEl,
			onChange: this.onFormChange.bind(this)
		});

		this.componentMap[schema.name] = cmp;
	},


	buildImageInput: function(schema, inputEl) {
		this.__buildComponent(NextThought.common.form.fields.ImagePicker, schema, inputEl);
	},


	buildFileInput: function(schema, inputEl) {
		this.__buildComponent(NextThought.common.form.fields.FilePicker, schema, inputEl);
	},


	buildDateInput: function(schema, inputEl) {
		this.__buildComponent(NextThought.common.form.fields.DatePicker, schema, inputEl);
	},


	buildUrlInput: function(schema, inputEl) {
		this.__buildComponent(NextThought.common.form.fields.URL, schema, inputEl);
	},


	setUpChangeListeners: function() {
		var me = this,
			inputs = this.el.dom.querySelectorAll('.field input[type=text], .field textarea');

		inputs = Array.prototype.slice.call(inputs);

		inputs.forEach(function(input) {
			input.addEventListener('keyup', me.onFormChange.bind(me));
		});
	},


	__getComponent: function(name) {
		return this.componentMap[name];
	},


	__getInput: function(name) {
		return this.el && this.el.dom.querySelector('input[name="' + name + '"]');
	},


	__getTextarea: function(name) {
		return this.el && this.el.dom.querySelector('textarea[name="' + name + '"]');
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
		var form = this.formEl.dom;

		return form.checkValidity ? form.checkValidity() : true;
	},


	getErrors: function(schema, errors) {
		var me = this;

		schema = schema || this.schema;
		errors = errors || {};

		schema.forEach(function(entry) {
			var name = entry.name,
				error;

			if (entry.type === 'group') {
				me.getErrors(entry.inputs, errors);
				return;
			}

			error = me.getErrorsFor(name);

			if (error) {
				errors[name] = error;
			}
		});

		return errors;
	},


	getErrorsFor: function(name) {
		var cmp = this.__getComponent(name),
			inputEl = this.__getInput(name),
			textarea = this.__getTextarea(name),
			error, hasErrors = false, keys;

		if (cmp) {
			if (cmp.getErrors) {
				error = cmp.getErrors();
			}
		} else if (inputEl) {
			error = {
				missing: inputEl.validity && inputEl.validity.valueMissing
			};
		} else if (textarea) {
			error = {
				missing: textarea.valdity && textarea.validity.valueMissing
			};
		}

		(Object.keys(error || {}) || []).forEach(function(key) {
			var type = error[key];

			if (type) {
				hasErrors = true;
			}
		});


		return hasErrors && error;
	},


	__componentsEmpty: function() {
		var components = this.componentMap,
			keys = Object.keys(components),
			isEmpty = true;

		keys.forEach(function(key) {
			var cmp = components[key];

			if (cmp.isEmpty && !cmp.isEmpty()) {
				isEmpty = false;
			}
		});

		return isEmpty;
	},


	__inputsEmpty: function() {
		var inputs = this.el.dom.querySelectorAll('input[type=text], textarea'),
			isEmpty = true;

		inputs = Array.prototype.slice.call(inputs);

		inputs.forEach(function(input) {
			if (input.value) {
				isEmpty = false;
			}
		});

		return isEmpty;
	},


	isEmpty: function() {
		if (!this.rendered) {
			return true;
		}

		return this.__componentsEmpty() && this.__inputsEmpty();
	},


	getValues: function(schema, values) {
		var me = this;

		schema = schema || me.schema || [];

		values = values || {};

		schema.forEach(function(entry) {
			var name = entry.name;

			if (entry.type === 'group') {
				me.getValues(entry.inputs, values);
			} else {
				values[name] = me.getValueOf(name);
			}
		});

		return values;
	},


	getValueOf: function(name) {
		var cmp = this.__getComponent(name),
			inputEl = this.__getInput(name),
			textarea = this.__getTextarea(name),
			value;

		if (cmp) {
			if (cmp.getValue) {
				value = cmp.getValue();
			}
		} else if (inputEl) {
			value = inputEl.value;
		} else if (textarea) {
			value = textarea.value;
		}

		return value;
	},


	getChangedValues: function() {
		var schema = this.schema,
			newValues = this.getValues(),
			oldValues = this.defaultValues;

		function reducer(acc, part) {
			var oldValue = oldValues[part.name],
				newValue = newValues[part.name];

			if (part.type === 'group') {
				part.inputs.reduce(reducer, acc);
			} else if (oldValue !== newValue || part.type === 'hidden') {
				acc[part.name] = newValue;
			}

			return acc;
		}

		return schema.reduce(reducer, {});
	},


	getFormData: function() {
		var form = this.formEl.dom,
			components = this.componentMap,
			keys = Object.keys(components),
			formData;

		if (!form) { return; }

		formData = new FormData(form);

		keys.forEach(function(key) {
			var cmp = components[key];

			if (cmp.appedToFormData) {
				cmp.appendToFormData(data);
			}
		});

		return formData;
	},


	hasFiles: function() {
		var componentMap = this.componentMap,
			keys = Object.keys(componentMap),
			hasFile = false;

		keys.forEach(function(key) {
			var cmp = componentMap[key];

			if (cmp.hasFile && cmp.hasFile()) {
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

			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
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
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
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
	},


	showErrorOn: function(name, reason) {
		var cmp = this.__getComponent(name),
			inputEl = this.__getInput(name),
			textarea = this.__getTextarea(name);

		if (cmp) {
			if (cmp.showError) {
				cmp.showError(name, reason);
			}
		} else if (inputEl) {
			inputEl.classList.add('error');
		} else if (textarea) {
			textarea.classList.add('error');
		}
	},


	removeErrorOn: function(name) {
		var cmp = this.__getComponent(name),
			inputEl = this.__getInput(name),
			textarea = this.__getTextarea(name);

		if (cmp) {
			if (cmp.removeError) {
				cmp.removeError(name);
			}
		} else if (inputEl) {
			inputEl.classList.remove('error');
		} else if (textarea) {
			textarea.classList.remove('error');
		}
	},


	setPlaceholder: function(name, value) {
		var cmp = this.__getComponent(name),
			inputEl = this.__getInput(name),
			textarea = this.__getTextarea(name);

		if (cmp) {
			if (cmp.setPlaceholder) {
				cmp.setPlaceholder(value);
			}
		} else if (inputEl) {
			inputEl.setAttribute('placeholder', value);
		} else if (textarea) {
			textarea.setAttribute('placeholder', value);
		}
	}
});
