var Ext = require('extjs');
var FieldsFilePicker = require('./fields/FilePicker');
var FieldsImagePicker = require('./fields/ImagePicker');
var FieldsDatePicker = require('./fields/DatePicker');
var FieldsURL = require('./fields/URL');
var FormErrorMessages = require('./ErrorMessages');
var FieldsProgress = require('./fields/Progress');


module.exports = exports = Ext.define('NextThought.common.form.Form', {
	extend: 'Ext.Component',
	alias: 'widget.common-form',

	statics: {

		__getMessages: function () {
			this.__errorMessages = this.__errorMessages || new NextThought.common.form.ErrorMessages();

			return this.__errorMessages;
		},


		getMessageForError: function (errors) {
			var message = this.__getMessages();

			return message.getMessageForErrors(errors);
		}
	},

	/**
	 * Whether or not to send all the values back when submitted,
	 * or just the values that have changed
	 * @type {Boolean}
	 */
	sendAllValues: false,

	cls: 'form-container',

	INPUT_TYPES: {
		group: new Ext.XTemplate(Ext.DomHelper.markup({
			cls: 'group {name}'
		})),


		text: {
			append: function (el, data, returnEl) {
				var tpl,
					config = {
						cls: 'field {name}', cn: []
					},
					input = {
						tag: 'input',
						cls: 'simple',
						type: '{type}',
						name: '{name}',
						placeholder: '{placeholder}',
						value: '{value}',
						tabindex: '1'
					};

				if (data.displayName) {
					config.cn.push({
						tag: 'label',
						'for': '{name}',
						html: '{displayName}'
					});
				}

				if (data.required) {
					input.required = true;
				}

				if (data.maxlength) {
					input.maxlength = data.maxlength;
				}

				config.cn.push(input);

				config.cn.push({
					cls: 'msg'
				});

				tpl = new Ext.XTemplate(Ext.DomHelper.markup(config));

				return tpl.append(el, data, returnEl);
			}
		},
		// text: new Ext.XTemplate(Ext.DomHelper.markup({
		//	cls: 'field {name}', cn: [
		//		{tag: 'tpl', 'if': 'displayName', cn: [
		//			{tag: 'label', 'for': '{name}', html: '{displayName}'}
		//		]},
		//		{tag: 'tpl', 'if': 'required', cn: [
		//			{tag: 'input', type: '{type}', name: '{name}', placeholder: '{placeholder}', required: true, value: '{value}'}
		//		]},
		//		{tag: 'tpl', 'if': '!required', cn: [
		//			{tag: 'input', type: '{type}', name: '{name}', placeholder: '{placeholder}', value: '{value}'}
		//		]}
		//	]
		// })),
		//
		textarea: {
			append: function (el, data, returnEl) {
				var tpl,
					config = {
						cls: 'field {name}', cn: []
					},
					input = {
						tag: 'textarea',
						cls: 'simple',
						type: '{type}',
						name: '{name}',
						placeholder: '{placeholder}',
						value: '{value}',
						html: '{value}',
						tabindex: '1'
					};

				if (data.displayName) {
					config.cn.push({
						tag: 'label',
						'for': '{name}',
						html: '{displayName}'
					});
				}

				if (data.required) {
					input.required = true;
				}

				if (data.maxlength) {
					input.maxlength = data.maxlength;
				}

				config.cn.push(input);

				config.cn.push({
					cls: 'msg'
				});

				tpl = new Ext.XTemplate(Ext.DomHelper.markup(config));

				return tpl.append(el, data, returnEl);
			}
		},

		// textarea: new Ext.XTemplate(Ext.DomHelper.markup({
		//	cls: 'field {name}', cn: [
		//		{tag: 'tpl', 'if': 'displayName', cn: [
		//			{tag: 'label', 'for': '{name}', html: '{displayName}'}
		//		]},
		//		{tag: 'tpl', 'if': 'required', cn: [
		//			{tag: 'textarea', type: '{type}', name: '{name}', placeholder: '{placeholder}', required: true, html: '{value}'}
		//		]},
		//		{tag: 'tpl', 'if': '!required', cn: [
		//			{tag: 'textarea', type: '{type}', name: '{name}', placeholder: '{placeholder}', html: '{value}'}
		//		]}
		//	]
		// })),

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

		saveprogress: new Ext.XTemplate(Ext.DomHelper.markup({
			cls: 'save-progress'
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

	beforeRender: function () {
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

	afterRender: function () {
		this.callParent(arguments);

		this.buildInputs(this.schema, this.formEl);

		this.formEl.on('submit', this.formSubmit.bind(this));
		this.onFormChange();

		wait()
			.then(this.focusField.bind(this));
	},

	onDestroy: function () {
		var componentMap = this.componentMap || {},
			keys = Object.keys(componentMap);

		keys.forEach(function (key) {
			var cmp = componentMap[key];

			cmp.destroy();
		});
	},

	focusField: function (name) {
		var field = name ? {name: name} : this.getFirstField(),
			input = field && this.getInputForField(field.name);

		if (input && input.focus) { input.focus(); }
	},

	buildInputs: function (schema, el) {
		var me = this;

		schema.forEach(function (inputSchema) {
			me.addInput(inputSchema, el);
		});
	},

	addInput: function (schema, el) {
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
		} else if (type === 'saveprogress') {
			this.buildSaveProgress(schema, inputEl);
		} else {
			this.addFieldListeners(schema, inputEl);
		}
	},

	addFieldListeners: function (schema, inputEl) {
		var dom = inputEl.dom;

		if (schema.maxlength) {
			dom.addEventListener('keyup', this.checkMaxLength.bind(this, schema, dom));
		}

		dom.addEventListener('keyup', this.onFormChange.bind(this));
	},

	__buildComponent: function (cls, schema, inputEl) {
		var cmp = cls.create({
			defaultValue: schema.value,
			defaultValues: this.defaultValues,
			schema: schema,
			renderTo: inputEl,
			onChange: this.onFormChange.bind(this)
		});

		this.componentMap[schema.name] = cmp;
	},

	buildImageInput: function (schema, inputEl) {
		this.__buildComponent(NextThought.common.form.fields.ImagePicker, schema, inputEl);
	},

	buildFileInput: function (schema, inputEl) {
		this.__buildComponent(NextThought.common.form.fields.FilePicker, schema, inputEl);
	},

	buildDateInput: function (schema, inputEl) {
		this.__buildComponent(NextThought.common.form.fields.DatePicker, schema, inputEl);
	},

	buildUrlInput: function (schema, inputEl) {
		this.__buildComponent(NextThought.common.form.fields.URL, schema, inputEl);
	},

	buildSaveProgress: function (schema, inputEl) {
		this.saveProgressCmp = NextThought.common.form.fields.Progress.create({
			schema: schema,
			renderTo: inputEl
		});

		this.saveProgressCmp.hide();
	},

	getFirstField: function (schema) {
		var first, field, i = 0;

		schema = schema || this.schema;

		while (schema[i] && !first) {
			field = schema[i];

			if (field.type !== 'hidden' && field.type !== 'group') {
				first = field;
			} else if (field.inputs) {
				first = this.getFirstField(field.inputs);
			}

			i += 1;
		}

		return first;
	},

	getInputForField: function (name) {
		return this.__getComponent(name) || this.__getInput(name) || this.__getTextarea();
	},

	__getComponent: function (name) {
		return this.componentMap[name];
	},

	__getInput: function (name) {
		return this.el && this.el.dom.querySelector('input[name="' + name + '"]');
	},

	__getTextarea: function (name) {
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
	onFormChange: function (e) {
		var vals = this.getValues();

		if (this.onChange) {
			this.onChange(vals);
		}
	},

	checkMaxLength: function (schema, field) {
		var input = field.querySelector('input, textarea'),
			value = input && input.value,
			length = value && value.length,
			maxLength = schema.maxlength,
			warnThreshold = schema.warnThreshold || 20,
			errorThreshold = schema.errorThreshold || 5;
	},

	/**
	 * Whether or not all the validation has been met
	 *
	 * @return {Boolean}
	 */
	isValid: function () {
		var form = this.formEl.dom;

		return form.checkValidity ? form.checkValidity() : true;
	},

	getErrors: function (schema, errors) {
		var me = this;

		schema = schema || this.schema;
		errors = errors || {};

		schema.forEach(function (entry) {
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

	getErrorsFor: function (name) {
		var cmp = this.__getComponent(name),
			inputEl = this.__getInput(name),
			textarea = this.__getTextarea(name),
			field = inputEl || textarea,
			error, hasErrors = false, keys;

		if (cmp) {
			if (cmp.getErrors) {
				error = cmp.getErrors();
			}
		} else if (field) {
			error = {
				missing: field.validity && field.validity.valueMissing
			};
		}

		(Object.keys(error || {}) || []).forEach(function (key) {
			var type = error[key];

			if (type) {
				hasErrors = true;
			}
		});


		return hasErrors && error;
	},

	__componentsEmpty: function () {
		var components = this.componentMap,
			keys = Object.keys(components),
			isEmpty = true;

		keys.forEach(function (key) {
			var cmp = components[key];

			if (cmp.isEmpty && !cmp.isEmpty()) {
				isEmpty = false;
			}
		});

		return isEmpty;
	},

	__inputsEmpty: function () {
		var inputs = this.el.dom.querySelectorAll('input[type=text], textarea'),
			isEmpty = true;

		inputs = Array.prototype.slice.call(inputs);

		inputs.forEach(function (input) {
			if (input.value) {
				isEmpty = false;
			}
		});

		return isEmpty;
	},

	isEmpty: function () {
		if (!this.rendered) {
			return true;
		}

		return this.__componentsEmpty() && this.__inputsEmpty();
	},

	getValues: function (schema, values) {
		var me = this;

		schema = schema || me.schema || [];

		values = values || {};

		schema.forEach(function (entry) {
			var name = entry.name;

			if (entry.type === 'group') {
				me.getValues(entry.inputs, values);
			} else {
				values[name] = me.getValueOf(name);
			}
		});

		return values;
	},

	getValueOf: function (name) {
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

	getChangedValues: function () {
		var schema = this.schema,
			sendAllValues = this.sendAllValues,
			newValues = this.getValues(),
			oldValues = this.defaultValues;

		function reducer (acc, part) {
			var oldValue = oldValues[part.name],
				newValue = newValues[part.name];

			if (part.type === 'group') {
				part.inputs.reduce(reducer, acc);
			} else if (sendAllValues || oldValue !== newValue || part.type === 'hidden' || part.keep === true) {
				//If the newValue is undefined assume that means null it out,
				//so set it explicitly to null so the value makes it to the server
				acc[part.name] = newValue === undefined ? null : newValue;
			}

			return acc;
		}

		return schema.reduce(reducer, {});
	},

	getFormData: function () {
		var form = this.formEl.dom,
			components = this.componentMap,
			keys = Object.keys(components),
			formData;

		if (!form) { return; }

		formData = new FormData(form);

		keys.forEach(function (key) {
			var cmp = components[key];

			if (cmp.appendToFormData) {
				cmp.appendToFormData(formData);
			}
		});

		return formData;
	},

	hasFiles: function () {
		var componentMap = this.componentMap,
			keys = Object.keys(componentMap),
			hasFile = false;

		keys.forEach(function (key) {
			var cmp = componentMap[key];

			if (cmp.hasFile && cmp.hasFile()) {
				hasFile = true;
			}
		});

		return hasFile;
	},

	onSubmitProgress: function (e) {
		if (!this.saveProgressCmp) { return; }

		this.saveProgressCmp.setProgress(e.loaded, e.total);
	},

	__buildXHR: function (url, method, success, failure) {
		var xhr = new XMLHttpRequest(),
			progress = this.onSubmitProgress.bind(this);

		xhr.open(method || 'POST', url, true);

		xhr.upload.addEventListener('progress', progress);
		xhr.upload.addEventListener('load', progress);

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					success(xhr.responseText);
				} else {
					failure({
						status: xhr.status,
						responseText: xhr.responseText
					});
				}
			}
		};

		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		return xhr;
	},

	__submitFormData: function (formData, url, method) {
		var me = this;

		return new Promise(function (fulfill, reject) {
			var xhr = me.__buildXHR(url, method, fulfill, reject);

			xhr.send(formData);
		});
	},

	__submitJSON: function (values, url, method) {
		var me = this;

		return new Promise(function (fulfill, reject) {
			var xhr = me.__buildXHR(url, method, fulfill, reject);

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
	submitTo: function (url) {
		var me = this,
			hasFiles = me.hasFiles(),
			progress = me.saveProgressCmp,
			submit;

		if (!url) {
			return Promise.reject('No Link Provided');
		}

		if (progress) {
			me.addCls('saving');
			progress.show();
			progress.start();
		} else {
			me.el.mask('Saving...');
		}

		if (hasFiles) {
			submit = me.__submitFormData(me.getFormData(), url, me.method || 'POST');
		} else {
			submit = me.__submitJSON(me.getChangedValues(), url, me.method || 'POST');
		}


		return submit
			.then(function (results) {
				if (progress) {
					return progress.stop()
						.then(function () {
							me.removeCls('saving');
							return results;
						});
				}

				me.el.unmask();
				return results;
			})
			.fail(function (reason) {
				if (progress) {
					progress.showError();
					me.removeCls('saving');
				} else {
					me.el.unmask();
				}

				return Promise.reject(reason);
			});
	},

	doSubmit: function () {
		var submit;

		if (this.action) {
			submit = this.submitTo(this.action);
		} else {
			submit = Promise.reject('No action to submit to');
		}

		return submit;
	},

	submitToRecord: function (record) {
		var link = record.getLink('edit'),
			values = this.getChangedValues();

		if (!link) {
			return Promise.reject('No Edit Link');
		}

		return this.submitTo(link)
			.then(function (response) {
				record.set(values);
				record.syncWithResponse(response);

				return record;
			});
	},

	showErrorOn: function (name, reason) {
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

	removeErrorOn: function (name) {
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

	setPlaceholder: function (name, value) {
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
	},

	setValue: function (name, value) {
		var cmp = this.__getComponent(name),
			inputEl = this.__getInput(name),
			textarea = this.__getTextarea(name);

		if (cmp) {
			if (cmp.setValue) {
				cmp.setValue(value);
			}
		} else if (inputEl) {
			inputEl.value = value;
		} else if (textarea) {
			textarea.value = value;
		}
	},

	formSubmit: function (e) {
		e.preventDefault();

		if (this.onSubmit) {
			this.onSubmit();
		}
	}
});
