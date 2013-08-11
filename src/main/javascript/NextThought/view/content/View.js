Ext.define( 'NextThought.view.content.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.content-view-container',
	requires: [
		'NextThought.view.reader.Panel',
		'NextThought.view.course.View',
		'NextThought.view.course.dashboard.View',
		'NextThought.view.course.forum.View',
		'NextThought.view.course.info.View'
	],

	layout: {
		type: 'card',
		deferredRender: true
	},
	defaultType: 'box',
	activeItem: 'course-book',

	items:[
		{
			title: 'Dashboard',
			id:'course-dashboard',
			xtype: 'course-dashboard'
		},{
			id:'course-book',
			xtype: 'container',
			layout: {
				type: 'card',
				deferredRender: true
			},
			activeItem: 'main-reader-view',
			items:[{
				xtype: 'course',
				id: 'course-nav'

			},{
				id: 'main-reader-view',
				xtype: 'reader'
			}]
		},{
			title: 'Discussion',
			id:'course-forum',
			xtype: 'course-forum'
		},
		{
			title: 'Course Info',
			id: 'course-info',
			xtype: 'course-info'
		}
	],


	tabSpecs: [
		{label: 'Dashboard', viewId: 'course-dashboard'},
		{label: 'Lessons', viewId: 'course-book?'},
//		{label: 'Assignments', viewId: ''},
		{label: 'Discussions', viewId: 'course-forum'},
//		{label: 'Notebook', viewId: ''},
		{label: 'Course Info', viewId: 'course-info'}
	],


	initComponent: function(){
		this.callParent(arguments);
		this.reader = this.down('reader-content');
		this.courseBook = this.down('#course-book');
		this.courseDashboard = this.down('course-dashboard');
		this.courseForum = this.down('course-forum');
		this.courseNav = this.down('course');
		this.courseInfo = this.down('course-info');

		this.removeCls('make-white');

		this.courseNav.makeListenForCourseChange([
			this.courseDashboard,
			this.courseForum,
			this.courseInfo
		]);

		this.courseNav.mon(this.reader,{'navigateComplete': 'onNavigateComplete'});

		this.mon(this.reader,{
			'navigateComplete': 'onNavigateComplete',
			'beforeNavigate': 'onBeforeNavigate',
			'navigateAbort': 'onNavigationAborted'
		});

		this.mon(this.courseForum,{
			scope: this,
			'set-active-state': 'updateActiveState'
		});

		this.on({
			'switch-to-reader':'switchViewToReader',
			'beforeactivate':'onBeforeActivation',
            'beforedeactivate': 'onBeforeDeActivation',
			'deactivate':'onDeactivated',
			'activate': 'onActivated'
		});
	},

	updateActiveState: function(type,ntiid){
		var state = {};
		state['current_'+type] = ntiid;
		this.pushState(state);
	},


	onTabClicked: function(tabSpec){
		var active = this.layout.getActiveItem(),
			targetView = /^([^\?]+)(\?)?$/.exec(tabSpec.viewId) || [tabSpec.viewId],
			vId = targetView[1],
			needsChanging = vId!==active.id,
			//only reset the view if we are already there and the spec flagged that it can be reset.
			reset = !!targetView[2] && !needsChanging;

		if(Ext.isEmpty(vId)){
			return false;
		}
		
		if(needsChanging){
			this.setActiveTab(vId);
			this.pushState({activeTab: vId});
		} else if(reset) {

			//should build in some smarts about allowing this to toggle through if the views are 'ready'
			active = active.layout.setActiveItem(0);
			if( active ){
				//hack 2 for demo
				try{
					active = active.down('course-outline').getSelectionModel().getSelection()[0];
					if(active){
						this.fireEvent('set-location', active.getId());
					}
				}
				catch(e){
					console.error('error',e);
				}
			}
		}

		return true;
	},

	pushState: function(s){
		history.pushState({content: s}, this.title, this.getFragment());
	},


	getTabs: function(){
		var tabs = this.tabSpecs,
			active = this.layout.getActiveItem().id;

		if(this.tabs){

			if(!this.courseForum.hasBoard){
				tabs = Ext.Array.filter(tabs,function(i){return i.viewId!=='course-forum';});
			}

			if(!this.courseInfo.hasInfo){
				tabs = Ext.Array.filter(tabs,function(i){return i.viewId!=='course-info';});
			}

		}

		Ext.each(tabs,function(t){
			t.selected = (t.viewId.replace(/\?$/,'')===active);
		});

		return this.tabs? tabs : [];
	},


	onBeforeActivation: function(){
		if(this.reader.activating){
			this.reader.activating();
		}
	},


	onDeactivated: function(){
		var CQ = Ext.ComponentQuery,
			needsClosing = []
					.concat(CQ.query('slidedeck-view'))
					.concat(CQ.query('note-window'));

		Ext.Array.map(needsClosing,function(c){c.destroy();});

		var active = this.getLayout().getActiveItem();
		if(active){
			active.fireEvent('deactivate', this);
		}
	},


	onNavigationAborted: function(resp, ntiid) {
		if(this.fireEvent('navigation-failed', this, ntiid, resp) !== false){
			this.courseBook.layout.setActiveItem('main-reader-view');
			this.reader.setSplash();
			this.reader.relayout();
			this.down('content-toolbar').hide();
			this.down('content-page-widgets').hide();
		}
	},


    onBeforeDeActivation: function(){
        // NOTE: we should probably fire this event for all the children of this view,
        // since one could have the editor active (in which case we would want to display appropriate warning).
        // For now, it seems like the reader should be notified and we will add others if we find it necessary.
		var result = true;
        result = this.reader.fireEvent('beforedeactivate', this);
		if(result){
			var active = this.getLayout().getActiveItem();
			if(active){
				result = active.fireEvent('beforedeactivate', this);
			}
		}
		return result;
    },


	onActivated: function(){
		var active = this.getLayout().getActiveItem();
		if(active){
			active.fireEvent('activate', this);
		}
	},


	onBeforeNavigate: function(ntiid, fromHistory){
		if(!fromHistory){
			if(this.activate(true) === false){
				return false;
			}
		}
		if(this.reader.iframeReady){
			return true;
		}

		this.reader.ntiidOnFrameReady = ntiid;
		return false;
	},


	onNavigateComplete: function(pageInfo,cb,userInitiatedNav){
		if(!pageInfo || !pageInfo.isModel){return;}

		this.tabs = pageInfo.isPartOfCourse();
		this.fireEvent('update-tabs',this);

		if(userInitiatedNav || !this.tabs){
			try {
				this.getLayout().setActiveItem(this.courseBook);
			}catch(e){
				console.warn(e.stack || e.message);
			}
		}

		this.courseBook.getLayout().setActiveItem(pageInfo.isPartOfCourseNav()?'course-nav':'main-reader-view');

		var l = ContentUtils.getLocation(pageInfo),
			toc;


		this.down('content-toolbar').show();

		this.locationTitle = ContentUtils.findTitle(pageInfo.getId(),'NextThought');
		this.setTitle(this.getTitlePrefix()+this.locationTitle);




		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
		}

		if(toc){
			this.backgroundUrl = getURL(toc.getAttribute('background'), l.root);
			if(this.isActive()){
				this.updateBackground();
			}
		}
	},


	getTitlePrefix: function(){
		var prefix = this.getLayout().getActiveItem().title || '';
		if(!Ext.isEmpty(prefix)){
			prefix += ' - ';
		}
		return prefix;
	},


	switchViewToReader: function(){
		this.courseBook.layout.setActiveItem('main-reader-view');
	},


	setActiveTab: function(tab){
		if(this.rendered) {
			this.layout.setActiveItem(tab||'course-book');
			this.setTitle(this.getTitlePrefix()+this.locationTitle);
		} else {
			this.on('afterrender', function(){
				this.layout.setActiveItem(tab);
			}, this);
		}
	},


	restore: function(state){
		var ntiid = state.content.location,
			tab = state.content.activeTab,
			topic = state.content.current_topic,
			forum = state.content.current_forum;
			
		try{
			this.setActiveTab((tab === 'null')? null : tab);
			if(!ntiid){
				console.warn('There was no ntiid to restore!');
				return;
			}

			this.courseForum.restoreState(forum, topic);

			this.reader.setLocation(ntiid,null,true);
			this.up('master-view').down('library-collection').updateSelection(ntiid,true);
		}
		catch(e){
			console.error(e.message,'\n\n',e.stack|| e.stacktrace || e,'\n\n');
		}
		finally{
			this.fireEvent('finished-restore');
		}
	},


	activate: function(){
		var res = this.callParent(arguments);
		if(res){
			this.reader.relayout();
		}
		return res;
	},


	getFragment: function(){
		var o;

		if(this.layout.getActiveItem().id === 'course-book'){
			o = ParseUtils.parseNTIID(this.reader.getLocation().NTIID);
		}
		return o? o.toURLSuffix() : location.pathname;
	}
});
