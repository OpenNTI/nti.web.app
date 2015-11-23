Ext.define('NextThought.common.form.Form', {
	extend: 'Ext.Component',
	alias: 'widget.common-form',

	cls: 'form-container',

	requires: [
		'NextThought.common.form.fields.FilePicker'
	],

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
		var formDom = document.querySelector('form');
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
