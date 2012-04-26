Ext.define('NextThought.view.frame.Navigation',{
	extend: 'Ext.container.Container',
	alias: 'widget.main-navigation',
	requires: [
		'NextThought.view.frame.ModeSelect',
		'NextThought.view.frame.menus.Home',
		'NextThought.view.frame.menus.Library',
		'NextThought.view.frame.menus.Classroom',
		'NextThought.view.frame.menus.Search'
	],

	cls: 'main-navigation',
	layout: 'vbox',
	defaults: {
		width: 279,
		frame: false,
		border: false
	},

	renderTpl: [
		'<div class="main-navigation-bar">',
			'<a href="#">',
				'<img src="{[Ext.BLANK_IMAGE_URL]}" border="0"/>',
				'<span class="logo-divider"></span>',
			'</a>',
		'</div>',
		'<div class="main-navigation-bar-body">',
			'{%this.renderContainer(out,values);%}',
		'</div>'
		],

	renderSelectors: {
		box: 'div.main-navigation-bar',
		logo: 'div.main-navigation-bar a',
		frameBody: 'div.main-navigation-bar-body'
	},

	items: [
		{ xtype: 'mode-select' },
		{
			flex: 1,
			id: 'navigation-menu-container',
			ui: 'menu-wrapper',
			xtype: 'container',
			layout: 'card',

			items: [
				{ xtype: 'home-menu' },
				{ xtype: 'library-menu' },
				{ xtype: 'classroom-menu' },
				{ xtype: 'search-menu' }
			]
		}
	]

},function(){

});
