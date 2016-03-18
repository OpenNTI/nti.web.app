var Ext = require('extjs');
var UserRepository = require('../../cache/UserRepository');
var SharingUtils = require('../../util/Sharing');
var WindowWindow = require('../../common/window/Window');
var UtilAnnotations = require('../../util/Annotations');
var ComponentsUserTokenField = require('./components/UserTokenField');
var UserdataActions = require('../userdata/Actions');


module.exports = exports = Ext.define('NextThought.app.sharing.Window', {
    extend: 'NextThought.common.window.Window',
    alias: 'widget.share-window',
    width: 450,
    modal: true,
    dialog: true,

    constructor: function() {
		this.items = [
			{
				xtype: 'component',
				renderTpl: Ext.DomHelper.markup({ cls: '{model:lowercase}', cn: [
					{ cls: 'share-with-data', cn: [
						{ cls: 'title', cn: [{cls: 'avatarContainer', html:'{user:avatar}'}, '{title}']},
						{ cls: 'description', cn: ['{model:capitalize} by ', {tag: 'span', id: '{id}-name', cls: 'username', html: '{name}'}]},
						{ cls: 'snippet', html: '{content:ellipsis(150)}' }
					] }
				]}),
				childEls: ['name', 'avatar']
			},
			{
				xtype: 'container',
				autoEl: {tag: 'div', cls: 'field' },
				items: { xtype: 'user-sharing-list'}
			}
		];

		this.dockedItems = [
			{
				dock: 'bottom',
				xtype: 'container',
				cls: 'buttons',
				layout: { type: 'hbox', pack: 'end' },
				defaults: {ui: 'primary', scale: 'medium'},
				items: [
					{
						xtype: 'container',
						flex: 1,
						items: [
							{xtype: 'checkbox', boxLabel: 'make sharing default', name: 'default'}
						]
					},
					{xtype: 'button', text: 'Cancel', action: 'cancel', ui: 'secondary', handler: function(btn, e) {
						btn.up('window').close();
						e.stopEvent();
					}},
					{xtype: 'button', text: 'Save', handler: function(btn, e) {
						if (this.text === 'Close') {
							btn.up('window').close();
						} else {
							btn.up('window').save();
						}

						e.stopEvent();
					}}
				]
			}
		];

		this.callParent(arguments);
	},

    initComponent: function() {
		var readOnly = this.isReadOnly(),
			title = this.titleLabel || (readOnly ? 'Item Info' : 'Share this...'),
			content = 'This item does not have text',
			u = this.record ? this.record.get('Creator') : $AppConfig.username,
			info = this.items.first(),
			buttons;

		this.UserDataActions = NextThought.app.userdata.Actions.create();

		if (this.record && this.record.getBodyText) {
			content = this.record.getBodyText();
		}
		else if (this.record) {
			content = this.record.get('selectedText') || 'Content';
		}

		//if it is readonly, don't let people select more people they can't share with.
		if (readOnly) {
			this.items[1].items.readOnly = true;
			buttons = this.dockedItems.last();
			buttons.items.shift();
			buttons.items.shift();
			Ext.apply(buttons.items[0], {
				text: 'Close',
				ui: 'primary'
			});
		}

		if (this.record) {
			info.renderData = {
				title: title,
				content: content,
				model: this.record ? this.record.getModelName() : 'No Data',
				name: 'resolving...'
			};

			UserRepository.getUser(u, function(user) {
				var avatar;
				if (!info.rendered) {
					Ext.apply(info.renderData, {
						user: user,
						name: user.getName()
					});
				}
				else {
					avatar = info.el.down('.avatarContainer');

					avatar.update(Ext.util.Format.avatar(user));
					info.name.update(user.getName());
				}

			}, this);
		}
		else {
			//if no record, kill the parts that depend on it...
			this.items = this.items.slice(1);
		}

		this.callParent(arguments);

		//any down calls below this:
		if (this.record) {
			this.setValue(SharingUtils.sharedWithToSharedInfo(this.record.get('sharedWith') || []));
		}
		else if (this.value) {
			this.setValue(SharingUtils.sharedWithForSharingInfo(this.value));
		}

		this.on('close', function() {
			this.dragMaskOff();
		});
	},

    show: function() {
		NextThought.getApplication().fireEvent('showshare', this);
		this.callParent(arguments);
	},

    hide: function() {
		NextThought.getApplication().fireEvent('hideshare', this);
		this.callParent(arguments);
	},

    afterRender: function() {
		this.callParent(arguments);

		var me = this;
		this.mon(this.down('user-sharing-list'), {
			scope: me,
			'new-tag': function() { Ext.defer(me.updateLayout, 1, me); },
			'sync-height': function() { Ext.defer(me.updateLayout, 1, me); }
		});

		// Update the window's ordering so that the modal mask is
		// properly placed behind it.
		this.toBack();
	},

    isReadOnly: function() {
		var refCount;
		if (!this.record) {
			return false;
		}
		if (!this.record.isModifiable()) {
			return true;
		}
		refCount = this.record.get('ReferencedByCount');
		return (this.record.children && this.record.children.length > 0) || (!Ext.isEmpty(refCount) && refCount > 0);
	},

    getValue: function() {
		return this.down('user-sharing-list').getValue();
	},

    setValue: function(v) {
		this.down('user-sharing-list').setValue(v);
	},

    save: function() {
		var checkbox = this.down('checkbox');

		this.el.mask('Sharing...');

		this.UserDataActions.updateShareWith(this.record, this.getValue(), checkbox.checked, this.bundle)
			.then(this.close.bind(this))
			.fail(this.el.unmask.bind(this.el));
	}
});
