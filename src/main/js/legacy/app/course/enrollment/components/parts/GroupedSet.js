const Ext = require('@nti/extjs');

require('./Set');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.GroupedSet', {
	extend: 'NextThought.app.course.enrollment.components.parts.Set',
	alias: 'widget.enrollment-grouped-set',

	initComponent: function () {
		var me = this,
			inputs = [];

		(me.options || []).forEach(function (option) {
			inputs.push({
				type: 'split-radio',
				text: option.text,
				value: option.value,
				name: me.name,
				correct: me.correct
			});

			if (!Ext.isEmpty(option.inputs)) {
				option.inputs.forEach(function (input) {
					input.groupParent = option.value;
					input.otherCls = 'nested';
					input.hidden = true;

					inputs.push(input);
				});
			}
		});

		this.inputs = inputs;
		this.callParent(arguments);
	},


	isValid: function () {
		var r = this.callParent(arguments),
			me = this,
			body = me.el.down('.body-container'),
			radios = me.query('[type=split-radio]') || [],
			isAnswered = false;

		radios.forEach(function (radio) {
			var v = radio.getValue();

			if (v[me.name]) {
				isAnswered = true;
			}
		});

		if (this.required && !isAnswered) {
			body.addCls('error');
		} else {
			body.removeCls('error');
		}

		return isAnswered && r;
	},


	isEmpty: function () {
		var values = this.getValue();

		//Treat them as empty if the top level question doesn't have an answer
		return !values[this.name];
	},


	getValue: function () {
		var me = this,
			answers = {};

		(me.options || []).forEach(function (option) {
			var radio = me.down('[type=split-radio][value="' + option.value + '\']'),
				value = radio.getValue();

			if (value[me.name] === option.value) {
				(option.inputs || []).forEach(function (input) {
					var cmp = me.down('[name="' + input.name + '\']');

					if (cmp) {
						value = Ext.apply(value, cmp.getValue && cmp.getValue());
					}
				});
			} else {
				(option.inputs || []).forEach(function (input) {
					value[input.name] = input.defaultAnswer;
				});
			}

			answers = Ext.apply(answers, value);
		});

		return answers;
	},


	setValue: function (value) {
		var radios = this.query('[type=split-radio]') || [];

		radios.forEach(function (radio) {
			radio.setValue(value);
		});

		this.showSubInputs(value);
	},


	showSubInputs: function (value) {
		var me = this,
			allInputs = me.query('[groupParent]') || [],
			toShow = me.query('[groupParent="' + value + '"]') || [];

		allInputs.forEach(function (input) {
			input.hide();

			if (input.hides) {
				me.fireEvent('hide-item', input.hides);
			}
		});

		toShow.forEach(function (input) {
			if (!input.shouldHide) {
				input.show();
			}
		});
	},

	changed: function (name, value, doNotStore, sets) {
		this.callParent(arguments);

		var body = this.el.down('.body-container');

		if (name !== this.name) { return; }

		this.showSubInputs(value);
		body.removeCls('error');
	},


	isCorrect: function () {
		var values = this.getValue(),
			inputs = this.inputs || [], i,
			correct = true, empty = true;


		if (this.isValueCorrect) {
			return this.isValueCorrect(values);
		}


		for (i = 0; i < inputs.length; i++) {
			if (inputs[i].name === this.name && values[this.name] !== undefined) {
				empty = false;
			}

			if (inputs[i].correct && inputs[i].correct !== values[inputs[i].name]) {
				correct = false;
				break;
			}
		}

		if (empty && this.wrongIfEmpty) {
			return false;
		}

		return correct;
	}
});
