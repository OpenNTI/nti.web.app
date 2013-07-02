Ext.define('NextThought.view.Navigation',{
	extend: 'Ext.Component',
	alias: 'widget.main-navigation',
	requires: [
		'NextThought.view.menus.Navigation',
		'NextThought.view.library.menus.Collection'
	],

	cls: 'main-navigation',

	listeners: {
		click: {
			element: 'el',
			fn: 'onClick'
		},
		mouseover:{
			element: 'el',
			fn: 'onMouseOver'
		},
		mouseout: {
			element: 'el',
			fn: 'onMouseOut'
		}
	},

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'branding' },
		{
			'data-view': 'library',
			'data-qtip':'Library',
			cls: 'library',
			cn:[
				{ cls: 'image' },
				{
					cls: 'wrap',
					cn:[
						{ cls: 'provider'},
						{ cls: 'title'}
					]
				}
			]
		},
		{ cls: 'forums', 'data-qtip':'Forums', 'data-view': 'forums' },
		{ cls: 'contacts', 'data-qtip':'Contacts','data-view': 'contacts' },
		{ cls: 'search', 'data-qtip':'Search','data-view': 'search' }
	]),


	searchMenu: {
		xtype: 'navigation-menu',
		layout: {type: 'vbox', align: 'stretch'},
		overflowX: 'hidden',
		overflowY: 'hidden',
		cls: 'search-menu',
		items:[
			{ xtype: 'searchfield' },
			{ xtype: 'container',
			  overflowX: 'hidden',
			  overflowY: 'scroll',
			  id: 'search-results',
			  hideMode: 'display',
			  flex: 1 
			}
		],
		listeners:{
			show: function(m){
				m.down('searchfield').focus(true, true);
			}
		}
	},


	initComponent: function(){
		this.callParent(arguments);
		this.libraryMenu = Ext.widget({
			xtype: 'navigation-menu',
			renderTo: Ext.getBody(),
			items:[{
			   xtype:'library-collection', name: 'All Books', 
			   listeners:{
			   		scope: this, 
			   		select:'updateCurrent'
			   }
			}]
		});

		this.searchMenu = Ext.widget(this.searchMenu);

		this.floatingItems = {};
		this.items = {items: [
			this.libraryMenu,
			this.searchMenu
		]};

		this.mon(this.libraryMenu,{
			scope: this.libraryMenu,
			mouseleave: this.startHide,
			mouseenter: this.startShow
		});

		this.mon(this.searchMenu,{
			scope: this.searchMenu,
			mouseleave: this.startHide,
			mouseenter: this.startShow
		});
	},


	getRefItems: Ext.container.Container.prototype.getRefItems,


	updateCurrent: function(s, rec){
		if(!rec){ console.error("No record attached"); return; }



		this.el.down('.image').setStyle('background-image', 'url('+rec.get('icon')+')');
		this.el.down('.wrap .provider').update(rec.get('Creator'));
		this.el.down('.wrap .title').update(rec.get('title'));
	},

	setActive: function(el){

	},


	onClick: function(e){
		var t = e.getTarget('[data-view]'),
			viewId = t && t.getAttribute('data-view');

		
		if(!Ext.isEmpty(viewId)){
			if(viewId === 'library'){
				this.stopShowHide.call(this.libraryMenu);
			}

			if(viewId === 'search'){
				return;
			}

			if(this.fireEvent('view-selected', viewId)){
				this.setActive(t);
			}
		}
	},


	stopShowHide: function(){
		clearTimeout(this.showTimeout);
		clearTimeout(this.hideTimeout);
	},


	startHide: function(){
		clearTimeout(this.showTimeout);
		clearTimeout(this.hideTimeout);
		this.hideTimeout = Ext.defer(this.hide, 500, this);
	},

	startShow: function(){
		clearTimeout(this.showTimeout);
		clearTimeout(this.hideTimeout);
		this.showTimeout = Ext.defer(this.show, 500, this);
	},


	onMouseOver: function(e){
		var t = e.getTarget('[data-view]'),
			viewId = t && t.getAttribute('data-view');

		if(!Ext.isEmpty(viewId) || e.getTarget('')){
			if( viewId === 'library'){
				this.startShow.call(this.libraryMenu);
				return;
			}

			if(viewId === 'search'){
				this.startShow.call(this.searchMenu);
			}
		}
	},

	onMouseOut: function(e){
		var t = e.getTarget('[data-view]'),
			viewId= t && t.getAttribute('data-view');

		if(!Ext.isEmpty(viewId)){

			if(viewId === 'library'){
				this.startHide.call(this.libraryMenu);
			}

			if(viewId === 'search'){
				this.startHide.call(this.searchMenu);
			}
		}
	}
});
