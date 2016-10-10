var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.about.parts.FieldSet', {
	extend: 'Ext.Component',

	INPUT_TYPE_KEY_HANDLER: {
		'numeric': 'limitToNumber',
		'text-line': 'limitToLine'
	},

	afterRender: function () {
		this.callParent(arguments);
		this.el.selectable();

		this.enableBubble(['clear-errors']);

		this.onKeyPress = this.onKeyPress.bind(this);

		this.el.dom.addEventListener('keypress', this.onKeyPress.bind(this));

		if (this.emptyTextEl) {
			this.mon(this.emptyTextEl, 'click', this.editProfile.bind(this));
		}
	},


	editProfile: function () {
		if (this.doEdit) {
			this.doEdit();
		}
	},


	onKeyPress: function (e) {
		var inputType = e.target.getAttribute('data-input-type'),
			fnName = this.INPUT_TYPE_KEY_HANDLER[inputType];
		if (this.hasErrors) {
			this.clearErrors(e);
		}

		if (Ext.isFunction(this[fnName])) {
			this[fnName](e);
		}
	},


	limitToNumber: function (e) {
		var charCode = e.key || e.charCode;

		//if its not a control char and not a number
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			e.preventDefault();
		}
	},

	limitToLine: function (e) {
		var charCode = e.key || e.charCode;
		if (charCode == Ext.EventObject.ENTER) {
			e.preventDefault();
		}
	},

	clearErrors: function (e) {
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


	clearAllErrors: function () {
		let errorContainers = this.el.dom.querySelectorAll('.field-container .error-msg');
		let errors = this.el.dom.querySelectorAll('.error');

		errorContainers = Array.prototype.slice.call(errorContainers);
		errors = Array.prototype.slice.call(errors);

		errors.forEach(function (err) {
			err.classList.remove('error');
		});

		errorContainers.forEach((err) => {
			err.innerHTML = '';
		});

		this.fireEvent('clear-errors', this.name);
	},


	setSchema: function (schema) {
		this.profileSchema = schema;

		if (!this.rendered) {
			this.on('afterrender', this.applySchema.bind(this));
		} else {
			this.applySchema();
		}
	},


	applySchema: function () {
		var dom = this.el.dom,
			profileSchema = this.profileSchema.ProfileSchema,
			fields = dom.querySelectorAll('[data-field]');

		fields = Array.prototype.slice.call(fields);

		fields.forEach(function (field) {
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


	setUneditable: function () {
		delete this.editMode;

		if (!this.appliedSchema) {
			return;
		}

		var dom = this.el.dom,
			simpleFields = dom.querySelectorAll('.editable[contenteditable]:not(.use-editor)');

		simpleFields = Array.prototype.slice.call(simpleFields);

		simpleFields.forEach(function (field) {
			field.removeAttribute('contenteditable');
		});
	},


	setEditable: function () {
		this.editMode = true;

		if (!this.appliedSchema) {
			return;
		}

		var dom = this.el.dom,
			simpleFields = dom.querySelectorAll('.editable[data-field]:not(.use-editor)');

		simpleFields = Array.prototype.slice.call(simpleFields);

		simpleFields.forEach(function (field) {
			field.setAttribute('contenteditable', true);
		});
	},


	showError: function (msg) {
		var field = msg.field,
			entry = this.el.dom.querySelector('[data-field="' + field + '"]');

		if (field) {
			this.hasErrors = true;
			this.showErrorForField(field, '');
		}

		return !!entry;
	},


	showErrorForField: function (fieldName, msg) {
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
