Ext.define('NextThought.view.profiles.mixins.EditUserMixin', {


	onSaveEdits: function(finish) {
		var me = this, fields = me.getEditableFields(),
			user = me.user, newValues = {}, oldValues = {}, hasChanged = false;

		(fields || []).forEach(function(field) {
			var prop = field.getAttribute('data-field'),
				old = user.get(prop),
				text = me.getValueForField(field), valid;

			//if it has the placeholder don't set the value
			if (text === false) {
				newValues[prop] = null;
				return;
			}

			valid = me.validate(prop, text);

			if (valid === true && text !== old) {
				//if its valid and changed set the value
				newValues[prop] = text;
				oldValues[prop] = old;
				hasChanged = true;
			}
		});

		if (hasChanged) {
			user.set(newValues);
			user.save({
				success: function(resp) {
					var o = resp.responseText,
						newUser = ParseUtils.parseItems(o)[0];

					// NOTE: Update the links that way in case the email changed, we request verification.
					user.set('Links', newUser.get('Links'));
					finish(true);
					me.onHideEditing();
				},
				failure: function(resp) {
					var msg = Ext.JSON.decode(resp.responseText, true);

					//if we fail reset the old values
					user.set(oldValues);

					me.showError(msg.message, msg.field);

					me.resetFields(fields, newValues);
				}
			});
		}

		return true;
	},


	getValueForField: function(field) {
		var isRich = field.getAttribute('data-rich-text'),
			text = field.textContent;

		//if it has the placeholder don't set the value
		if (field.querySelector('.placeholder')) {
			return false;
		}

		if (isRich) {
			text = DomUtils.sanitizeExternalContentForInput(field.innerHTML);
		}

		//use null instead of the empty string
		text = text === '' ? null : text;

		return text;
	},


	getEditableFields: function() {
		return this.el && this.el.query('.editable[data-field]');
	},


	onSaveField: function(cmp, newValue, oldValue) {
		var field = cmp.boundEl.getAttribute('data-field'),
			user = this.userObject,
			me = this;

		if (!isMe(user)) {
			console.warn('Attempting to edit another user\'s record');
			return;
		}

		//treat empty string as null
		if (Ext.isEmpty(newValue)) {
			newValue = null;
		}

		me.clearError();

		function success(n, v) {
			console.log(arguments);
			me.updateField(cmp.boundEl, n, v);
			delete me.savingField;
		}

		function failure(rsp) {
			var resultJson = {};
			if (/application\/json/.test(rsp.getResponseHeader('Content-Type') || '')) {
				resultJson = Ext.JSON.decode(rsp.responseText, true);
			}
			//alert('Could not save your '+field);
			console.error(arguments);
			//Note we start editing against the oldValue here
			//and then set the value to newValue so that the logic
			//to detect if a value actually changed remains the same regardless of whether
			//you are saving after a failure.
			cmp.startEdit(cmp.boundEl, oldValue);
			cmp.setValue(newValue);
			cmp.field.setError();
			me.showError(resultJson.message || getString('NextThought.view.profiles.About.unknown'));
			delete me.savingField;
		}

		console.debug('saving:', field, '=', newValue, 'in', user);
		//TODO: Check the schema
		me.savingField = true;
		user.saveField(field, newValue, success, failure);
	},


	onCancelEdits: function(finish) {
		var me = this,
			fields = me.getEditableFields(),
			user = me.user, hasChanged;

		(fields || []).every(function(field) {
			var prop = field.getAttribute('data-field'),
				text = me.getValueForField(field);

			//if its not the placeholder and the text has changed
			if (!field.querySelector('.placeholder') && text !== user.get(prop)) {
				hasChanged = true;
				return false;
			}

			return true;
		});

		//if we have changes alert the user before canceling
		if (hasChanged) {
			/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
			Ext.Msg.show({
				msg: 'Canceling will lose any changes you have made.',
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				scope: me,
				icon: 'warning-red',
				buttonText: {'ok': 'Yes'},
				title: 'Are you sure?',
				fn: function(str) {
					if (str === 'ok') {
						me.onHideEditing();
						me.resetFields(fields);
						finish.call(null, true);
					} else {
						finish.call(null, false);
					}
				}
			});
		} else {
			me.onHideEditing();
			finish.call(null, true);
		}
	},


	validate: function(field, value) {
		var rules = (this.profileSchema || {})[field], numColons;
		if (!field || !rules) {
			console.warn('No rules or field. Treating as valid', field, value, this.profileSchema);
		}

		rules = rules || {};

		//treat empty string as null
		if (Ext.isEmpty(value)) {
			value = null;
		}

		//TODO encapsulate all these validations rules in some kind of profile model
		//this will let us share it and test it...

		if (rules.required === true && (value === null || value === undefined)) {
			this.showError('Required.', field);
			return false;
		}

		if (!value) {
			return true;
		}

		if (rules.base_type === 'string') {
			//for strings we expect a min and a max length and if they exist our string must fit in
			//those bounds
			if (value.length < (rules.min_length || 0)) {
				this.showError(getFormattedString('NextThought.view.profiles.About.short', {
					number: rules.min_length || 0
				}), field);
				return false;
			}

			if (value.length > (rules.max_length || Infinity)) {
				this.showError(getFormattedString('NextThought.view.profiles.About.long', {
					number: rules.max_length || 0
				}), field);
				return false;
			}

			if (rules.type === 'URI') {
				//We use some basic URI validation here, similar to what the ds
				//does as of r15860.  Note the ds will add http if there is no
				//scheme.  However if we detect what looks like a scheme we
				//require it to start with http[s]
				numColons = (value.match(/:/g) || []).length;
				if (numColons > 1) {
					this.showError(getString('NextThought.view.profiles.About.invalid'), field);
					return false;
				}
				if (numColons === 1 && value.indexOf('http:') !== 0 && value.indexOf('https:') !== 0) {
					this.showError(getString('NextThought.view.profiles.About.invalid'), field);
					return false;
				}
				return true;
			}
		}

		return true;
	},


	showError: function(text, field) {
		var errorEl = this.el.down('.error-msg[data-prop=' + field + ']');

		if (errorEl) {
			errorEl.update(text);
			errorEl.show();
		}
	},


	clearError: function(field) {
		var query = field ? '.error-msg[data-prop=' + field + ']' : '.error-msg',
			errorEls = this.el.select(query);

		errorEls.hide();
	},

	// Override if needed
	resetFields: function(fields, values) {},

	// Override if needed
	onHideEditing: function() {}
});
