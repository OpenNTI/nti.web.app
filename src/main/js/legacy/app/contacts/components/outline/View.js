const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');

const {isFeature} = require('legacy/util/Globals');

const ContactsActions = require('../../Actions');

require('legacy/mixins/ContactSearchMixin');
require('./Search');


module.exports = exports = Ext.define('NextThought.app.contacts.components.outline.View', {
	extend: 'Ext.view.View',
	alias: 'widget.contacts-outline',
	ui: 'nav',
	preserveScrollOnRefresh: true,

	mixins: {
		contactSearching: 'NextThought.mixins.ContactSearchMixin'
	},

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'{outlineLabel}'
		]},
		{ cls: 'outline-list'},
		{ tag: 'tpl', 'if': 'buttons', cn: { cls: 'buttons', cn: [
			{ tag: 'tpl', 'if': 'canjoin', cn: {
				cls: 'join join-{type} contact-button', html: '{{{NextThought.view.contacts.outline.View.join}}}' } },
			{ tag: 'tpl', 'if': 'cancreate', cn: {
				cls: 'create create-{type} contact-button', html: '{{{NextThought.view.contacts.outline.View.create}}}' } },
			{ tag: 'tpl', 'if': 'isContact && suggestedContactsLabel', cn: [
				{cls: 'contact-button search half', html: '{{{NextThought.view.contacts.outline.View.search}}}', cn: [
					{tag: 'input', type: 'text'},
					{cls: 'clear', style: {display: 'none'}}
				]},
				{cls: 'contact-button suggest', html:'{suggestedContactsLabel}'}
			]},
			{ tag: 'tpl', 'if': 'isContact', cn: [
				{cls: 'contact-button search', html: '{{{NextThought.view.contacts.outline.View.search}}}', cn: [
					{tag: 'input', type: 'text'},
					{cls: 'clear', style: {display: 'none'}}
				]}
			]}
		]}}
	]),

	renderSelectors: {
		frameBodyEl: '.outline-list',
		buttonsEl: '.buttons'
	},

	getTargetEl: function () {
		return this.frameBodyEl;
	},

	config: {
		outlineLabel: '--'
	},

	overItemCls: 'over',
	itemSelector: '.outline-row',

	tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [

		{
			cls: 'outline-row {type}', 'data-qtip': '{displayName:htmlEncode}',
			cn: [
				{ cls: 'label', html: '{displayName}' }
			]
		}

	]}),

	initComponent: function () {
		this.callParent(arguments);
		this.addCls('nav-outline make-white scrollable');
		if (this.subType === 'contact') {
			this.mixins.contactSearching.constructor.apply(this, arguments);
		}

		this.ContactsActions = ContactsActions.create();
	},

	beforeRender: function () {
		this.callParent();
		var me = this, s = this.getSelectionModel();
		s.onNavKey = Ext.Function.createInterceptor(s.onNavKey, function () {
			me.fromKey = true;
		});

		// TODO: We should really create subclasses of this view where we set the correct flags and overrides
		// rather than checking if the subType is so and so.
		this.renderData = Ext.apply(this.renderData || {}, {
			outlineLabel: this.getOutlineLabel(),
			buttons: true,
			type: this.subType,
			cancreate: (this.subType !== 'contact' && (this.subType !== 'group' || Service.canCreateDynamicGroups())),
			canjoin: this.subType === 'group',
			isContact: this.subType === 'contact',
			suggestedContactsLabel: isFeature('suggest-contacts') && this.subType === 'contact' && 'Suggested Contacts'
		});

		this.on({
			scope: this,
			itemclick: function () {
				this.fromClick = true;
			},
			beforeselect: function (sel, r) {
				var pass = r.data.type !== 'unit',
					store = sel.getStore(),
					last = sel.lastSelected || store.first(), next;

				if (this.fromKey && !pass) {
					last = store.indexOf(last);
					next = store.indexOf(r);
					next += ((next - last) || 1);

					//do this in the next event pump
					Ext.defer(s.select, 1, sel, [next]);
				}
				return pass;

			},
			select: function (sel, r) {
				if (this.fromClick || this.fromKey) {
					console.debug('do something with selection');
					this.fireEvent('contact-row-selected', r);
				}
				delete this.fromClick;
				delete this.fromKey;

				sel.deselect(r);
			}
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.buttonsEl) {
			this.mon(this.buttonsEl, 'click', 'onButtonsClicked');
		}
	},

	onButtonsClicked: function (evt) {
		var b = evt.getTarget('.contact-button');
		if (b && !Ext.fly(b).hasCls('search')) {
			this.ContactsActions.groupButtonClicked(b, this);
		}
	},

	addMask: function () {
		try {
			var maskEl = this.el && this.el.down('.outline-list');
			if (maskEl) {
				maskEl.mask('Searching...').addCls('nti-clear');
			}
		} catch (e) {
			console.warn('Error masking. %o', e);
		}
	},

	removeMask: function () {
		var maskEl = this.el.down('.outline-list'),
			mask = maskEl && maskEl.down('.x-mask'),
			maskMsg = maskEl && maskEl.down('.x-mask-msg');

		if (mask) {
			mask.addCls('removing');
		}

		if (maskMsg) {
			maskMsg.addCls('removing');
		}

		if (maskEl) {
			maskEl.removeCls('nti-clear');
			wait(1000).then(maskEl.unmask.bind(maskEl));
		}
	},

	clear: function () {
		this.bindStore('ext-empty-store');
	}
});
