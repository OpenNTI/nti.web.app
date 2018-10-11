const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.BaseInput', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-baseinput',

	cls: 'enrollment-input-container',

	initComponent: function () {
		var events = ['changed', 'reveal-item', 'hide-item', 'maybe-hide-item', 'viewLicense', 'prohibited'];

		if (this.focusEvent) {
			events.push(this.focusEvent);
		}

		this.enableBubble(events);

		if (Ext.isString(this.reveals)) {
			this.reveals = {
				name: this.reveals
			};
		}

	},


	afterRender: function () {
		this.callParent(arguments);
		this.setUpChangeMonitors();

		if (this.reveals && !this.reveals.ifNotEmpty) {
			this.fireEvent('hide-item', this.reveals.name);
		}

		if (this.hides) {
			this.fireEvent('hide-item', this.hides);
		}

		if (this.startingvalue) {
			this.setValue(this.startingvalue, this.startingvaluename);
		}

		this.addCls(this.otherCls);

		this.el.set({
			'data-fieldname': this.name
		});
	},


	setUpChangeMonitors: function () {
		this.mon(this.el, 'click', 'changed');
	},


	changed: function (e) {
		var me = this,
			anchor = e && e.getTarget && e.getTarget('a[data-event]'),
			parent = me.up('[changed]');

		if (anchor) {
			me.fireEvent(anchor.getAttribute('data-event'), anchor);
			e.stopEvent();
			return false;
		}

		this.removeError();

		wait()
			.then(function () {

				if (me.reveals) {
					if (me.reveals.ifNotEmpty && !me.isEmpty() && me.isCorrect()) {
						me.fireEvent('reveal-item', me.reveals.name);
					} else if (me.reveals.ifNotEmpty && !me.isEmpty()) {
						me.fireEvent('hide-item', me.reveals.name);
					} else if (!me.reveals.ifNotEmpty && me.isCorrect()) {
						me.fireEvent('reveal-item', me.reveals.name);
					} else if (!me.reveals.ifNotEmpty) {
						me.fireEvent('hide-item', me.reveals.name);
					}
				}


				if (me.validateOnChange) {
					me.isValid();
				}

				if (!me.isEmpty() && !me.hides && parent) {
					parent.maybeToggleHides(me.isCorrect());
				}

				if (me.hides && !me.isEmpty()) {
					if (me.isCorrect()) {
						me.fireEvent('hide-item', me.hides);
					} else {
						me.fireEvent('reveal-item', me.hides);
					}
				}

				if (parent) {
					parent.changed(me.name, me.getValue(true)[me.name], me.doNotStore, me.sets);
				}
			});
	},

	//override these
	isEmpty: function () { return false; },
	addError: function () {},
	removeError: function () {},
	setValue: function () {},

	isValid: function () {
		//if we are required and empty we aren't
		var isValid = this.required ? !this.isEmpty() : true;

		if (!isValid) {
			this.addError();
		}

		return isValid;
	},

	isCorrect: function () {
		//if we don't have a correct value, we can't be incorrect
		if (this.correct === undefined) { return true; }
		//if we don't have an el we can't have any answers so we can't be correct
		if (!this.el) { return false; }

		var value = this.getValue(true);

		//if we don't have a value, we can't be correct
		if (!value) { return false; }

		return value[this.name] === this.correct;
	}
});
