Ext.define('NextThought.view.courseware.enrollment.credit.parts.Set', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-credit-set',

	cls: 'admission-set',

	requires: [
		'NextThought.view.courseware.enrollment.credit.parts.Description',
		'NextThought.view.courseware.enrollment.credit.parts.RadioGroup',
		'NextThought.view.courseware.enrollment.credit.parts.Checkbox'
	],

	typesMap: {
		'text': '',
		'checkbox': 'credit-checkbox',
		'radio-group': 'credit-radiogroup',
		'description': 'credit-description'

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

	defaultType: null,

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],

	helpTpl: new Ext.XTemplate(Ext.DomHelper.markup({tag: 'a', cls: 'help', href: '{href}', html: '{text}'})),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: '{label}'},
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] },
		{cls: 'help-container'}
	]),

	renderSelectors: {
		helpContainerEl: '.help-container'
	},

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

		(me.help || []).forEach(function(help) {
			var el = me.helpTpl.append(me.helpContainerEl, help, true);

			if (help.type === 'event') {
				me.mon(el, 'click', function(e) {
					me.fireEvent(help.event);
					e.stopEvent();
					return false;
				});
			}
		});
	}
});
