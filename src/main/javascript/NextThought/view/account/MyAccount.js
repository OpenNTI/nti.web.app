Ext.define('NextThought.view.account.MyAccount',{
	extend: 'Ext.Component',
	alias: 'widget.my-account',
	requires: [
		'NextThought.view.menus.MyAccount'
	],
	cls: 'my-account-menu',

	renderTpl: [
		'<div class="my-account-wrapper">',
			'<div class="settings menu-nib"></div>',
			'<div class="name">{name:ellipsis(25)}<span class="notifications">{notification-count}</span></div>',
			'<div class="status">{status}</div>',
		'</div>'
	],

	renderSelectors: {
		boxEl: 'div.my-account-wrapper',
		notificationCount: 'span.notifications'
	},

	initComponent: function(){
		var me = this, cls = 'menu-visible',t;

		me.currentNotificationCount = $AppConfig.userObject.get('NotificationCount') || 0;

		me.callParent(arguments);
		me.renderData = Ext.apply(me.renderData||{},{
			name: $AppConfig.userObject.getName(),
			'notification-count': me.currentNotificationCount || '&nbsp;',
			status: 'Placeholder text for status'
		});
		me.menu = Ext.widget({xtype: 'my-account-menu', xhooks:{
			hide: function(){ this.callParent(arguments); clearTimeout(t); me.getEl().removeCls(cls);},
			show: function(){ this.callParent(arguments); t=setTimeout(function(){me.getEl().addCls(cls);},600);}
		}});

		//When something is added to the stream store, ONLY added, we need to adjust the counter.
		//We DO NOT adjust on datachanged because we get the original not count from the user obj.
		Ext.getStore('Stream').on('add', this.updateNotificationCount, this);
	},

	afterRender: function(){
		this.callParent(arguments);
		this.getEl().addCls(Ext.baseCSSPrefix + 'menu');//make clicks on this not hide the menu
		this.getEl().on({
			scope: this,
			click: this.showMenu
		});
	},


	updateNotificationCount: function(store, records) {
		this.currentNotificationCount+=records.length;
        $AppConfig.userObject.set('NotificationCount', this.currentNotificationCount);  //Update current notification of the userobject.
		this.setNotificationCountValue(this.currentNotificationCount);
	},


	setNotificationCountValue: function(count){
		if (!this.rendered) {
			this.renderData['notification-count'] = count || '&nbsp;';
		}
		else {
			this.notificationCount.update(count || '&nbsp;');
		}
	},


	showMenu: function(e){
		e.stopPropagation();
		e.preventDefault();

		if(!this.menu.isVisible()){
			this.menu.showBy(this.boxEl,'tl-bl?',[0,-1]);
			this.resetNotificationCount();
		}
		else {
			this.menu.hide();
		}

		//IE needs this
		return false;
	},


	resetNotificationCount: function(){
		$AppConfig.userObject.saveField('NotificationCount', 0);
		this.currentNotificationCount = 0;
		this.setNotificationCountValue(null);
	}
});
