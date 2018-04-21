const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');
const {getString} = require('legacy/util/Localization');

require('legacy/util/Localization');


module.exports = exports = Ext.define('NextThought.app.account.coppa.Main', {
	extend: 'Ext.container.Container',
	alias: 'widget.coppa-main-view',
	cls: 'coppa-main-view',
	layout: 'none',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
			{xtype: 'container', name: 'realname', layout: 'hbox',
				defaults: {
					xtype: 'simpletext',
					flex: 1
				},
				items: [
					{cls: 'firstname input-box', name: 'firstname', placeholder: getString('NextThought.view.account.coppa.Main.first-name')},
					{cls: 'lastname input-box', name: 'lastname', placeholder: getString('NextThought.view.account.coppa.Main.last-name')}
				]
			},
			{xtype: 'simpletext', name: 'email', cls: 'input-box', inputType: 'email', placeholder: getString('NextThought.view.account.coppa.Main.email')},
			{xtype: 'box', autoEl: {tag: 'h3', html: getString('NextThought.view.account.coppa.Main.optional')}},
			{xtype: 'checkbox', name: 'opt_in_email_communication', boxLabel: getString('NextThought.view.account.coppa.Main.updates')},
			{xtype: 'box', name: 'affiliationBox', autoEl: {tag: 'div', cls: 'what-school', html: getString('NextThought.view.account.coppa.Main.school')}},
			{
				xtype: 'combobox',
				name: 'affiliation',
				typeAhead: true,
				forceAll: true,
				valueField: 'school',
				displayField: 'school',
				multiSelect: false,
				enableKeyEvents: true,
				queryMode: 'remote',
				cls: 'combo-box',
				anchor: '100%',
				hideTrigger: true,
				listConfig: {
					ui: 'nt',
					plain: true,
					showSeparator: false,
					shadow: false,
					frame: false,
					border: false,
					cls: 'x-menu',
					baseCls: 'x-menu',
					itemCls: 'x-menu-item no-border',
					emptyText: '<div class="x-menu-item">' + getString('NextThought.view.account.coppa.Main.no-school') + '</div>',
					xhooks: {
						initComponent: function () {
							this.callParent(arguments);
							this.itemSelector = '.x-menu-item';
						}
					}
				},
				listeners: {
					change: function () {
						var store = this.store;
						store.suspendEvents();
						store.clearFilter();
						store.resumeEvents();
						store.filter({
							property: 'school',
							anyMatch: true,
							value: this.getValue()
						});
						this.expand();
					}
				}
			}
		]},
		{xtype: 'box', hidden: true, name: 'error', autoEl: {cls: 'error-box', tag: 'div',
			cn: [
				{cls: 'error-field'},
				{cls: 'error-desc'}
			]}
		},
		{xtype: 'container', cls: 'submit', layout: {type: 'hbox', pack: 'end'}, items: [
			{
				xtype: 'box',
				cls: 'privacyLink',
				width: 365,
				autoEl: {
					tag: 'a',
					html: getString('NextThought.view.account.coppa.Main.view-policy'),
					href: '#'
				}
			},
			{
				xtype: 'button',
				ui: 'primary',
				scale: 'medium',
				name: 'submit',
				text: getString('NextThought.view.account.coppa.Main.submit'),
				handler: function () {
					var main = this.up('coppa-main-view');

					main.submit();
				}
			}
		]}
	],

	initComponent: function () {
		this.callParent(arguments);

		//we need to setup the combo box with a store:
		this.store = new Ext.data.ArrayStore({
			storeId: 'schoolStore',
			autoLoad: true,
			fields: [{
				mapping: 0,
				name: 'school',
				type: 'string'
			}],
			proxy: {
				type: 'ajax',
				url: '/resources/misc/school-data.json',
				reader: 'array'
			}
		});

		this.down('combobox').bindStore(this.store);
	},

	setSchema: function () {},

	afterRender: function () {
		this.callParent(arguments);

		var u = $AppConfig.userObject,
			realname = u.get('realname'),
			// email = u.get('email'),
			aff = u.get('affiliation'),
			fn, ln;

		fn = (realname.indexOf(' ') > 0) ? realname.substring(0, realname.indexOf(' ')) : realname;
		ln = (realname.indexOf(' ') > 0) ? realname.substring(realname.indexOf(' ')) : null;

		if (fn) {this.down('[name=firstname]').update(fn);}
		if (ln) {this.down('[name=lastname]').update(ln);}
		if (aff) {this.down('[name=affiliation]').setValue(aff);}
		this.down('[name=opt_in_email_communication]').setValue(u.get('opt_in_email_communication'));
		this.getEl().down('.privacyLink').on('click', this.openChildPrivacyWindow, this);
	},

	getValues: function () {
		var email = this.down('[name=email]').getValue(),
			firstname = this.down('[name=firstname]').getValue(),
			lastname = this.down('[name=lastname]').getValue(),
			check = this.down('[name=opt_in_email_communication]').checked,
			affiliation = this.down('[name=affiliation]').getValue();

		return {
			email: email,
			firstname: firstname,
			lastname: lastname,
			realname: firstname + ' ' + lastname,
			'opt_in_email_communication': check,
			affiliation: affiliation
		};

	},

	setError: function (error) {
		var box = this.down('[name=error]'),
			field = this.down('[name=' + error.field + ']'),
			allFields = this.query('[name]');

		//clear all errors:
		Ext.each(allFields, function (f) {f.removeCls('error');});

		//make main error field show up
		box.el.down('.error-field').update(error.field.replace('_', ' '));
		box.el.down('.error-desc').update(error.message);
		box.show();

		//set error state on specific field
		if (field) {
			field.addCls('error');
		}

		this.up('window').updateLayout();
	},

	openChildPrivacyWindow: function (e) {
		e.stopEvent();

		var w = Ext.widget('nti-window', {
			title: getString('NextThought.view.account.coppa.Main.policy-title'),
			closeAction: 'hide',
			width: '60%',
			height: '75%',
			layout: 'fit',
			modal: true,
			items: {
				xtype: 'component',
				cls: 'padded',
				autoEl: {
					tag: 'iframe',
					src: $AppConfig.userObject.getLink('childrens-privacy') || 'data:text/html,' + encodeURIComponent(Globals.SAD_FACE),
					frameBorder: 0,
					marginWidth: 0,
					marginHeight: 0,
					seamless: true,
					transparent: true,
					allowTransparency: true,
					style: 'overflow-x: hidden; overflow-y:auto'
				}
			}
		});

		w.show();
	},

	submit: function () {
		var win = this.up('window'),
			values = this.getValues();

		this.handleSubmit(values)
			.always(win.close.bind(win))
			.catch(this.setError.bind(this));
	}
});
