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
			cls: 'library x-menu',
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
		{ cls: 'search x-menu', 'data-qtip':'Search','data-view': 'search' }
	]),

	renderSelectors:{
		imgEl: '.library .image',
		providerEl: '.library .wrap .provider',
		titleEl: '.library .wrap .title'
	},

	searchMenu: {
		xtype: 'navigation-menu',
		layout: {type: 'vbox', align: 'stretch'},
		overflowX: 'hidden',
		overflowY: 'hidden',
		cls: 'search-menu',
		items:[
			{ xtype: 'searchfield' },
			{ 
				xtype: 'container',
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




	afterRender: function(){
		this.callParent(arguments);
		if(!$AppConfig.service.canHaveForum()){
			this.el.down('.forums').remove();
		}

		if(!$AppConfig.service.canShare()){
			this.el.down('.contacts').remove();
		}
	},




	initComponent: function(){
		this.callParent(arguments);
		this.libraryMenu = Ext.widget({
			xtype: 'navigation-menu',
			renderTo: Ext.getBody(),
			items:[{
				courseList:true,
				xtype:'library-collection', name: 'Courses',
				store: 'courses',
				hidden: true,
				listeners:{
					scope: this,
					select:'updateCurrent'
				   }
				},{
				xtype:'library-collection', name: 'All Books', 
				listeners:{
					scope: this, 
					select:'updateCurrent'
			   }
			}],
			listeners:{
				scope: null, //execute from the context of the widget
				hide: this.stopShowHide,
				show: this.stopShowHide
			}
		});

		this.searchMenu = Ext.widget(this.searchMenu);

		Library.on('show-courses','showCoursesCollection',this);

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


	showCoursesCollection: function(){
		this.libraryMenu.child('[courseList]').show();
	},


	getRefItems: Ext.container.Container.prototype.getRefItems,


	updateCurrent: function(s, rec){
		var cls = 'is-book';

		if(!rec){ console.error("No record attached"); return; }

		this.imgEl.removeCls(cls);

		this.imgEl[rec.get('isCourse')?'removeCls':'addCls'](cls);

		this.imgEl.setStyle('background-image', 'url('+rec.get('icon')+')');
		this.providerEl.update(rec.get('Creator'));
		this.titleEl.update(rec.get('title'));
	},

	setActive: function(el){
		this.el.select('[data-view]').removeCls('active');
		Ext.get(el).addCls('active');
	},


	onClick: function(e){
		var t = e.getTarget('[data-view]',null,true),
			viewId = t && t.getAttribute('data-view');

		
		if(!Ext.isEmpty(viewId)){
			if(viewId === 'library'){
				this.stopShowHide.call(this.libraryMenu);
				if(t.hasCls('active')){
					this.libraryMenu[this.libraryMenu.isVisible()?'hide':'show']();
				}
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
