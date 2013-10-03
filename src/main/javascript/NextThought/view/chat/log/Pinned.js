Ext.define('NextThought.view.chat.log.Pinned', {
	extend: 'Ext.Component',
	alias: 'widget.chat-log-entry-pinned',

	requires: [
		'NextThought.util.Annotations'
	],

	renderTpl: new Ext.XTemplate(
		'<div class="x-chat-log-entry-pinned">',
			'<div class="icon">',
				'<img src="{icon}" width=32 height=32"/>',
				'<span class="name">{name}</span>',
			'</div>',
			'<div class="body">',
				'<span class="body-text">{body}</span> ',
			'</div>',
		'</div>'
		),

	renderSelectors: {
		box: 'div.x-chat-log-entry-pinned',
		name: '.x-chat-log-entry-pinned span.name',
		text: 'span.body-text',
		icon: 'img'
	},

	initComponent: function() {
		this.callParent(arguments);

		var me = this,
			m = me.message,
			s = m.get('Creator');

		delete me.message;

		me.renderData.name = 'resolving...';
		m.compileBodyContent(function(content) {
			me.renderData.body = content;
			if (me.rendered) {
			   me.text.update(me.renderData.body);
			   me.time.update(me.renderData.time);
			}
		});

		if (s) {
			UserRepository.getUser(s, function(u) {
				if (!u) {
					console.error('failed to resolve user', s, m);
					return;
				}

				me.fillInUser(u);
			},
				this);
		}
	},

	fillInUser: function(u) {
		var name = u.get('alias') || u.get('Username'),
			i = u.get('avatarURL');

		if (this.rendered) {
			this.icon.set({src: i});
			this.name.update(name);
		}
		else {
			this.renderData.name = name;
			this.renderData.icon = i;
		}

	}
});
