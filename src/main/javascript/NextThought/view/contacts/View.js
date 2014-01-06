Ext.define('NextThought.view.contacts.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.contacts-view-container',
	requires: [
		'NextThought.view.contacts.SubView'
	],

	title: 'NextThought: Contacts',
	defaultTab: 'my-contacts',

	items: [
		{ xtype: 'contact-tab-view', id: 'my-contacts', bodyCls: 'make-white', outlineLabel: 'Contacts' },
		{ xtype: 'contact-tab-view', id: 'my-groups',
			subType: 'group',
			filterFn: function(group) { return group.hidden !== true && group.isDFL; }
		},
		{ xtype: 'contact-tab-view', id: 'my-lists',
			subType: 'list',
			filterFn: function(group) { return group.hidden !== true && !group.isDFL; }
		}
	],

	layout: {
		type: 'card',
		deferredRender: true
	},

	defaultType: 'box',
	activeItem: 0,


	tabSpecs: [
		{label: 'Contacts', viewId: 'my-contacts'},
		{label: 'Groups', viewId: 'my-groups'},
		{label: 'Distribution Lists', viewId: 'my-lists'}
	],


	getTitlePrefix: function() {
		return 'NextThought: Contacts';
	},


	initComponent: function() {
		var me = this;

		me.callParent(arguments);
    //		me.tabs = me.down('contacts-tabs');
    //		me.mon(me.tabs, 'tabchange', me.monitorTabs, me);
    //		me.on('resize', function () {
    //			me.tabs.setHeight(me.getHeight());
    //		});

		this.removeCls('make-white');


		//		this.on({
		//			'beforeactivate':'onBeforeActivation',
		//            'beforedeactivate': 'onBeforeDeActivation',
		//			'deactivate':'onDeactivated',
		//			'activate': 'onActivated'
		//		});

        if(Ext.is.iOS){
            this.on('afterrender', function(){
                var outline = this.el.down('.contact:nth-child(1)'),
                    list = this.el.down('.contact:nth-child(2)'),
                    input = this.el.down('input'),
                    me = this;

                Ext.defer(function(){
                    me.outlineY = outline.getY();
                    me.outlineHeight = outline.getHeight();
                },100,this);

                //For keyboard, reduce height and adjust position of elements to fit within smaller screen
                input.on('focus', function(){
                    Ext.defer(function(){
                        if(window.innerHeight < 600){
                            outline.setHeight(window.innerHeight - 15);
                            outline.setY(window.outerHeight - window.innerHeight);
                            list.setY(window.outerHeight - window.innerHeight);
                            list.setHeight(window.innerHeight - 15);
                            me.keyboardUpScrollY = window.scrollY;
                        }
                    },250, this);
                });

                //Undo resizing and repositioning when keyboard dismissed
                input.on('blur', function(){
                    if(this.outlineY){
                        outline.setY(me.outlineY);
                        outline.setHeight(me.outlineHeight);
                        list.setY(me.outlineY);
                        list.setHeight(me.outlineHeight);
                        me.keyboardUpScrollY = false;
                    }
                }, this);

                //Keep from permanently scrolling content off viewable area
                window.onscroll = function(){
                    if(!me.keyboardUpScrollY){
                        return;
                    }
                    if(window.scrollY != me.keyboardUpScrollY){
                        window.scrollTo(0,me.keyboardUpScrollY);
                    }
                };

            });
        }
	},


	restore: function(state) {
		var promise = new Promise();
		promise.fulfill();
		return promise;

    //		var myState = state[this.getId()], tab;
    //		if (myState && myState.source) {
    //			tab = this.down('[source="' + myState.source + '"]');
    //			this.restoring = true;
    //			this.tabs.setActiveTab(tab);
    //			delete this.restoring;
    //			this.updateLayout();
    //		}
	}
});

