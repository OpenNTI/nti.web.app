Ext.define('NextThought.view.courseware.enrollment.parts.Set', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-set',

	require: [
		 'NextThought.layout.container.None'
	],

	cls: 'admission-set',
	layout: 'none',

	requires: [
		'NextThought.view.courseware.enrollment.parts.Description',
		'NextThought.view.courseware.enrollment.parts.RadioGroup',
		'NextThought.view.courseware.enrollment.parts.Checkbox',
		'NextThought.view.courseware.enrollment.parts.TextInput',
		'NextThought.view.courseware.enrollment.parts.CheckboxGroup',
		'NextThought.view.courseware.enrollment.parts.DropDown',
		'NextThought.view.courseware.enrollment.parts.SubmitButton',
		'NextThought.view.courseware.enrollment.parts.SplitRadio',
		'NextThought.view.courseware.enrollment.parts.Links'
	],

	typesMap: {
		'text': 'enrollment-textinput',
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


	isValid: function() {
		var valid = true;

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
	},

	changed: function(name, value, doNotStore) {
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
			parent.changed(name, value, doNotStore);
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
