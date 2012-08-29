Ext.define('NextThought.view.account.Notifications',{
	extend: 'Ext.Component',
	alias: 'widget.notifications',

	cls: 'notifications',

	NOTIFICATIONS_TO_SHOW_AT_FIRST: 5,

	messagePrefixes: {
		'Highlight': 'Highlighted',
		'Note': 'Commented',
		'User': 'Added you to a group'
	},

	renderTpl: Ext.DomHelper.markup([
		'Notifications',
		{cls:'notification-scroll-container', cn:[
			{tag:'tpl', 'for':'notifications', cn:[
				{cls:'notification-item', id:'{guid}', cn:[
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


	constructor: function(){
		Ext.getStore('Stream').on('datachanged', this.setupRenderData, this);
		return this.callParent(arguments);
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
			var item = change.get('Item');
			var loc = item? LocationProvider.getLocation(item.get('ContainerId')) : null,
				bookTitle = loc && loc.title ? loc.title.get('title') : null,
				m = this.generateMessage(change, bookTitle),
				guid = guidGenerator();

			//update counter so we know when we are done:
			itemsToLoad--;
			if(!item){return;}//skip it

			UserRepository.getUser(change.get('Creator'), function(u){
				var targets = (item.get('references') || []).slice();
				targets.push(item.getId());
				this.notifications.push({'name' :u[0].get('realname'), 'message': m, 'guid': guid});
				this.notificationData[guid] = {
					containerId: item.get('ContainerId'),
					id: targets
				};
//				this.renderData.notificationcount = this.notifications.length;
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


	clicked: function(event, element){
		var css = '[class=notification-item]',
			f = Ext.fly(element),
			is = f.is(css),
			c = is ? f : f.up(css),
			guid = c.id,
			containerId = this.notificationData[guid].containerId,
			targets = this.notificationData[guid].id;


		this.fireEvent('navigation-selected', containerId, targets);
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
			end = bookTitle ? ' in ' + bookTitle : '';

		//catchall in case new changetypes are added and we don't hear about it
		if (!p) {
			console.error('Not sure what to do with change type of ' + it);
			p = 'Did something';
		}

		return p + end;
	}
});
