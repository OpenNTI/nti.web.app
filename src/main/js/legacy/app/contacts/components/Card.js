const Ext = require('extjs');

const ManagementPopout = require('../../account/contacts/management/Popout');

require('legacy/mixins/ChatLinks');
require('legacy/mixins/ProfileLinks');


module.exports = exports = Ext.define('NextThought.app.contacts.components.Card', {
	extend: 'Ext.Component',
	alias: 'widget.contacts-tabs-card',

	mixins: {
		profileLink: 'NextThought.mixins.ProfileLinks',
		chatLink: 'NextThought.mixins.ChatLinks'
	},

	profileLinkCard: false,
	ui: 'contacts-tabs-card',
	cls: 'contact-card-container',

	renderTpl: Ext.DomHelper.markup({
		cls: 'contact-card',
		cn: [
			{cls: 'user-avatar-container', 'data-qtip': '{user:displayName}', cn: [
				'{user:avatar}'
			]},
			{
				cls: 'meta',
				cn: [
					{ cls: 'name', html: '{name}', 'data-field': 'name'},
					{ cls: 'add-to-contacts', html: '{{{NextThought.view.contacts.Card.add}}}'},
					{ tag: 'tpl', 'if': '!hideProfile && email', cn: [
						{ cls: 'email', html: '{email}', 'data-field': 'email' }
					]},

					{ tag: 'tpl', 'if': '!hideProfile && (role || affiliation)', cn: [
						{ cls: 'composite-line', cn: [
							{ tag: 'tpl', 'if': 'role', cn: [
								{ tag: 'span', html: '{role}', 'data-field': 'role'}
							]},
							{ tag: 'tpl', 'if': 'role && affiliation', cn: [
								{tag: 'span', cls: 'separator', html: ' {{{NextThought.view.contacts.Card.at}}} '}
							]},
							{ tag: 'tpl', 'if': 'affiliation', cn: [
								{ tag: 'span', html: '{affiliation}', 'data-field': 'affiliation' }
							]
							}
						]
						}
					]
					},
					{ tag: 'tpl', 'if': '!hideProfile && location', cn: [
						{ cls: 'location', html: '{location}', 'data-field': 'location' }
					]},

					{ cls: 'actions', cn: [
						{ cls: 'chat', html: '{{{NextThought.view.contacts.Card.chat}}}'}
					]}
				]
			},
			{
				cls: 'nib', 'data-qtip': '{{{NextThought.view.contacts.Card.options}}}'
			}
		]
	}),

	renderSelectors: {
		cardEl: '.contact-card',
		chatEl: '.actions .chat',
		avatarContainerEl: '.user-avatar-container'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.enableBubble('presence-changed');
		this.userObject = this.record;
		this.username = this.userObject.getId();
		this.userObject.addObserverForField(this, 'Presence', this.presenceChanged, this);
	},

	beforeRender: function () {
		var u = this.record;
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, u.getData());
		this.renderData = Ext.apply(this.renderData, {hideProfile: $AppConfig.disableProfiles === true});
		this.renderData.name = u.getName();
		this.renderData.user = this.userObject;
	},

	afterRender: function () {
		this.callParent(arguments);
		this.enableProfileClicks(this.el.down('.avatar'), this.el.down('.name'));
		this.maybeShowChat(this.chatEl);
		this.updateLayout();

		this.mon(this.el, 'click', this.clicked, this);
		this.mon(this.userObject, 'avatarChanged', this.setAvatar.bind(this, this.record));

		if (Ext.is.iOS) {
			this.mon(this.el, 'mouseup', this.mouseup, this);
		}

		this.updatePresenceState();
	},

	setAvatar: function (record) {
		if (this.rendered) {
			this.avatarContainerEl.update(Ext.util.Format.avatar(record));
		}
	},

	mouseup: function (e) {
		var nib = e.getTarget('.nib'),
			input = Ext.get('my-contacts').down('input');
		if (nib && window.innerHeight < 600) {
			input.blur();
		}
	},

	clicked: function (e) {
		var nib = e.getTarget('.nib');
		try {
			if (nib) {
				this.addToContactsClicked(e);
			}
			else {
				this.startChat();
			}
		}
		catch (er) {
			this.fireEvent('blocked-click', this, this.userObject.getId());
		}
	},

	addToContactsClicked: function (e) {
		var me = this;
		console.log('Should add to contacts');
		var pop,
			el = e.target,
			alignmentEl = e.target,
			alignment = 'tl-tr?',
		//play = Ext.dom.Element.getViewportHeight() - Ext.fly(el).getY(),
			id = me.userObject.getId(),
			open = false,
			offsets = [10, -18], refEl;

		Ext.each(Ext.ComponentQuery.query('activity-popout,contact-popout'), function (o) {
			if (o.record.getId() !== id || me.userObject.modelName !== o.record.modelName) {
				o.destroy();
			}
			else {
				open = true;
				o.toFront();
			}
		});

		if (open) {
			return;
		}

		refEl = Ext.get(el);
		if (refEl) {
			refEl.up('.contact-card').addCls('active');
		}
		pop = ManagementPopout.create({record: me.userObject, refEl: refEl, anchor: 'tl-tr?', offsets: offsets});

		pop.on('destroy', function () {
			refEl.up('.contact-card').removeCls('active');
		});

		pop.show();
		pop.alignTo(alignmentEl, alignment, offsets);

	},

	isOnline: function (val) {
		return (val || (this.userObject.getPresence && this.userObject.getPresence().toString())) === 'Online';
	},

	updatePresenceState: function (value) {
		if (!this.cardEl) {
			return;
		}
		if (this.isOnline((value && value.toString) ? value.toString() : value)) {
			this.cardEl.removeCls('Offline');
		}
		else {
			this.cardEl.addCls('Offline');
		}

		this.maybeShowChat(this.chatEl);
	},

	presenceChanged: function (key, value) {
		this.updatePresenceState(value);
		this.fireEvent('presence-changed', this);
	},

	getUserObject: function () {
		return this.userObject;
	}
});
