Ext.define('NextThought.common.form.Form', {
	extend: 'Ext.Component',
	alias: 'widget.common-form',

	requires: [
		'NextThought.common.form.fields.FilePicker',
		'NextThought.common.form.fields.ImagePicker',
		'NextThought.common.form.fields.DatePicker',
		'NextThought.common.form.fields.URL'
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
	},


	onDestroy: function() {
		var componentMap = this.componentMap,
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
		var cmp = this.componentMap[name],
			inputEl = this.el.dom.querySelector('input[name="' + name + '"]'),
			textarea = this.el.dom.querySelector('textarea[name="' + name + '"]'),
			value;

		if (cmp) {
			if (cmp.getValue) {
				cmp.getValue();
			}
		} else if (inputEl) {
			value = inputEl.value;
		} else if (textarea) {
			value = textarea.value;
		}

		return value;
	},


	getFormData: function() {
		var form = this.formEl.dom,
			imagePickers = this.imagePickers,
			keys, formData;

		if (!form) { return; }

		formData = new FormData(form);

		keys = Object.keys(imagePickers);

		keys.forEach(function(key) {
			var picker = imagePickers[key];

			picker.appendToFormData(formData);
		});


		return formData;
	},


	hasFiles: function() {
		var componentMap = this.componentMap,
			keys = Object.keys(componentMap),
			hasFile = true;

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
	},


	setPlaceholder: function(name, value) {
		var cmp = this.componentMap[name],
			inputEl = this.el.dom.querySelector('input[name="' + name + '"]'),
			textarea = this.el.dom.querySelector('textarea[name="' + name + '"]');

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
