Ext.define('NextThought.view.windows.NotificationsPopover', {
	extend: 'Ext.panel.Panel',
	alias: 'window.notifications-popover',
	requires: [
		'NextThought.view.widgets.MiniStreamEntry'
	],

	cls: 'notification-popover',
	autoScroll: true,
	floating: true,
	border: true,
	frame: false,
	width: 350,
	height: 50,
	items:[{margin: 3}],
	defaults: {border: false,
		defaults: {border: false}},

	initComponent: function() {
		this.lastLoginTime = $AppConfig.userObject.get('lastLoginTime');
		this.callParent(arguments);
	},

	render: function() {
		this.callParent(arguments);
		var me = this,
			el = me.el;

		me.alignTo(this.bindTo);
		el.mask('Loading');
		el.on('mouseenter', me.cancelClose, me);
		el.on('mouseleave', me.closePopover, me);
		el.on('click', me.itemClicked, me);

		this.updateContents();
	},

	cancelClose: function() {
		if (this.leaveTimer){
			window.clearTimeout(this.leaveTimer);
		}
	},

	closePopover: function() {
		this.cancelClose();

		var me = this;
		this.leaveTimer = window.setTimeout(function(){
			Ext.EventManager.removeResizeListener(me.fixHeight,me);
			me.close();
		}, 750);
	},

	itemClicked: function(e) {
		e.stopPropagation();
		e.preventDefault();


		if (Ext.fly(e.getTarget()).parent('div[id^=miniStreamEntry]')) {
			this.close();
		}
	},

	updateContents: function(showAll) {
		var unread,
			store = Ext.getStore('Stream'),
			p = this.items.get(0),
			c = 0,
			me = this;

		//clear any existing stuff
		p.removeAll();

		//sort the store so newest stuff is on top
		store.sort('Last Modified', 'DESC');

		//put stuff into the list
		Ext.each(store.getRange(), function(m){
			//check to see if we should add a button instead of more entries
			if (c > 5 && !showAll) {
				p.add(
					{
						xtype: 'container',
						layout: {
							type: 'hbox',
							pack: 'center'
						},
						items: {
							xtype: 'button',
							text: 'Show All',
							margin: '5px 0px',
							listeners: {
								'click' : function(cmp, e){me.updateContents(true);}
							}
						}
					}
				);
				return false;
			}

			if (m.get) {
				unread = (m.get('Last Modified') > me.lastLoginTime);
				console.log('unread', unread);
				p.add({xtype: 'miniStreamEntry', change: m, cls: unread ? 'unread' : 'read'});
				c++; //get it?
			}
		});

		//WOAH!  Nothing there, let them know.
		if(p.items.length === 0) {
			p.add({
				html: '<b>No new updates</b>',
				border: false,
				margin: 10
			});
		}

		//unmask and make sure it's the right size.
		me.fixHeight();
		me.el.unmask();
	},

	fixHeight: function(){
		var me = this, e, max;
		try{
			if (me.el && !me.isDestroyed){
				e = me.bindTo;
				max = (Ext.getBody().getHeight() - e.getPosition()[1] - e.getHeight() - 10);
				me.height = undefined;
				me.doLayout();
				if(me.getHeight()> max) {
					me.setHeight(max);
				}
				Ext.EventManager.onWindowResize(me.fixHeight,me, {single: true});
			}
		}
		catch(err){
			if(me){
				console.warn('NotificationPopover Height-adjustment', err,err.stack);
			}
		}
	}



});
