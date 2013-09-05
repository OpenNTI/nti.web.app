Ext.define('NextThought.view.chat.log.Content', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-content-log-entry',


	requires: [
        'NextThought.cache.LocationMeta'
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
        var me = this;
		me.callParent(arguments);

		//request the location that has been sent, save it for use later
		me.ntiid = me.message.get('body').ntiid;

        LocationMeta.getMeta(this.ntiid, function(meta){
            me.location = meta;
            me.clickable = me.location ? true : false;
            me.update();
        });
	},

	update: function(){
		var me = this,
			href,
			icon, root, username;

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
			href = getURL($AppConfig.service.getCollection('Objects', 'Global').href + '/' + this.ntiid);
		}

		me.renderData.time = Ext.Date.format(new Date(), 'g:i:sa');
		me.renderData.name = 'resolving...';
		me.renderData.body = this.location ? this.location.label || this.location.title : '';
		me.renderData.locationicon = href;

        if(me.rendered){
            me.renderTpl.overwrite(me.el, me.renderData);
            me.applyRenderSelectors();
            me.attachClick();
        }

		username = this.message.get('Creator');
		UserRepository.getUser(username, me.fillInUser, me);

		me.addCls('nooid');
	},

	afterRender: function(){
		this.callParent(arguments);
		this.attachClick();
	},


    attachClick: function(){
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
