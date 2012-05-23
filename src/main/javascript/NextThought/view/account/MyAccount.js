Ext.define('NextThought.view.account.MyAccount',{
	extend: 'Ext.Component',
	alias: 'widget.my-account',
	requires: [
		'NextThought.view.menus.MyAccount'
	],

	renderTpl: [
		'<div class="my-account-wrapper">',
			'<div class="settings menu-nib"></div>',
			'<div class="name">{name}<span class="notifications">{notification-count}</span></div>',
			'<div class="status">{status}</div>',
		'</div>'
	],

	renderSelectors: {
		boxEl: 'div.my-account-wrapper',
		notificationCount: 'span.notifications'
	},

	initComponent: function(){
		var me = this, cls = 'menu-visible',t;
		me.callParent(arguments);
		me.renderData = Ext.apply(me.renderData||{},{
			name: $AppConfig.userObject.getName(),
			'notification-count': $AppConfig.userObject.get('NotificationCount') || '',
			status: 'Reading Prime Factorization'
		});
		me.menu = Ext.widget({xtype: 'my-account-menu', xhooks:{
			hide: function(){ this.callParent(arguments); clearTimeout(t); me.getEl().removeCls(cls);},
			show: function(){ this.callParent(arguments); t=setTimeout(function(){me.getEl().addCls(cls);},600);}
		}});

		//Listen to the store for updating notification count
		Ext.getStore('Stream').on('datachanged', this.updateCountFromStore, this);
	},

	afterRender: function(){
		this.callParent(arguments);
		this.getEl().addCls(Ext.baseCSSPrefix + 'menu');//make clicks on this not hide the menu
		this.getEl().on({
			scope: this,
			click: this.showMenu
		});
	},


	updateCountFromStore: function(store) {
		var lastLogin = $AppConfig.userObject.get('lastLoginTime'),
			count = 0;
		store.each(function(change){
			if (change.get('Last Modified') > lastLogin) {
				count++;
			}
		});

		if (!this.rendered) {
			this.renderData['notification-count'] = count || '';
		}
		else {
			this.notificationCount.update(count || '');
		}
	},


	showMenu: function(e){
		e.stopPropagation();
		e.preventDefault();

		if(!this.menu.isVisible()){
			this.menu.showBy(this.boxEl,'tl-bl?',[0,-1]);
			this.updateLastLoginTime();
		}
		else {
			this.menu.hide();
		}

		//IE needs this
		return false;
	},


	updateLastLoginTime: function(){
		$AppConfig.userObject.set('lastLoginTime', Ext.Date.now());
		$AppConfig.userObject.save();
	}
});
