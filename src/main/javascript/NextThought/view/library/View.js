Ext.define('NextThought.view.library.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.library-view-container',

	requires:[
		'NextThought.view.library.Branding',
        'NextThought.modules.TouchSender',
        'NextThought.modules.TouchHandler'
	],

    mixins:[
        'NextThought.mixins.ModuleContainer'
    ],

	cls: 'library-view',
	layout: 'auto',

	items:[{
		cls: 'branding',
		xtype: 'library-branding-box'
	},{
		ui: 'library-collection',
		cls: 'courses',
		courseList:true,
		xtype:'library-collection',
		name: getString('My Courses'),
		store: 'courses',
		hidden: true,
		listeners:{
			'itemadd': 'updateCount',
			'itemremove': 'updateCount'
		},
		xhooks:{
			updateCount: function(){
				if(this.rendered && this.el.down('.count')){
					this.el.down('.count').update(this.store.getCount());
				}
			}
		}
	},{
		ui: 'library-collection',
		cls: 'books',
		hidden: true,
		bookList:true,
		xtype:'library-collection',
		name: getString('My Books')
	}],


	initComponent: function(){
		this.callParent(arguments);
		this.removeCls('make-white');
		this.mon(Library,{
			'show-courses':'showCourses',
			'hide-courses':'hideCourses',
			'show-books':'showBooks',
			'hide-books':'hideBooks'
		});

        this.buildModule('modules', 'touchSender');
        this.buildModule('modules', 'touchHandler', {getPanel: function(){
            return this.container.getEl();
        }});
	},


	showCourses: function(){ this.down('[courseList]').show(); },
	hideCourses: function(){ this.down('[courseList]').hide(); },
	showBooks: function(){ this.down('[bookList]').show(); },
	hideBooks: function(){ this.down('[bookList]').hide(); },


	restore: function(state){ this.fireEvent('finished-restore'); }
});
