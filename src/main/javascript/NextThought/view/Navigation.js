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
				{ xtype: 'search-menu' }
			]
		}
	]

},function(){

});
