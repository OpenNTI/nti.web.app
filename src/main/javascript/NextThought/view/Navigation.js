Ext.define('NextThought.view.Navigation',{
	extend: 'Ext.Component',
	alias: 'widget.main-navigation',
	requires: [
		'NextThought.view.menus.Navigation',
        'NextThought.view.menus.MostRecentContent',
		'NextThought.view.library.Collection',
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
		{cn:[
			{ cls: 'branding' },
			{
				'data-view': 'content',
				'data-qtip':'Content',
				cls: 'content x-menu',
				cn:[
					{cls:'box'},
					{ cls: 'image' },
					{
						cls: 'wrap',
						cn:[
							{ cls: 'provider'},
							{ cls: 'title'}
						]
					}
				]
			}
		]},
		{ cls: 'library', 'data-qtip':'Library', 'data-view':'library', cn:[{cls:'box'}]},
		{ cls: 'forums', 'data-qtip':'Forums', 'data-view': 'forums', cn:[{cls:'box'}] },
		{ cls: 'contacts', 'data-qtip':'Contacts','data-view': 'contacts', cn:[{cls:'box'}] },
		{ cls: 'search x-menu', 'data-qtip':'Search','data-view': 'search', cn:[{cls:'box'}] }
	]),

	renderSelectors:{
		imgEl: '.content .image',
		providerEl: '.content .wrap .provider',
		titleEl: '.content .wrap .title'
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

		if(!isFeature('new-library')){
			this.el.down('.library').remove();
		} else {
			this.contentSwitcher = Ext.widget({
				viewId: 'content',
				xtype: 'most-recent-content-switcher',
				ownerNode: this.el.down('.content')
			});
			this.items.push(this.contentSwitcher);
		}



		this.searchMenu = Ext.widget({
			viewId: 'search',
			xtype: 'navigation-menu',
			layout: {type: 'vbox', align: 'stretch'},
			overflowX: 'hidden',
			overflowY: 'hidden',
			cls: 'search-menu',
			containerNode: this.el,
			ownerNode: this.el.down('.search'),
			items:[
				{ xtype: 'searchfield' },
				{
					xtype: 'container',
					autoScroll: true,
					id: 'search-results',
					hideMode: 'display',
					flex: 1
				}
			],
			listeners:{
				hide: function(){
					if(this.reactivate && this.ownerNode.hasCls('active')){
						this.ownerNode.removeCls('active');
						this.reactivate.addCls('active');
					}
				},
				show: function(m){
					this.reactivate = this.containerNode.down('.active').removeCls('active');
					this.ownerNode.addCls('active');
					m.down('searchfield').focus(true, true);
				}
			}
		});

	this.items.push(this.searchMenu);

        if(Ext.is.iPad){
            this.setupTouch();
        }
	},




	initComponent: function(){
		this.callParent(arguments);
		this.items = [];
		this.timers = {};

		if(!isFeature('new-library')){
			this.libraryMenu = Ext.widget({
				viewId: 'content',
				xtype: 'navigation-menu',
				renderTo: Ext.getBody(),
				items:[{
					courseList:true,
					xtype:'library-collection', name: 'Courses',
					store: 'courses',
					hidden: true
				},{
					xtype:'library-collection', name: 'All Books'
				}]
			});
			Library.on('show-courses',function(){
					this.libraryMenu.child('[courseList]').show(); },this);

			this.items.push(this.libraryMenu);
		}
	},


	getViewId: function(el){
        var e = Ext.get(el),
		    attr = 'data-view',
		    q = '['+attr+']',
            viewId = e && e.getAttribute(attr);

        if(Ext.isEmpty(viewId)){
            e = e && (e.down(q) || e.up(q));
            viewId = e && e.getAttribute(attr);
        }

        return viewId;
    },


    setupTouch: function(){

        this.buildModule('modules', 'touchSender');

        var container = this;

        container.on('touchTap', function(el) {
            console.log('touchTapped');
            this.onClickTouch(el);

        });

        container.on('touchElementAt', function(x, y, callback){
            var element = document.elementFromPoint(x, y);
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


	track: function(rec, pop){
		if( pop ){
			rec = this.currentRecord = this.recordHistory.pop();
			return rec;
		}

		if(this.currentRecord){
			this.recordHistory.push(this.currentRecord);
			if(this.recordHistory.length>5){
				this.recordHistory.shift();
			}
		}

		if( this.contentSwitcher ){
			this.contentSwitcher.track(rec);
		}

		this.currentRecord = rec;
		return rec;
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

		rec = this.track(rec,pop===true);

		if(!rec){ console.error("No record attached"); return; }

		this.imgEl.removeCls(cls);

		this.imgEl[rec.get('isCourse')?'removeCls':'addCls'](cls);

		this.imgEl.setStyle('background-image', 'url('+rec.get('icon')+')');
		this.providerEl.update(rec.get('courseName')||rec.get('Creator'));
		this.titleEl.update(rec.get('title'));
	},


	setActive: function(view){
		var id = view && view.id;
		if(!this.el){
			console.trace();console.log('too soon');
			return;
		}

		this.el.select('[data-view]').removeCls('active');
		this.el.select('[data-view="'+id+'"]').addCls('active');
	},


	maybeStopTimer: function(viewId){
		var el = this.el.down('.active');
		if(el && el.getAttribute('data-view')===viewId){
			return;
		}

		clearTimeout(this.timers[viewId]);
	},


	onClick: function(e){
		var viewId = this.getViewId(e.getTarget('[data-view]'));

		if(!Ext.isEmpty(viewId)){
			if(viewId === 'search'){
				return this.onMouseOver(e);
			}

			this.maybeStopTimer(viewId);

			this.fireEvent('view-selected', viewId);
		}

		return true;
	},


	onMouseOver: function(e){
		var viewId = this.getViewId(e.getTarget('[data-view]')),
			menu, hideTimer, handlers;
		if(!Ext.isEmpty(viewId)){
			clearTimeout(this.timers[viewId]);
			menu = this.ownerCt.down('[viewId="'+viewId+'"]');
			if( menu ){
				this.timers[viewId] = Ext.defer(menu.show,500,menu);
				handlers = this.mon(menu,{
					destroyable: true,
					single: true,
					'show':function(){hideTimer = Ext.defer(menu.hide,1500,menu);},
					'mouseover':function(){clearTimeout(hideTimer);},
					'hide':function(){handlers.destroy();}
				});
			}
		}
	},


	onMouseOut: function(e){
		var viewId = this.getViewId(e.getTarget('[data-view]'));
		if(!Ext.isEmpty(viewId)){
			clearTimeout(this.timers[viewId]);
			delete this.timers[viewId];
		}
	},


    onClickTouch: function(el){ return this.onClick({getTarget:function(){return el;}}); },
    onMouseOverTouch: function(el){ return this.onMouseOver({getTarget:function(){return el;}}); },
    onMouseOutTouch: function(el){ return this.onMouseOut({getTarget:function(){return el;}}); }
});
