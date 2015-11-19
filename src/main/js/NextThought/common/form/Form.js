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
						{cls: 'img', style: { backgroundImage: 'url({[this.getDefaultValue(values.name)]})'}, cn: [
							{tag: 'input', type: 'file'}
						]},
						{cls: 'img-name'}
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
		getDefaultValue: function(name, defaultValues){
			return this.defaultValues[name];
		}
	}),


	defaultValues: {
		'title': 'title'
	},


	beforeRender: function(){
		this.callParent(arguments);

		this.renderTpl.defaultValues = Ext.applyIf(this.data || {},  this.defaultValues);

		this.renderData = Ext.apply(this.renderData || {}, {
			schema: this.schema
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.attachChangeListeners();
	},


	attachChangeListeners: function () {
		var inputFields = this.el.query('.field input, .field textarea'),
			fileInputFields = document.querySelectorAll('input[type=file]'),
			me = this;

		Ext.each(inputFields, function (field) {
			var el = Ext.get(field);

			me.mon(el, {
				keyup: me.formChanged.bind(me)
			})
		});

		Ext.each(fileInputFields, function (field) {
			field.addEventListener('change', me.onFileChanged.bind(me));
		});

	},


	/**
	 * Fire an change event event when a field is edited.
	 * This allows whoever is listening on form change event to update instantly.
	 *
	 * This function fires a change event with a key-value pair for each field in the form.
	 *
	 * NOTE: while in the future, we will optimize this to only return the value of the field that changed,
	 * for now, we will return the entire form values. 
	 * 
	 * @param  {[type]} e Browser Event.
	 * 
	 */
	formChanged: function(e) {
		var vals = {}, me = this;

		Ext.each(this.schema, function (entry) {
			var el = me.el.down('.field.'+ entry.name + ' [type=' + entry.type + ']');
			if (el){
				vals[entry.name] = el.dom.value;
			}
		});

		if (this.onChange) {
			this.onChange(vals);	
		}
	},


	onFileChanged: function (e) {
		console.log('File Uploaded: event=', e);
	},


	/**
	 * Get a form data. We are using HTML5 FormData object to return an object that contains
	 * the whole form object.
	 * 
	 * @return {[type]} [description]
	 */
	getData: function () {
		var formDom = this.el.dom.querySelector('form');
		if (formDom){
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
			selector = this.getTypeSelector(fieldName)

		if (!selector) {
			console.warn('No selector for schema field: '+ fieldName);
			return;
		}

		this.onceRendered
			.then(function(){
				var el = me.el.down('.field '+ selector);
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
	getTypeSelector: function (fieldName) {
		// We will need to loop through the schema to find the field with the given name.
		// TODO: To be implemented
	}
})