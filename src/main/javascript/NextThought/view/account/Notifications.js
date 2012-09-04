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
			{tag:'tpl', 'if':'loading', cn:[
				{cls:'notification-item unread loading', cn:[
					{cls:"name",html:'Loading...'},
					{cls:'message',html:'Please wait'}
				]}
			]},
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


	initComponent: function(){
		this.autoEl = 'div';
		this.callParent(arguments);
		this.mon(Ext.getStore('Stream'), {
			scope: this,
			'add': this.updateNotificationCount,
			'load': this.setupRenderData,
			'datachanged': this.setupRenderData
		});
		this.setupRenderData();
	},


	afterRender: function(){
		this.callParent(arguments);
		this.el.on('click', this.clicked, this);
	},


	setupRenderData: function(store) {
		var loading = this.loading || false,
			itemsToLoad;

		if(!store && this.loading !== false) {
			store = Ext.getStore('Stream');
			loading = true;
			this.loading = false;

			if(!store){
				console.error('WOH! no store! abort!');
				return;
			}
		}

		itemsToLoad = store.getCount();

		//setup render data
		this.renderData = Ext.apply(this.renderData||{},{
			'notificationcount': $AppConfig.userObject.get('NotificationCount') || 0,
			'notifications': [],
			hideSeeAll: true,
			loading: loading
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
					'name' : u.getName(),
					'message': m,
					'guid': guid,
					'date': change.get('Last Modified'),
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
		if(!this.rendered){return;}
		this.el.update(this.renderTpl.apply(rd));
		this.updateLayout();
	},



	updateNotificationCount: function(store,records){
		var u = $AppConfig.userObject,
			c = (u.get('NotificationCount') || 0) + ((records||{}).length||0);

		//Update current notification of the userobject.
		u.set('NotificationCount', c);
		u.fireEvent('changed',u);
	},


	clicked: function(event){
		var me = this,
			u = $AppConfig.userObject,
			t = event.getTarget('.notification-item',null,true),
			guid = t? (t.id || null) : null,
			containerId = guid? this.notificationData[guid].containerId : null,
			targets = guid? this.notificationData[guid].id : null;

		if(!guid){

			if(event.getTarget('.notification-see-all')){
				this.showAllNotifications(event);
			}

			return;
		}

		Ext.each(this.notifications,function(o){
			o.unread = o.date > u.get('lastLoginTime') ? 'unread' : '';
		});

		u.saveField('lastLoginTime', new Date(), function(){
			me.setupRenderData();
		});
		u.saveField('NotificationCount', 0);

		if (targets && containerId){
			this.fireEvent('navigation-selected', containerId, targets);
		}
	},

	showAllNotifications: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.el.update(this.renderTpl.apply({
			'notifications': this.notifications,
			hideShowAll: true
		}));

		this.updateLayout();
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
