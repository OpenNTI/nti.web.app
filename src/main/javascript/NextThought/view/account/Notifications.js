Ext.define('NextThought.view.account.Notifications',{
	extend: 'Ext.Component',
	alias: 'widget.notifications',

	cls: 'notifications',

	NOTIFICATIONS_TO_SHOW_AT_FIRST: 5,

	messagePrefixes: {
		'deleted': 'Deleted',
		'Highlight': 'Highlighted',
		'Note': 'Commented',
		'Redaction': 'Redacted',
		'User': 'Added you to a group'
	},

	renderTpl: Ext.DomHelper.markup([
		'Notifications',
		{cls:'notification-scroll-container', cn:[
			{tag:'tpl', 'for':'notifications', cn:[
				{cls:'notification-item {unread}', id:'{guid}', cn:[
					{cls:"name",html:'{name}'},
					{cls:'message',html:'{message}'}
				]}
			]}
		]},
		{tag:'tpl', 'if':'!hideSeeAll', cn:[
			{tag:'a', href:"#", cls:'notification-see-all', html:'See All'}
		]}
	]),

	renderSelectors: {
		seeAll: '.notification-see-all',
		scrollBox: '.notification-scroll-container'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.mon(Ext.getStore('Stream'), {
			scope: this,
			'add': this.updateNotificationCount,
			'datachanged': this.setupRenderData
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.el.on('click', this.clicked, this);
		this.setupRenderData();
	},


	setupRenderData: function(store, records, success) {
		if(!store) {store = Ext.getStore('Stream');}

		if(!this.rendered){return;}

		var itemsToLoad = store.getCount();

		//setup render data
		this.renderData = Ext.apply(this.renderData||{},{
			'notificationcount': $AppConfig.userObject.get('NotificationCount') || 0,
			'notifications': [],
			hideSeeAll: true
		});
		this.notifications = [];
		this.notificationData = {};

		store.each(function(change){
			var item = change.get('Item'),
				loc = item? LocationProvider.getLocation(item.get('ContainerId')) : null,
				bookTitle = loc && loc.title ? loc.title.get('title') : null,
				m = this.generateMessage(change, bookTitle),
				guid = guidGenerator();


			UserRepository.getUser(change.get('Creator'), function(u){
				var targets = item ? (item.get('references') || []).slice() : [];
				if(item){
					targets.push(item.getId());
				}

				this.notifications.push({
					'name' :u[0].getName(),
					'message': m,
					'guid': guid,
					'unread': change.get('Last Modified') > $AppConfig.userObject.get('lastLoginTime') ? 'unread' : ''
				});
				this.notificationData[guid] = {
					containerId: item?item.get('ContainerId'):undefined,
					id: targets
				};

				//update counter so we know when we are done:
				itemsToLoad--;

				//only add this to actual render data if we have few enough
				if (this.notifications.length <= this.NOTIFICATIONS_TO_SHOW_AT_FIRST) {
					this.renderData.notifications.push(this.notifications.last());
				}
				else {
					this.renderData.hideSeeAll = false;
				}

				//render if necessary
				if (itemsToLoad === 0 && this.rendered) {
					this.renderSpecial(this.renderData);
				}
			}, this);
		}, this);
	},


	renderSpecial: function(rd) {
		this.el.update(this.renderTpl.apply(rd));
		this.seeAll = this.el.select(this.renderSelectors.seeAll);
		if (this.seeAll) {
			this.seeAll.on('click', this.showAllNotifications, this);
		}
	},



	updateNotificationCount: function(store,records){
		var u = $AppConfig.userObject,
			c = (u.get('NotificationCount') || 0) + records.length;

		//Update current notification of the userobject.
		u.set('NotificationCount', c);
		u.fireEvent('changed',u);
	},


	clicked: function(event, element){
		var me = this,
			u = $AppConfig.userObject,
			t = event.getTarget('.notification-item',null,true),
			guid = t.id,
			containerId = this.notificationData[guid].containerId,
			targets = this.notificationData[guid].id;

		u.saveField('lastLoginTime', new Date(), function(){
			me.setupRenderData();
		});
		u.saveField('NotificationCount', 0);

		if (this.notificationData[guid].containerId !== 'Users'){
			console.log('no navigation for users...');
			this.fireEvent('navigation-selected', containerId, targets);
		}
	},

	showAllNotifications: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var height = this.el.getHeight() - 30;

		this.el.update(this.renderTpl.apply({
			'notifications': this.notifications,
			hideShowAll: true
		}));

		this.applyRenderSelectors();
		this.scrollBox.setHeight(height);
		return false;
	},


	generateMessage: function(change, bookTitle) {
		var item = change.get('Item'),
			it = item?item.getModelName():'deleted',
			p = this.messagePrefixes[it],
			end = bookTitle ? (' in ' + bookTitle) : '';

		//catchall in case new changetypes are added and we don't hear about it
		if (!p) {
			console.error('Not sure what to do with change type of ' + it);
			p = 'Did something';
		}

		return p + end;
	}
});
