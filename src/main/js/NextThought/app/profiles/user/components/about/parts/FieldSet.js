Ext.define('NextThought.app.profiles.user.components.about.parts.FieldSet', {
	extend: 'Ext.Component',

	afterRender: function() {
		this.callParent(arguments);
		this.el.selectable();
	},

	setSchema: function(schema) {
		this.profileSchema = schema;

		if (!this.rendered) {
			this.on('afterrender', this.applySchema.bind(this));
		} else {
			this.applySchema();
		}
	},


	applySchema: function() {
		var dom = this.el.dom,
			profileSchema = this.profileSchema.ProfileSchema,
			fields = dom.querySelectorAll('[data-field]');

		fields = Array.prototype.slice.call(fields);

		fields.forEach(function(field) {
			var name = field.getAttribute('data-field'),
				schema = profileSchema[name];

			if (schema && !schema.readonly) {
				field.classList.add('editable');
			}
		});

		this.appliedSchema = true;

		if (this.editMode) {
			this.setEditable();
		}
	},


	setUneditable: function() {
		if (!this.appliedSchema) {
			delete this.editMode;
			return;
		}

		var dom = this.el.dom,
			fields = dom.querySelectorAll('.editable[contenteditable]');

		fields = Array.prototype.slice.call(fields);

		fields.forEach(function(field) {
			field.removeAttribute('conttenteditable');
		});
	},


	setEditable: function() {
		if (!this.appliedSchema) {
			this.editMode = true;
			return;
		}

		var dom = this.el.dom,
			fields = dom.querySelectorAll('.editable[data-field]');

		fields = Array.prototype.slice.call(fields);

		fields.forEach(function(field) {
			field.setAttribute('contenteditable', true);
		});
	},


	showErrorForField: function(fieldName, msg) {
		var entry = this.el.dom.querySelector('[data-field="' + fieldName + '""]'),
			container = entry && entry.parentNode,
			error = container && container.querySelector('.error-msg');

		if (entry) {
			entry.classList.add('error');
		}

		if (error) {
			error.innerHTML = msg;
		}
	},

});
