Ext.define('NextThought.view.widgets.chat.InfoLogEntry', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-info-log-entry',

	requires: [
	],

	renderTpl: new Ext.XTemplate(
		'<div class="x-chat-info-log-entry">',
			'<div class="timestamp">{time}</div>',
			'<img src="{icon}" width=16 height=16"/>',
			'<div>',
				'<span class="name">{name}</span> ',
				'<span class="body-text">{body}</span> ',
			'</div>',
		'</div>'
		),

	renderSelectors: {
		box: 'div.x-chat-info-log-entry',
		name: '.x-chat-info-log-entry span.name',
		text: 'span.body-text',
		time: 'div.timestamp',
		icon: 'img'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.update(this.person, this.message);
	},


	update: function(person, m){
		var me = this;

		me.message = m;

		me.renderData.time = Ext.Date.format(new Date(), 'g:i:sa');
		me.renderData.name = 'resolving...';
		me.renderData.body = m;

		UserRepository.prefetchUser(person, function(users){
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
