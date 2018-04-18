const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');

const {TemporaryStorage} = require('legacy/cache/AbstractStorage');

module.exports = exports = Ext.define('NextThought.mixins.enrollment-feature.Form', {
	STATE_VALUES: {},

	changeMonitors: {},

	eventToGroup: {},

	addListeners: function () {
		this.on({
			'reveal-item': 'revealItem',
			'hide-item': 'hideItem',
			'send-application': 'maybeSubmit',
			'add-address-line': 'addAddressLine'
		});
	},


	fillInDefaults: function (values) {
		return values;
	},


	updateFromStorage: function () {
		var me = this,
			values = TemporaryStorage.get(me.STATE_NAME) || {},
			keys,
			waitOnRender = [];

		values = me.fillInDefaults(values);
		keys = Object.keys(values);

		(keys || []).forEach(function (key) {
			const value = values[key];
			const input = me.down('[name="' + key + '"]');
			let parent;

			if (input) {

				if (input.setValue) {
					input.setValue(value);
				} else {
					parent = input.up('[setValue]');

					if (parent) {
						parent.setValue(value, key);
					}
				}
			} else {
				//We don't have an item with that name
				waitOnRender.push(key);
			}
		});

		if (!Ext.isEmpty(waitOnRender)) {
			//If we don't have an item with for the key, its probably a sub input of another item
			//so wait until we are rendered, get the input element with that name and set its value
			me.onceRendered
				.then(function () {
					return wait();
				})
				.then(function () {
					waitOnRender.forEach(function (key) {
						var input = me.el.down('input[name="' + key + '"]'),
							type = input && input.getAttribute('type'),
							value = values[key];

						if (!type) {
							console.error('No input for key: ', key);
						} else if (type === 'text') {
							input.dom.value = value;
						} else if (type === 'radio' || type === 'checkbox') {
							input.dom.checked = value || value === 'Y';
						}
					});
				});
		}

		me.STATE_VALUES = values;
	},


	setInput: function (name, value) {
		var input = this.down('[name=' + name + ']');

		if (input && input.setValue && value) {
			input.setValue(value);
		}
	},


	getFormForGroup: function (name) {
		var form = this.form.slice(), i,
			items = [];

		for (i = 0; i < form.length; i++) {
			if (form[i].group === name || !form[i].group) {
				items.push(form[i]);
			}
		}

		return items;
	},


	changed: function (name, value, doNotStore, sets) {
		if (this.changeMonitors[name]) {
			this[this.changeMonitors[name]].call(this, value);
		}

		if (sets) {
			this.setInput(sets.input, sets[value]);
		}

		if (!name || doNotStore) { return; }

		this.STATE_VALUES[name] = value;

		TemporaryStorage.set(this.STATE_NAME, this.STATE_VALUES);
	},


	clearStorage: function () {
		TemporaryStorage.set(this.STATE_NAME, {});
	},


	hideItem: function (name) {
		var me = this, item;

		if (Ext.isArray(name)) {
			name.forEach(function (n) {
				me.hideItem(n);
			});

			return;
		}

		if (name.indexOf('enable-submit') === 0) {
			if (!me.locked) {
				me.submitBtnCfg.disabled = true;
				me.fireEvent('update-buttons');
			} else {
				me.previousDisabled = true;
			}
		}


		item = me.down('[name=' + name + ']');

		if (item) {
			item.hide();

			if (item.reveals) {
				this.hideItem(item.reveals);
			}

			if (item.hides) {
				this.hideItem(item.hides);
			}
		} else {
			console.error('No item to hide: ', name);
		}
	},


	revealItem: function (name) {
		var me = this, item;

		if (Ext.isArray(name)) {
			name.forEach(function (n) {
				me.revealItem(n);
			});

			return;
		}

		//special name to enable the submit button enable-submit*
		//where the star indicates a group to use
		if (name.indexOf('enable-submit') === 0) {
			if (!me.locked) {
				me.submitBtnCfg.disabled = false;
				me.fireEvent('update-buttons');
			} else {
				me.previousDisabled = false;
			}


			me.shouldAllowSubmission()
				.always(me.fireEvent.bind(me, 'update-buttons'));
		}

		item = me.down('[name="' + name + '"]');

		if (item) {
			item.show();

			if (item.changed) {
				item.changed();
			}
		} else {
			console.error('No item to reveal: ', name);
		}
	},


	isValid: function (group) {
		var valid = true;

		this.items.each(function (item) {
			if (Ext.isFunction(item.isValid) && !item.isValid(group)) {
				valid = false;
			}

			return true;
		});

		return valid;
	},


	getValue: function () {
		var value = {};

		this.items.each(function (item) {
			value = Ext.apply(value, item.getValue && item.getValue());
		});

		return value;
	},

	/**
	 * Fire an event to show an error on the window
	 * @param  {Object|String} json the message to alert
	 * @returns {void}
	 */
	showError: function (json) {
		var input;

		json = Ext.isString(json) ? {Message: json} : (json || {});

		if (json.field) {
			input = this.down('[name="' + json.field + '"]');

			if (input && input.addError) {
				input.addError();
				input.el.scrollIntoView(this.el.up('.credit-container'));
			}
		}

		if (json.Message || json.message) {
			this.fireEvent('show-msg', (json.Message || json.message).replace('${field}', json.field), true, 5000);
		} else {
			this.fireEvent('show-msg', 'An unknown error occurred. Please try again later.', true, 5000);
		}
	},

	/*
	 * If there is a link to get the nations from the server, request it and fill in the inputs
	 * TODO: Don't hard code the inputs to fill in the nations with in the mixin
	 */
	fillInNations: function () {
		var me = this;

		if (this.nationsLink) {
			Service.request(this.nationsLink)
				.then(function (response) {
					var nations = Ext.JSON.decode(response, true),
						nationInput = me.down('[name=nation_code]'),
						mailingNationInput = me.down('[name=mailing_nation_code]'),
						citizenshipInput = me.down('[name=country_of_citizenship]');

					function updateInputs () {
						if (nationInput) {
							nationInput.addOptions(nations);
						}

						if (mailingNationInput) {
							mailingNationInput.addOptions(nations);
						}

						if (citizenshipInput) {
							citizenshipInput.addOptions(nations);
						}
					}

					if (!me.rendered) {
						me.on('afterrender', updateInputs);
					} else {
						updateInputs();
					}
				})
				.catch(function (reason) {
					console.error('Failed to load nation list ', reason);
				});
		}
	},

	/*
	 * If there is a link to get the states from the server request it and fill in the inputs
	 * TODO: Don't hard code the inputs to fill in the states with in the mixin
	 */
	fillInStates: function () {
		var me = this;

		if (this.statesLink) {
			Service.request(this.statesLink)
				.then(function (response) {
					var states = Ext.JSON.decode(response, true),
						stateInput = me.down('[name=state]'),
						mailingStateInput = me.down('[name=mailing_state]');

					states.unshift(''); // insert empty value as first option.

					function updateInputs () {
						if (stateInput) {
							stateInput.addOptions(states);
						}

						if (mailingStateInput) {
							mailingStateInput.addOptions(states);
						}
					}

					if (!me.rendered) {
						me.on('afterrender', updateInputs);
					} else {
						updateInputs();
					}
				})
				.catch(function (reason) {
					console.error('Failed to load state list: ', reason);
				});
		}
	},

	/**
	 * Reveal another street line in all the address forms
	 * the inputs name should follow a scheme of line, line2, line3 ...
	 * this.addressLines is an array of all the prefixes for the street line inputs in all the address forms
	 */
	numberofaddressline: {},
	addAddressLine: function (prefix, cmp) {
		var me = this,
			line = me.numberofaddressline[prefix] || 2;

		line = me.numberofaddressline[prefix] = line + 1;

		if (line >= 5) {
			cmp.hide();
		}

		if (prefix) {
			me.revealItem(prefix + line);
		} else {
			me.addressLines.forEach(function (pref) {
				me.revealItem(pref + line);
			});
		}
	}
});
