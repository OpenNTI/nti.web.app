Ext.define('NextThought.view.Navigation',{
	extend: 'Ext.Component',
	alias: 'widget.main-navigation',
	requires: [
		'NextThought.view.menus.Navigation',
		'NextThought.view.library.menus.Collection',
        'NextThought.modules.TouchSender'
	],

    mixins: [
        'NextThought.mixins.ModuleContainer'
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

	recordHistory: [],

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

    touchLibraryOpen: false,


	afterRender: function(){
		this.callParent(arguments);
		if(!$AppConfig.service.canHaveForum()){
			this.el.down('.forums').remove();
		}

		if(!$AppConfig.service.canShare()){
			this.el.down('.contacts').remove();
		}

        if(Ext.is.iPad){
            this.setupTouch();
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

		this.items = [
			this.libraryMenu,
			this.searchMenu
		];

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

    setupTouch: function(){

        this.buildModule('modules', 'touchSender');

        var container = this;

        container.on('touchTap', function(ele) {
            console.log('touchTapped');
            this.onClickTouch(ele);

        });

        container.on('touchElementAt', function(x, y, callback){
            var element = Ext.getDoc().dom.elementFromPoint(x, y);
            callback(element);
        });

        container.on('touchLongPress', function(ele, pageX, pageY){

            if(this.touchLibraryOpen){
                this.touchLibraryOpen = false;
                this.onMouseOutTouch(ele);
            }
            else{
                this.touchLibraryOpen = true;
                this.onMouseOverTouch(ele);
            }

        });

    },

	showCoursesCollection: function(){
		this.libraryMenu.child('[courseList]').show();
	},


	getRefItems: function(deep){
		var items = this.items,
	        len = items.length,
	        i = 0,
	        item,
	        result = [];

	    for (i; i < len; i++) {
	        item = items[i];
	        result.push(item);
	        if (deep && item.getRefItems) {
	            result.push.apply(result, item.getRefItems(true));
	        }
	    }

		return result;
	},


	updateCurrent: function(pop, rec){
		var cls = 'is-book';

		if(pop!==true){
			if(this.currentRecord){
				this.recordHistory.push(this.currentRecord);
				if(this.recordHistory.length>5){
					this.recordHistory.shift();
				}
			}
		}
		else {
			rec = this.recordHistory.pop();
		}

		this.currentRecord = rec;

		if(!rec){ console.error("No record attached"); return; }

		this.imgEl.removeCls(cls);

		this.imgEl[rec.get('isCourse')?'removeCls':'addCls'](cls);

		this.imgEl.setStyle('background-image', 'url('+rec.get('icon')+')');
		this.providerEl.update(rec.get('Creator'));
		this.titleEl.update(rec.get('title'));
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

    onClickTouch: function(ele){
        var viewId = this.getViewId(ele);

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

    getViewId: function(ele){
        var e = Ext.get(ele),
            t = e,
            viewId = e.getAttribute('data-view');

        if(Ext.isEmpty(viewId)){
            t = e.down('[data-view]');
        }

        if(!t){
            t = e.up('[data-view]');
        }

        viewId = t && t.getAttribute('data-view');
        return viewId;
    },

    onMouseOverTouch: function(ele){
        var viewId = this.getViewId(ele);

        if(!Ext.isEmpty(viewId)){
            if( viewId === 'library'){
                console.log("library");
                this.startShow.call(this.libraryMenu);
                return;
            }

            if(viewId === 'search'){
                console.log("search");
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
	},

    onMouseOutTouch: function(ele){
        var viewId = this.getViewId(ele);

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
