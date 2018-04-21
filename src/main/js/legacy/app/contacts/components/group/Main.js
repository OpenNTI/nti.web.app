const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');
const GroupsActions = require('legacy/app/groups/Actions');

require('legacy/common/form/fields/SimpleTextField');


module.exports = exports = Ext.define('NextThought.app.contacts.components.group.Main', {
	extend: 'Ext.container.Container',
	alias: 'widget.codecreation-main-view',
	cls: 'codecreation-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
			{xtype: 'box', name: 'namelabel', cls: 'label', html: 'Group Name'},
			{
				xtype: 'simpletext',
				name: 'groupname',
				cls: 'input-box group-name',
				inputType: 'text',
				placeholder: getString('NextThought.view.account.codecreation.Main.group-name'),
				allowBlank: false
			}
		]},
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
			{xtype: 'box', name: 'codelabel', cls: 'label', hidden: true, html: getString('NextThought.view.account.codecreation.Main.group-code')},
			//{xtype: 'box', name: 'code', cls: 'group-code', hidden: true},
			{xtype: 'simpletext', name: 'code', cls: 'input-box group-code', inputType: 'text', readOnly: true, hidden: true}
		]},
		{xtype: 'box', hidden: true, name: 'error', autoEl: {
			cls: 'error-box', tag: 'div', cn: [
				{cls: 'error-desc'}
			]
		}},
		{xtype: 'container', cls: 'submit', layout: {type: 'hbox', pack: 'end'}, items: [
			{
				xtype: 'button',
				ui: 'secondary',
				scale: 'large',
				name: 'cancel',
				text: getString('NextThought.view.account.codecreation.Main.cancel'),
				handler: function (b) {
					b.up('window').close();
				}
			},
			{
				xtype: 'button',
				ui: 'primary',
				scale: 'large',
				name: 'submit',
				text: getString('NextThought.view.account.codecreation.Main.create'),
				disabled: true,
				minWidth: 96
			}
		]}
	],

	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.down('[name=groupname]'), {
			scope: this,
			changed: this.changed,
			specialkey: this.specialkey
		});
		this.mon(this.down('[name=submit]'), 'click', this.submitClicked, this);
		this.GroupActions = GroupsActions.create();
	},

	specialkey: function (el, event) {
		var val = el.lastValue,
			empty = Ext.isEmpty(val);

		if (event.getKey() === event.RETURN && !empty) {
			el.blur();
			this.submitClicked();
		}
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

	setGroupCode: function (c) {
		var code = this.query('[name=code]')[0];
		code.update(c || null);
		code.setVisible(!!c);
		code.el.selectable();
		this.query('[name=codelabel]')[0].setVisible(!!c);
		this.query('[name=groupname]')[0].disable(true);
		this.query('[name=submit]')[0].setText('OK');
		this.query('[name=cancel]')[0].setVisible(false);
	},

	getGroupName: function () {
		var name = this.down('[name=groupname]').getValue();
		return name ? name.trim() : name;
	},

	showError: function (errorText) {
		var box = this.down('[name=error]');

		errorText = errorText || getString('NextThought.view.account.codecreation.Main.unknown-error');

		//make main error field show up
		box.el.down('.error-desc').update(errorText);
		box.show();
	},

	submitClicked: function () {
		var me = this,
			btn = this.down('[name=submit]'),
			w = this.up('window');

		this.clearError();
		if (btn.text === 'OK') {
			w.close();
			return;
		}

		this.GroupActions.createGroupAndCode(btn)
			.then(function (code) {
				btn.setDisabled(false);
				w.showCreatedGroupCode(code);
			})
			.catch(function (errorText) {
				console.error('An error occured', errorText);
				me.showError(errorText);
				btn.setDisabled(false);
			});
	},

	clearError: function () {
		var box = this.down('[name=error]');
		box.hide();
	}
});
