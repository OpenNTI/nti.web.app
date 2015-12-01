Ext.define('NextThought.common.form.Form', {
	extend: 'Ext.Component',
	alias: 'widget.common-form',

	cls: 'form-container',

	requires: [
		'NextThought.common.form.fields.FilePicker'
	],

	renderTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'form', enctype: 'multipart/form-data', method: 'post', name: 'form', cn: [
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
						{tag: 'input', type: 'hidden', value: '{[this.getDefaultValue(values.name)]}'}
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
	},


	attachChangeListeners: function() {
		var inputFields = document.querySelectorAll('.field input, .field textarea'),
			me = this, field, el;

		for (var i=0; i < inputFields.length; i++){
			field = inputFields[i];
			if (field) {
				field.addEventListener('keyup', this.formChanged.bind(this));
			}
		}
	},


	setupFilePickerFields: function(){
		var fileFields = document.querySelectorAll('.field[data-type=file]'),
			me = this, field, el, name, cmp;

		for (var i = 0; i < fileFields.length; i++) {
			field = fileFields[i];
			el = Ext.get(field);

			if (el) {
				name = field.getAttribute && field.getAttribute('data-name');

				cmp = Ext.widget('file-picker-field', {
					thumbnail: name && me.defaultValues[name],
					name: name,
					renderTo: el,
					formChanged: me.formChanged.bind(me)
				});

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

	/**
	 * This function returns an object of key-value pairs for each field of the schema.
	 *
	 * @return {[type]} [description]
	 */
	getValues: function() {
		var vals = {}, me = this;

		(this.schema || []).forEach(function(entry) {
			var dom = document.querySelector('.field.' + entry.name + ' [type=' + entry.type + ']');
			if (dom) {
				if (entry.type === 'file') {
					vals[entry.name] = dom.getAttribute('data-value');
				}
				else {
					vals[entry.name] = dom.value;
				}
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


	/**
	 * Handle form submision
	 *
	 * NOTE: detects if we have file changes(i.e. a file upload) in order to
	 * use the appropriate submission mechanism. If we have file changes, submit a form data.
	 * Otherwise, submit a json object. For the json object, only pass the values that actually changed.
	 * 
	 */
	onSubmit: function(){
		var hasFileChanged = this.shouldSubmitFormData(); 

		if (hasFileChanged) {
			this.saveFormData(this.getData(), this.action, this.method);
		}
		else {
			this.saveJsonObject(this.getChangedValues(), this.action, this.method);
		}
	},


	/**
	 * Checks for file inputs and returns true if any of file was uploaded.
	 * @return {Boolean} Returns true if a file was uploaded, false otherwise. 
	 */
	shouldSubmitFormData: function(){
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
	 * @return {[type]} None.
	 */
	saveFormData: function(data, action, method) {
		var xhr = new XMLHttpRequest(),
			me = this;

		if (!data) {
			console.warn('Cannot save an empty form data.');
			return;
		}

		if (!action || !method) {
			console.error('The action (URL) and/or method (PUT, POST) of submission is missing.');
			return;
		}

		xhr.open(method, action);
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4 && xhr.status === 200) {
		        // me.record.syncWithResponse(xhr.responseText);
		        if (me.onSuccess) {
				 	me.onSuccess(xhr.responseText);
				}
		    }
		    else {
		    	if (xhr.readyState === 4) {
		    		if (me.onFailure) {
						me.onFailure(xhr.responseText);
					}	
		    	}
		    }
		}

		xhr.send(data);
	},


	/**
	 * Saves a JSON object
	 * 
	 * @param  {Object} object [description]
	 * @param  {String} action [description]
	 * @param  {String} method [description]
	 * @return {[type]}        [description]
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
			Service[method](action, object)
				.then(function(response) {
				 	if (me.onSuccess) {
				 		me.onSuccess(response);
				 	}
				})
				.fail(function(reason) {
					//TODO: figure out how to handle this
					if (me.onFailure) {
						me.onFailure(reason);
					}
				});
		}
	},


	/**
	 * Compares the default values against the current values to check for fields that actualy changed.
	 * Returns object of key-value pairs that changed.
	 * 
	 * @return {Object} Map for key-value pairs that changed.
	 */
	getChangedValues: function(){
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
