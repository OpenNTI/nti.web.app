Ext.define('NextThought.app.profiles.user.components.about.parts.FieldSet', {
	extend: 'Ext.Component',

	afterRender: function() {
		this.callParent(arguments);
		this.el.selectable();

		this.enableBubble(['clear-errors']);

		this.onKeyPress = this.onKeyPress.bind(this);

		this.el.dom.addEventListener('keypress', this.onKeyPress.bind(this));
	},


	onKeyPress: function(e) {
		if (this.hasErrors) {
			this.clearErrors(e);
		}

		if (e.target.getAttribute('data-input-type') === 'numeric') {
			this.limitToNumber(e);
		}
	},


	limitToNumber: function(e) {
		var charCode = e.key || e.charCode;

		//if its not a control char and not a number
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			e.preventDefault();
		}
	},


	clearErrors: function(e) {
		//if you haven't typed in a field that has 
		if (!e.target || !e.target.classList.contains('error')) { return; }

		var entry = e.target,
			container = entry && entry.parentNode,
			error = container && container.querySelector('.error-msg'),
			hasMore;

		if (entry) {
			entry.classList.remove('error');
		}

		if (error) {
			error.innerHTML = '';
		}

		hasMore = this.el.dom.querySelectorAll('.error').length;

		if (!hasMore) {
			this.hasErrors = false;
			this.fireEvent('clear-errors', this.name);
		}
	},


	clearAllErrors: function() {
		var errors = this.el.dom.querySelectorAll('.error');

		errors = Array.prototype.slice.call(errors);

		errors.forEach(function(err) {
			err.classList.remove('error');
		});

		this.fireEvent('clear-errors', this.name);
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
			var container = field && field.parentNode,
				label = container && container.querySelector('.field-label'),
				name = field.getAttribute('data-field'),
				schema = profileSchema[name];

			if (schema && !schema.readonly) {
				field.classList.add('editable');
			}

			if (schema && schema.required && label) {
				label.classList.add('required');
			}
		});

		this.appliedSchema = true;

		if (this.editMode) {
			this.setEditable();
		}
	},


	setUneditable: function() {
		delete this.editMode;

		if (!this.appliedSchema) {
			return;
		}

		var dom = this.el.dom,
			fields = dom.querySelectorAll('.editable[contenteditable]');

		fields = Array.prototype.slice.call(fields);

		fields.forEach(function(field) {
			field.removeAttribute('contenteditable');
		});
	},


	setEditable: function() {
		this.editMode = true;

		if (!this.appliedSchema) {
			return;
		}

		var dom = this.el.dom,
			fields = dom.querySelectorAll('.editable[data-field]');

		fields = Array.prototype.slice.call(fields);

		fields.forEach(function(field) {
			field.setAttribute('contenteditable', true);
		});
	},


	showError: function(msg) {
		var field = msg.field,
			entry = this.el.dom.querySelector('[data-field="' + field + '"]');

		if (field) {
			this.hasErrors = true;
			this.showErrorForField(field, '');
		}

		return !!entry;
	},


	showErrorForField: function(fieldName, msg) {
		var entry = this.el.dom.querySelector('[data-field="' + fieldName + '"]'),
			container = entry && entry.parentNode,
			error = container && container.querySelector('.error-msg');

		if (entry) {
			entry.classList.add('error');
		}

		if (error) {
			error.innerHTML = msg;
		}
	}
});
