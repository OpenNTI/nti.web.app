var Ext = require('extjs');
var PartsDescription = require('./Description');
var PartsRadioGroup = require('./RadioGroup');
var PartsCheckbox = require('./Checkbox');
var PartsTextInput = require('./TextInput');
var PartsTextarea = require('./Textarea');
var PartsCheckboxGroup = require('./CheckboxGroup');
var PartsDropDown = require('./DropDown');
var PartsSubmitButton = require('./SubmitButton');
var PartsSplitRadio = require('./SplitRadio');
var PartsLinks = require('./Links');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.Set', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-set',

	require: [
		 'NextThought.layout.container.None'
	],

	cls: 'admission-set',
	layout: 'none',

	typesMap: {
		'text': 'enrollment-textinput',
		'textarea': 'enrollment-textarea',
		'checkbox': 'enrollment-checkbox',
		'radio-group': 'enrollment-radiogroup',
		'description': 'enrollment-description',
		'checkbox-group': 'enrollment-checkbox-group',
		'dropdown': 'enrollment-dropdown',
		'date': 'enrollment-dateinput',
		'submit-button': 'enrollment-submit-button',
		'split-radio': 'enrollment-split-radio',
		'link': 'enrollment-link'
	},

	//name of the group so it can be idenitified
	name: '',

	//once the group is correct, the name of another group or input to reveal
	reveals: undefined,

	//returns true if all of its items are correct
	isCorrect: function() {
		var correct = true;

		this.items.each(function(item) {
			if (Ext.isFunction(item.isCorrect) && !item.isCorrect()) {
				correct = false;
			}

			return correct;
		});

		return correct;
	},

	isEmpty: function() {
		var empty = true;

		this.items.each(function(item) {
			if (Ext.isFunction(item.isEmpty) && !item.isEmpty()) {
				empty = false;
			}

			return empty;
		});

		return empty;
	},

	isValid: function(group) {
		var valid = true;

		if (group && group !== this.group) {
			return true;
		}

		this.items.each(function(item) {
			if (Ext.isFunction(item.isValid) && !item.isValid()) {
				valid = false;
			}
			//don't short circuit so all the invalid inputs have a chance to show their error.
			return true;
		});

		return valid;
	},

	getValue: function() {
		var value = {};

		this.items.each(function(item) {
			value = Ext.apply(value, item.getValue && item.getValue());
		});

		return value;
	},

	defaultType: null,

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: '{label}'},
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] }
	]),

	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		(me.inputs || []).forEach(function(input) {
			var type = me.typesMap[input.type];

			if (Ext.isEmpty(type)) {
				console.error('No admission input for type: ', input.type);
				return;
			}

			input.xtype = type;

			me.add(input);
		});

		this.enableBubble(['reveal-item', 'hide-item', 'add-address-line', 'go-back', 'viewLicense']);
	},

	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.label
		});
	},

	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		if (this.hides) {
			this.fireEvent('hide-item', this.hides);
		}

		if (this.labelCls) {
			this.addCls(this.labelCls);
		}
	},

	changed: function(name, value, doNotStore, sets) {
		var parent = this.up('[changed]'),
			correct = this.isCorrect();

		if (this.reveals) {
			if (correct) {
				this.fireEvent('reveal-item', this.reveals);
			} else {
				this.fireEvent('hide-item', this.reveals);
			}
		}

		if (this.hides && !this.isEmpty()) {
			if (correct) {
				this.fireEvent('hide-item', this.hides);
			} else {
				this.fireEvent('reveal-item', this.hides);
			}
		}

		if (parent) {
			parent.changed(name, value, doNotStore, sets);
		}
	},

	maybeToggleHides: function(correct) {
		var parent = this.up('[maybeToggleHides]'),
			notEmpty = true;

		this.items.each(function(item) {
			if (item.isEmpty && item.isEmpty()) {
				notEmpty = false;
			}
		});

		if (!this.hides) {
			if (parent) { parent.maybeToggleHides(); }
			return;
		}

		if (!correct) {
			this.fireEvent('reveal-item', this.hides);
			return;
		}

		if (this.isCorrect() || !notEmpty) {
			this.fireEvent('hide-item', this.hides);
		} else {
			this.fireEvent('reveal-item', this.hides);
		}
	}
});
