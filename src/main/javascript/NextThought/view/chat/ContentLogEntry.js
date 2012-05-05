Ext.define('NextThought.view.chat.ContentLogEntry', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-content-log-entry',


	requires: [
	],


	renderTpl: new Ext.XTemplate(
		'<div class="x-chat-content-log-entry">',
			'<div class="timestamp">{time}</div>',
			'<img src="{icon}" width=16 height=16"/>',
			'<div>',
				'<span class="name">{name}</span> ',
				'<span class="body-text">sent content {body}</span> ',
				'<img src="{locationicon}" class="contentimage" width=90%/>',
			'</div>',
		'</div>'
		),


	renderSelectors: {
		box: 'div.x-chat-content-log-entry',
		name: '.x-chat-content-log-entry span.name',
		text: 'span.body-text',
		time: 'div.timestamp',
		icon: 'img[width=16]',
		locationicon: 'img.contentimage'

	},


	initComponent: function(){
		this.callParent(arguments);

		//request the location that has been sent, save it for use later
		this.ntiid = this.message.get('body').ntiid;
		this.location = LocationProvider.getLocation(this.ntiid);
		this.clickable = this.location ? true : false;

		this.update();
	},

	update: function(){
		var me = this,
			href = $AppConfig.server.host,
			icon, root;

		if(this.location){
			icon = this.location.icon;
			root = this.location.root;

			//icon url does not have root
			if (icon.indexOf(root) !== 0) {
				href = root + icon;
			}
			else {
				//root already there...
				href = icon;
			}
		}
		else {
			href += $AppConfig.service.getCollection('Objects', 'Global').href + '/' + this.ntiid;
		}

		me.renderData.time = Ext.Date.format(new Date(), 'g:i:sa');
		me.renderData.name = 'resolving...';
		me.renderData.body = this.location ? this.location.label || this.location.title : '';
		me.renderData.locationicon = href;

		UserRepository.prefetchUser(this.message.get('Creator'), function(users){
			var u = users[0];
			if (!u) {
				console.error('failed to resolve user', person, m);
				return;
			}
				me.fillInUser(u);
		},
		this);

		me.addCls('nooid');
	},

	afterRender: function(){
		this.callParent(arguments);
		if (this.clickable) {
			this.el.on('click', function(){this.fireEvent('click', this);}, this);
		}
	},


	fillInUser: function(u) {
		var name = u.get('alias') || u.get('Username'),
			i = u.get('avatarURL');

		if(this.rendered){
			this.icon.set({src: i});
			this.name.update(name);
		}
		else {
			this.renderData.name = name;
			this.renderData.icon = i;
		}

	}
});
