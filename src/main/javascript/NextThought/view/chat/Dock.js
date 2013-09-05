Ext.define('NextThought.view.chat.Dock', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.chat-dock',
	id: 'chat-dock', // There should be ONLY ONE instance of this.

	requires: [
		'NextThought.view.chat.History'
	],

	title: 'Chats',

	ui: 'chat-dock',
	cls: 'chat-dock',
	defaultType: 'chat-dock-item',
	collapseMode: 'header',
	collapsible: true,
	collapsed: true,
	maxHeight: Math.min(300, Ext.Element.getViewportHeight() * 0.6),
	overflowX: 'hidden',
	overflowY: 'auto',
	animCollapse: false,
	listeners: {
		afterRender: 'updateAll',
		add: 'updateAll',
		beforeadd: 'synchronizeHeight',
		remove: 'updateAll'
	},


	constructor: function () {
		this.items = [
			{
				xtype: 'chat-history',
				listeners: {
					scope: this,
					buffer: 100,
					afterlayout: 'syncHistoryHeight'
				}
			}
		];
		this.insertBeforeLast = true;
		this.callParent(arguments);
	},


	afterRender: function () {
		this.callParent(arguments);

		if (Ext.is.iPad) {
			this.placeholder.getEl().un('click', this.floatCollapsedPanel, this);
			this.placeholder.getEl().on('click', this.expand, this);
			this.mon(this.down('header'), 'click', this.collapse, this);
		}
		else {
			this.mon(this.down('header'), 'click', this.slideOutFloatedPanel, this);
		}

		this.placeholder.focus = Ext.emptyFn;

		if (!Ext.is.iPad) {
			//remove the default click handler
			this.placeholder.getEl().un('click', this.floatCollapsedPanel, this);

			//add hover instead
			this.mon(this.placeholder.getEl(), {
				scope: this,
				mouseover: 'maybeExpand',
				mouseout: 'stopExpand'
			});
		}
		Ext.EventManager.onWindowResize(function () {
			this.maxHeight = Math.min(300, Ext.Element.getViewportHeight() * 0.6);
		}, this, null);


		this.countEl = new Ext.dom.CompositeElement([
			Ext.DomHelper.append(this.placeholder.getEl(), {cls: 'count', html: '0'}),
			Ext.DomHelper.append(this.down('header').getEl(), {cls: 'count', html: '0'})
		]);

		this.placeholder.getSize = function () {
			return {height: 1};
		};
	},


	convertCollapseDir: function () {
		return 'b';
	},


	maybeExpand: function () {
		this.stopExpand();
		this.expanDelayTimer = Ext.defer(this.floatCollapsedPanel, 750, this);
	},


	stopExpand: function () {
		clearTimeout(this.expanDelayTimer);
	},


	floatCollapsedPanel: function () {
		if (this.items.length > 0) {
			this.addCls('open');
//			if (!Ext.is.iPad) {
			this.fireEvent('peek');
//			}
			this.callParent();
		}
	},


	slideOutFloatedPanel: function () {
		this.removeCls('open');
		return this.callParent();
	},


	hideOrShowPanel: function () {
		if (this.hasCls('open')) {
			this.slideOutFloatedPanel();
		}
		else {
			this.floatCollapsedPanel();
		}
	},


	synchronizeHeight: function () {
		if (!this.floated && !this.isSliding) {
			return;
		}

		var me = this,
			oldHeight = me.el.getHeight();

		function doSyncHeight() {
			var h = oldHeight - me.el.getHeight();
			if (h !== 0) {
				me.el.animate({y: (me.getY() + h)});
			}
		}

		this.on('afterlayout', doSyncHeight, this, {single: true});
	},


	syncHistoryHeight: function () {
		if (!this.floated && !this.isSliding) {
			return;
		}

		var h = this.getHeight(),
			d = this.lastKnownHeight;
		if (h !== d && Ext.isNumber(d)) {
			d -= h;
			if (d && isFinite(d)) {
				this.animate({
					to: {
						y: this.getY() + d
					}
				});
			}
		}

		this.lastKnownHeight = h;
	},


	onRemove: function () {
		this.synchronizeHeight();

		if (this.items.length === 0 && this.slideOutTask) {
			this.slideOutTask.delay(10);
		}
		return this.callParent(arguments);
	},


	updateAll: function () {
		if (!this.rendered) {
			return;
		}
		this.updateTitle();
		this.updateCount();
	},


	updateTitle: function () {
		var total = 0;
		this.items.each(function (o) {
			if (o && o.isPresented) {
				total++;
			}
		});

		this[total === 0 ? 'addCls' : 'removeCls']('hide-arrow');
		this.placeholder[total === 0 ? 'addCls' : 'removeCls']('hide-arrow');

		this.setTitle((total === 0) ? "Chats" : "Chats (" + total + ")");
	},


	add: function () {
		var result,
			args = Ext.Array.slice(arguments);

		if (this.insertBeforeLast && typeof args[0] !== 'number') {
			args.unshift(this.items.length - 1);
		}


		result = this.callParent(args);

		if (result) {
			if (Ext.isArray(result)) {
				Ext.each(result, this.monitorDockItem, this);
			} else {
				this.monitorDockItem(result);
			}
		}

		return result;
	},


	monitorDockItem: function (cmp) {
		this.mon(cmp, {
			scope: this,
			'count-updated': 'updateCount',
			'made-visible': 'updateTitle',
			destroy: 'updateCount',
			buffer: 1
		});
	},


	updateCount: function () {
		var total = 0;

		this.items.each(function (i) {
			if (i && (i.isDestroying || i.destroyed)) {
				return;
			}
			total += ((i && i.unread) || 0);
		});

		this[total < 1 ? 'removeCls' : 'addCls']('notice-me');
		this.placeholder[total < 1 ? 'removeCls' : 'addCls']('notice-me');

		this.countEl.update(total || '');
		this.fireEvent('update-count', total);
	}

});

Ext.define('NextThought.view.chat.DockItem', {
	extend: 'Ext.Component',
	alias: 'widget.chat-dock-item',
	requires: [
		'NextThought.util.Time'
	],

	cls: 'chat-dock-item',
	ui: 'chat-dock-item',

	hidden: true, //start out as hidden

	renderTpl: Ext.DomHelper.markup([
		{cls: 'close', 'data-qtip': 'Exit Chat'},
		{cls: 'avatars {avatarCls}', cn: [
			{cls: 'img1 avatar', style: {backgroundImage: '{img1}'} },
			{cls: 'img2 avatar', style: {backgroundImage: '{img2}'} },
			{cls: 'img3 avatar', style: {backgroundImage: '{img3}'} },
			{cls: 'img4 avatar', style: {backgroundImage: '{img4}'} }
		]},
		{cls: 'count'},
		{cls: 'wrap', cn: [
			{cls: 'names {namesCls}', html: '{names}', 'data-count': '{count}'},
			{cls: 'status'}
		]}
	]),

	renderSelectors: {
		'countEl': '.count',
		'closeEl': '.close',
		'namesEl': '.wrap .names',
		'statusEl': '.wrap .status',
		'avatarsEl': '.avatars',
		'img1': '.avatars .img1',
		'img2': '.avatars .img2',
		'img3': '.avatars .img3',
		'img4': '.avatars .img4'
	},

	constructor: function () {
		this.callParent(arguments);

		this.fillInInformation(this.associatedWindow.roomInfo);
		this.mon(this.associatedWindow, 'notify', 'handleWindowNotify', this);
		this.lastUpdated = new Date();
		this.unread = 0;
	},

	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.el, 'click', 'onClick', this);
		this.fillInInformation(this.associatedWindow.roomInfo);
		this.updateStatus();
	},


	onAdded: function (ownerCt) {
		this.callParent(arguments);
		this.mon(ownerCt, 'peek', 'updateCount', this);
		this.mon(ownerCt, 'peek', 'updateStatus', this);
		this.mon(ownerCt, 'peek', function () {
			this.fillInInformation(this.associatedWindow.roomInfo);
		}, this);
	},


	onClick: function (e) {
		var me = this;
		e.stopEvent();
		if (e.getTarget(".close")) {
			this.unread = 0;
			this.updateCount();
			this.associatedWindow.close();
			return;
		}

		if (!this.associatedWindow.isVisible()) {
			this.unread = 0;
			this.updateCount();
			this.associatedWindow.show();
			Ext.defer(function () {
				me.associatedWindow.focus();
			}, 500);

		}
		else {
			this.associatedWindow.hide();
		}
	},


	fillInInformation: function (roomInfo) {
		var me = this,
			occ = roomInfo.get('Occupants'),
			usernames = [],
			isGroup = occ.length > 2;

		this.mon(roomInfo, 'changed', 'fillInInformation', this, {single: true});

		if (occ.length === 1 && isMe(occ[0])) {
			return;
		}

		UserRepository.getUser(roomInfo.get('Occupants'), function (users) {
			var userCount = 1, data = {};

			Ext.each(users, function (u) {
				var presence = Ext.getStore('PresenceInfo').getPresenceOf(u.getId());
				if (!isMe(u)) {
					if (userCount <= 4) {
						if (userCount > 1) {
							data.avatarCls = 'quad';
							if (me.rendered) {
								me.avatarsEl.addCls(data.avatarCls);
							}
						}

						//don't show the images if the occupant isn't online, unless its not a group chat
						if ((presence && presence.isOnline()) || !isGroup) {
							data['img' + userCount] = 'url(' + u.get('avatarURL') + ')';
							if (me.rendered) {
								me['img' + userCount].setStyle({backgroundImage: data['img' + userCount]});
							}
							userCount++;
						}
					}
					//don't show the users name if the occupant isn't online, unliess its not a group chat
					if ((presence && presence.isOnline()) || !isGroup) {
						usernames.push(u.getName());
					}
				}

			});

			//blank out the rest
			for (userCount; userCount <= 4; userCount++) {
				delete data['img' + userCount];
				if (me.rendered) {
					me['img' + userCount].setStyle({backgroundImage: undefined});
				}
			}

			Ext.apply(data, {
				names: usernames.join(', '),
				count: usernames.length
			});

			if (!me.rendered) {
				me.renderData = Ext.apply(me.renderData || {}, data);
				return;
			}

			me.namesEl.update(data.names).set({'data-count': data.count});
			if (usernames.length > 1) {
				me.namesEl.addCls('overflown');
			}
		});
	},


	handleWindowNotify: function (msg) {
		if (!this.associatedWindow.isVisible() && msg && msg.Creator && !isMe(msg.Creator)) {
			this.unread++;
			this.updateCount();
		}

		this.lastUpdated = new Date().getTime();
		this.updateStatus();
		this.setVisible(true);
	},


	setVisible: function (show) {
		var reSetTitle = !this.isPresented;
		this.callParent(arguments);

		if (show) {
			this.isPresented = true;
			if (reSetTitle) {
				this.fireEvent('made-visible');
			}
		}
	},


	updateStatus: function () {
		var display, roomInfo = this.associatedWindow.roomInfo,
			occ = roomInfo.get('Occupants'),
			status = this.lastUpdated,
			cur = new Date().getTime(),
			tenMinutesAgo = new Date();

		tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);


		if (!status) {
			console.log("No last Active yet");
		}

		display = TimeUtils.getDurationText(status, cur);

		if (occ.length === 1 && isMe(occ[0])) {
			display = 'Ended';
		}
		else if (status > tenMinutesAgo) {
			display = "In Progress... " + display;
		} else {
			display = "Last message " + display + " ago";
		}

		if (this.statusEl) {
			this.statusEl.update(display);
		}

	},


	updateCount: function () {
		if (this.countEl) {
			this.countEl.update(this.unread || '');
		}
		this.fireEvent('count-updated');
	}


});
