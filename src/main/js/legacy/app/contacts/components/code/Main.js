var Ext = require('extjs');
var FieldsSimpleTextField = require('../../../../common/form/fields/SimpleTextField');


module.exports = exports = Ext.define('NextThought.app.contacts.components.code.Main', {
	extend: 'Ext.container.Container',
	alias: 'widget.code-main-view',
	cls: 'code-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
						{xtype: 'simpletext', name: 'code', cls: 'input-box', inputType: 'text', placeholder: getString('NextThought.view.account.code.Main.enter-code')}
		]},
		{xtype: 'box', hidden: true, name: 'error', autoEl: {cls: 'error-box', tag: 'div',
						cn: [
				{cls: 'error-field'},
				{cls: 'error-desc'}
						]}
		},
		{xtype: 'container', cls: 'submit', layout: {type: 'hbox', pack: 'end'}, items: [
			{
				xtype: 'button',
				ui: 'secondary',
				scale: 'large',
				name: 'cancel',
				text: getString('NextThought.view.account.code.Main.cancel'),
				handler: function (b) {
								b.up('window').close();
							}
			},
						{xtype: 'button', ui: 'primary', scale: 'large', name: 'submit', text: getString('NextThought.view.account.code.Main.submit'), disabled: true}
		]}
	],

	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.down('[name=code]'), {
			scope: this,
			changed: this.changed
		});

		this.mon(this.down('[name=submit]'), 'click', this.submitClicked, this);
		this.GroupActions = NextThought.app.groups.Actions.create();
	},

	changed: function (value, t) {
		var val = value.trim(),
			empty = Ext.isEmpty(val),
			btn = this.query('[name=submit]', this)[0];
		btn.setDisabled(empty);
		if (Ext.isEmpty(val)) {
			t.getEl().down('input').addCls('empty');
		}
		else {
			t.getEl().down('input').removeCls('empty');
		}
	},

	getValue: function () {
		var code = this.down('[name=code]').getValue();
		if (code) {code = code.trim(); }
		return {
			code: code
		};

	},

	setError: function (error) {
		var box = this.down('[name=error]'),
			field = this.down('[name=code]'),
			allFields = this.query('[name]');

		//clear all errors:
		Ext.each(allFields, function (f) { f.removeCls('error'); });

		//make main error field show up
		box.el.down('.error-field').update(error.field.replace('_', ' '));
		box.el.down('.error-desc').update(error.message);
		box.show();

		//set error state on specific field
		field.addCls('error');

		this.up('window').updateLayout();
	},

	submitClicked: function () {
		var me = this,
			btn = this.down('[name=submit]'),
			w = this.up('window'),
			v = this.getValue();

		this.clearError();
		btn.addCls('disabled');
		this.GroupActions.joinGroupWithCode(v.code, btn)
			.then(function () {
				w.close();
			})
			.catch(function (error) {
				if (!me.isDestroyed) {
					me.setError(error);
				}
			})
			.always(function () {
				if(!me.isDestroyed) {
					btn.removeCls('disabled');
				}
			});
	},

	clearError: function () {
		var box = this.down('[name=error]');
		box.hide();
	}
});
