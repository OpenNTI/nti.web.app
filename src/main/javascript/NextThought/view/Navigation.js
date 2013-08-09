Ext.define('NextThought.view.Navigation',{
	extend: 'Ext.Component',
	alias: 'widget.main-navigation',
	requires: [
		'NextThought.view.menus.Navigation',
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
		},
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
		}

        if(Ext.is.iPad){
            this.setupTouch();
        }
	},




	initComponent: function(){
		this.callParent(arguments);
		this.items = [];

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

		this.searchMenu = Ext.widget({
				viewId: 'search',
				xtype: 'navigation-menu',
				layout: {type: 'vbox', align: 'stretch'},
				overflowX: 'hidden',
				overflowY: 'hidden',
				cls: 'search-menu',
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
					show: function(m){
						m.down('searchfield').focus(true, true);
					}
				}
			});
		this.items.push(this.searchMenu);
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


	setActive: function(view){
		var id = view && view.id;
		if(!this.el){
			console.trace();console.log('too soon');
			return;
		}

		this.el.select('[data-view]').removeCls('active');
		this.el.select('[data-view="'+id+'"]').addCls('active');
	},


	onClick: function(e){
		var viewId = this.getViewId(e.getTarget('[data-view]'));

		if(!Ext.isEmpty(viewId)){

			if(viewId === 'search'){
				return;
			}

			this.fireEvent('view-selected', viewId);
		}
	},


	onMouseOver: function(e){
		var viewId = this.getViewId(e.getTarget('[data-view]'));
		if(!Ext.isEmpty(viewId)){
			this.ownerCt.down('[viewId="'+viewId+'"]').show();
		}
	},


	onMouseOut: function(e){},


    onClickTouch: function(el){ return this.onClick({getTarget:function(){return el;}}); },
    onMouseOverTouch: function(el){ return this.onMouseOver({getTarget:function(){return el;}}); },
    onMouseOutTouch: function(el){ return this.onMouseOut({getTarget:function(){return el;}}); }
});
