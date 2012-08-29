//SCSS defined _identity.scss
Ext.define('NextThought.view.account.Identity',{
	extend: 'Ext.Component',
	alias: 'widget.identity',

	cls: 'identity',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'img', src: '{avatarURL}', cls: 'avatar'},
		{
			cls: 'wrap',
			cn: [{
				cls: 'name', html: '{realname:ellipsis(30)}', cn: [{
					tag:'span', cls:'notifications',html:'{notification-count}'}]
			},{
				cls: 'status', html: '{status}'
			}]
		}
	]),

	renderSelectors: {
		notificationCount: 'span.notifications',
		name: 'div.name',
		status: 'div.status'
	},

	initComponent: function(){
		var me = this, t;

		me.currentNotificationCount = $AppConfig.userObject.get('NotificationCount') || 0;

		me.callParent(arguments);

		me.renderData = Ext.apply(
				Ext.apply(me.renderData||{}, $AppConfig.userObject.data), {
					'notification-count': me.currentNotificationCount || '&nbsp;'
				});

		this.mon($AppConfig.userObject,{
			scope: this,
			'changed': function(r){
				this.name.update(r.getName());
				this.status.update(r.get('status'));
			}
		});

		//When something is added to the stream store, ONLY added, we need to adjust the counter.
		//We DO NOT adjust on datachanged because we get the original not count from the user obj.
		Ext.getStore('Stream').on('add', this.updateNotificationCount, this);
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

	resetNotificationCount: function(){
		$AppConfig.userObject.saveField('NotificationCount', 0);
		this.currentNotificationCount = 0;
		this.setNotificationCountValue(null);
	}
});
