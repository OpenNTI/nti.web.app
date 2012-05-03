Ext.define('NextThought.view.menus.Notifications',{
	extend: 'Ext.menu.Item',
	alias: 'widget.notifications-menuitem',
	cls: 'notifications',

	renderTpl: [
		'Notifications <tpl if="notificationcount &gt; 0">({notificationcount})</tpl>',
		'<tpl for="notifications">',
			'<div class="notification-item">',
				'<div class="name">{name}</div>',
				'<div class="message">{message}</div>',
			'</div>',
		'</tpl>',
		'<a href="#" class="notification-see-all">See All</a>'
	],

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},{

			//TODO: mine these values from the system.
			'notificationcount': 7,
			'notifications': [
				{'name': 'John Gutenberg',		'message': 'Created a Note in Pre-Algebra' },
				{'name': 'Guillermo Montoya',	'message': 'Highlighted in Out Of The Rainforest' },
				{'name': 'Sven Einhorn',		'message': 'Commented in Howes v. Fields.' },
				{'name': 'Ben Stein', 			'message': 'Added you to &ldquo;Biology Studdy Group&rdquo;' }
			]
		});
	}
});
