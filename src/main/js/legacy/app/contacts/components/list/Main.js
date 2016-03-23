var Ext = require('extjs');
var FieldsSimpleTextField = require('../../../../common/form/fields/SimpleTextField');
var GroupsActions = require('../../../groups/Actions');


module.exports = exports = Ext.define('NextThought.app.contacts.components.list.Main', {
	extend: 'Ext.container.Container',
	alias: 'widget.createlist-main-view',
	cls: 'createlist-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
			{xtype: 'box', name: 'namelabel', cls: 'label', html: 'List name'},
			{
				xtype: 'simpletext',
				name: 'name',
				cls: 'input-box name group-name',
				inputType: 'text',
				placeholder: getString('NextThought.view.account.contacts.createlist.Main.name-placeholder')
			}
		]},
		{xtype: 'box', hidden: true, name: 'error', autoEl: {cls: 'error-box', tag: 'div',
			cn: [
				{cls: 'error-desc'}
			]}
		},
		{xtype: 'container', cls: 'submit', layout: {type: 'hbox', pack: 'end'}, items: [
			{
				xtype: 'button',
				ui: 'secondary',
				scale: 'large',
				name: 'cancel',
				text: getString('NextThought.view.account.contacts.createlist.Main.cancel'),
				handler: function(b) {
					b.up('window').close();
				}
			},
			{
				xtype: 'button',
				ui: 'primary',
				scale: 'large',
				name: 'submit',
				text: getString('NextThought.view.account.contacts.createlist.Main.create'),
				disabled: true,
				minWidth: 96
			}
		]}
	],

	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.down('[name=name]'), {
			scope: this,
			changed: this.changed,
			click: this.clearError,
			specialkey: this.specialkey
		});
		this.mon(this.down('[name=submit]'), 'click', this.submitClicked, this);
		this.GroupActions = NextThought.app.groups.Actions.create();
	},

	getListName: function() {
		var name = this.down('[name=name]').getValue();
		return name ? name.trim() : name;
	},

	specialkey: function(el, event) {
		var val = el.lastValue,
			empty = Ext.isEmpty(val);

		if (event.getKey() === event.RETURN && !empty) {
			this.submitClicked();
		}
	},

	changed: function(value, t) {
		var val = value.trim(),
			empty = Ext.isEmpty(val),
			btn = this.query('[name=submit]', this)[0];
		btn.setDisabled(empty);
		if (empty) {
			t.getEl().down('input').addCls('empty');
		}
		else {
			t.getEl().down('input').removeCls('empty');
		}
	},

	showError: function(errorText) {
		var box = this.down('[name=error]');

		errorText = errorText || getString('NextThought.view.account.contacts.createlist.Main.unknown-error');

		//make main error field show up
		box.el.down('.error-desc').update(errorText);
		box.show();
	},

	submitClicked: function() {
		var w = this.up('window'),
			btn = this.down('[name=submit]'),
			me = this;

		this.clearError();
		btn.setDisabled(true);
		
		this.GroupActions.createList(this.getListName())
			.then( function (record) {
				w.close();
			})
			.fail( function (errorText) {
				console.error('An error occured', errorText);
				me.showError(errorText);
				btn.setDisabled(false);
			});
	},

	clearError: function() {
		var box = this.down('[name=error]');
		box.hide();
	}
});
