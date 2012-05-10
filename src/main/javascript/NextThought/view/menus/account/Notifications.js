Ext.define('NextThought.view.menus.account.Notifications',{
	extend: 'Ext.menu.Item',
	alias: 'widget.notifications-menuitem',
	cls: 'notifications',

	NOTIFICATIONS_TO_SHOW_AT_FIRST: 2,

	messagePrefixes: {
		'Highlight': 'Highlighted',
		'Note': 'Commented',
		'User': 'Added you to a group'
	},

	renderTpl: [
		'Notifications <tpl if="notificationcount &gt; 0">({notificationcount})</tpl>',
		'<tpl for="notifications">',
			'<div class="notification-item" id="{guid}">',
				'<div class="name">{name}</div>',
				'<div class="message">{message}</div>',
			'</div>',
		'</tpl>',
		'<tpl if="!hideSeeAll">',
			'<a href="#" class="notification-see-all">See All</a>',
		'</tpl>'
	],

	renderSelectors: {
		seeAll: 'a.notification-see-all'
	},


	initComponent: function(){
		this.callParent(arguments);
		Ext.getStore('Stream').on('datachanged', this.setupRenderData, this);
	},


	onAdded: function(){
		this.parentMenu.on('beforeshow', function(){this.setupRenderData();}, this);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.el.on('click', this.clicked, this);
	},


	setupRenderData: function(store, records, success) {
		if(!store) {store = Ext.getStore('Stream');}

		if(!this.rendered){return;}

		var itemsToLoad = store.getCount();

		//setup render data
		this.renderData = Ext.apply(this.renderData||{},{
			'notificationcount': 0,
			'notifications': [],
			hideSeeAll: true
		});
		this.notifications = [];
		this.containers = {};

		store.each(function(change){
			var item = change.get('Item'),
				loc = LocationProvider.getLocation(item.get('ContainerId')),
				bookTitle = loc ? loc.title.get('title') : null,
				m = this.generateMessage(change, bookTitle),
				guid = guidGenerator();

			//update counter so we know when we are done:
			itemsToLoad--;

			UserRepository.prefetchUser(change.get('Creator'), function(u){
				this.notifications.push({'name' :u[0].get('realname'), 'message': m, 'guid': guid});
				this.containers[guid] = item.get('ContainerId');
				this.renderData.notificationcount = this.notifications.length;
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
		this.parentMenu.doLayout();
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
			containerId = this.containers[guid];

		this.fireEvent('navigation-selected', containerId);
	},

	showAllNotifications: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.el.update(this.renderTpl.apply({
			'notifications': this.notifications,
			hideShowAll: true
		}));

		//cause parent to layout
		this.parentMenu.doLayout();

		return false;
	},


	generateMessage: function(change, bookTitle) {
		var item = change.get('Item'),
			it = item.getModelName(),
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
