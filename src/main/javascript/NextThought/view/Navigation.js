Ext.define('NextThought.view.Navigation',{
	extend: 'Ext.container.Container',
	alias: 'widget.main-navigation',
	requires: [
		'NextThought.view.ViewSelect',
		'NextThought.view.menus.Home',
		'NextThought.view.menus.Library',
		'NextThought.view.menus.Classroom',
		'NextThought.view.menus.Search'
	],

	cls: 'main-navigation',
	layout: 'vbox',
	width: 276,
	defaults: {
		width: 276,
		frame: false,
		border: false
	},

	items: [
		{
			xtype: 'component',
			renderTpl: [
				'<div class="logo-head">',
					'<a href="#">',
						'<img src="{[Ext.BLANK_IMAGE_URL]}" border="0"/>',
						'<span class="logo-divider"></span>',
					'</a>',
				'</div>'
			]
		},
		{
			xtype: 'container',
			flex: 1,
			cls: 'main-navigation-frameBody',
			layout: 'vbox',
			defaults:{
				width: 276,
				frame: false,
				border: false
			},
			items: [
				{ xtype: 'view-select' },
				{
					flex: 1,
					id: 'navigation-menu-container',
					ui: 'menu-wrapper',
					xtype: 'container',
					layout: 'card',
					renderTpl: [
						'<div class="view-switcher-shadow"></div>',
						'{%this.renderContainer(out,values)%}'
					],

					items: [
						{ xtype: 'home-menu' },
						{ xtype: 'library-menu' },
						{ xtype: 'classroom-menu' },
						{ xtype: 'search-menu', id: 'search' }
					]
				}
			]
		}
	]
});
