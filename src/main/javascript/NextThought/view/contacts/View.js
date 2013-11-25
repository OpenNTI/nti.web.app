Ext.define('NextThought.view.contacts.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.contacts-view-container',
	requires: [
		'NextThought.view.contacts.SubView'
	],

	title: 'NextThought: Contacts',


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


	updateActiveState: function(type, ntiid) {
		var state = {};
		state['current_' + type] = ntiid;
		this.pushState(state);
	},


	onTabClicked: function(tabSpec) {
		var active = this.layout.getActiveItem(),
				targetView = /^([^\?]+)(\?)?$/.exec(tabSpec.viewId) || [tabSpec.viewId],
				vId = targetView[1],
				needsChanging = vId !== active.id,
		//only reset the view if we are already there and the spec flagged that it can be reset.
				reset = !!targetView[2] && !needsChanging;

		if (Ext.isEmpty(vId)) {
			return false;
		}

		if (needsChanging) {
			this.setActiveTab(vId);
    //			this.pushState({activeTab: vId});
		} else if (reset) {
			console.log('ignore reset');
		}

		return true;
	},

  //	pushState: function(s){
  //		history.pushState({content: s}, this.title, this.getFragment());
  //	},


	getTabs: function() {
		var tabs = this.tabSpecs,
			active = this.layout.getActiveItem(),
			activeId = active && active.id;

		Ext.each(tabs, function(t) {
			t.selected = (t.viewId.replace(/\?$/, '') === activeId);

		});

		return tabs;
	},


	setActiveTab: function(tab) {
		if (this.rendered) {
			this.layout.setActiveItem(tab || 'my-contacts');
			this.setTitle(this.getTitlePrefix());
		} else {
			this.on('afterrender', function() {
				this.layout.setActiveItem(tab);
			}, this);
		}
	},


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


	monitorTabs: function(panel, newTab, oldTab) {
		if (this.restoring) {
			return;
		}
		var state = {};
		state[this.getId()] = {source: newTab.source};
		history.pushState(state, this.title, location.toString());
	},


	restore: function(state) {
		this.fireEvent('finished-restore');

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

