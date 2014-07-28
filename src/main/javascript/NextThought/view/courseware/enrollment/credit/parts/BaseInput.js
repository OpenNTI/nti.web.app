Ext.define('NextThought.view.courseware.enrollment.credit.parts.BaseInput', {
	extend: 'Ext.Component',
	alias: 'widget.credit-baseinput',

	cls: 'credit-input-container',

	initComponent: function() {
		this.enableBubble(['changed', 'reveal-item', 'hide-item', 'maybe-hide-item']);
	},


	afterRender: function() {
		this.callParent(arguments);
		this.setUpChangeMonitors();

		if (this.reveals) {
			this.fireEvent('hide-item', this.reveals);
		}

		if (this.hides) {
			this.fireEvent('hide-item', this.hides);
		}
	},


	setUpChangeMonitors: function() {
		this.mon(this.el, 'click', 'changed');
	},


	changed: function() {
		var me = this,
			parent = me.up('[changed]');

		this.removeError();

		wait()
			.then(function() {
				if (me.reveals) {
					if (me.isCorrect()) {
						me.fireEvent('reveal-item', me.reveals);
					} else {
						me.fireEvent('hide-item', me.reveals);
					}
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
					parent.changed();
				}
			});
	},

	//override this
	isEmpty: function() { return false; },
	addError: function() {},
	removeError: function() {},

	isValid: function() {
		//if we are required and empty we aren't
		var isValid = this.required ? !this.isEmpty() : true;

		if (!isValid) {
			this.addError();
		}

		return isValid;
	},

	isCorrect: function() {
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
