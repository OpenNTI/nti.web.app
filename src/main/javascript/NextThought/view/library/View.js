Ext.define( 'NextThought.view.library.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.library-view-container',
	requires: [
		'NextThought.view.reader.Panel',
		'NextThought.view.course.View',
		'NextThought.view.course.dashboard.View',
		'NextThought.view.course.forum.View'
	],

	layout: {
		type: 'card',
		deferredRender: true
	},
	defaultType: 'box',
	activeItem: 'course-book',

	items:[
		{
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
			id:'course-forum',
			xtype: 'course-forum'
		}
	],


	tabSpecs: [
		{label: 'Dashboard', viewId: 'course-dashboard'},
		{label: 'Lessons', viewId: 'course-book?', selected:true},
//		{label: 'Assignments', viewId: ''},
		{label: 'Discussions', viewId: 'course-forum'},
//		{label: 'Notebook', viewId: ''},
		{label: 'Course Info', viewId: ''}
	],


	initComponent: function(){
		this.callParent(arguments);
		this.reader = this.down('reader-content');
		this.courseBook = this.down('#course-book');
		this.courseDashboard = this.down('course-dashboard');
		this.courseForum = this.down('course-forum');
		this.courseNav = this.down('course');

		this.removeCls('make-white');

		this.courseNav.makeListenForCourseChange([
			this.courseDashboard,
			this.courseForum
		]);

		this.courseNav.mon(this.reader,{'navigateComplete': 'onNavigateComplete'});

		this.mon(this.reader,{
			'navigateComplete': 'onNavigateComplete',
			'beforeNavigate': 'onBeforeNavigate',
			'navigateAbort': 'onNavigationAborted'
		});

		this.on({
			'switch-to-reader':'switchViewToReader',
			'beforeactivate':'onBeforeActivation',
			'deactivate':'onDeactivated'
		});
	},


	onTabClicked: function(tabSpec){
		var l = this.layout,
			active = l.getActiveItem(),
			targetView = /^([^\?]+)(\?)?$/.exec(tabSpec.viewId) || [tabSpec.viewId],
			vId = targetView[1],
			needsChanging = vId!==active.id,
			//only reset the view if we are already there and the spec flagged that it can be reset.
			reset = !!targetView[2] && !needsChanging;

		if(Ext.isEmpty(vId)){
			return false;
		}

		if(needsChanging){
			l.setActiveItem(vId);
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


	getTabs: function(){
		return this.tabs? this.tabSpecs : [];
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


	onBeforeNavigate: function(ntiid, fromHistory){
		this.tabs = false;
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


	onNavigateComplete: function(pageInfo){
		if(!pageInfo || !pageInfo.isModel){return;}

		this.tabs = pageInfo.isPartOfCourse();
		this.fireEvent('update-tabs',this);

		this.courseBook.layout.setActiveItem(pageInfo.isPartOfCourseNav()?'course-nav':'main-reader-view');

		this.down('content-toolbar').show();
		this.setTitle(ContentUtils.findTitle(pageInfo.getId(),'NextThought'));

		var l = ContentUtils.getLocation(pageInfo),
			toc;


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


	switchViewToReader: function(){
		this.courseBook.layout.setActiveItem('main-reader-view');
	},


	restore: function(state){
		var ntiid = state.library.location;

		try{
			if(!ntiid){
				console.warn('There was no ntiid to restore!');
				return;
			}
			this.reader.setLocation(ntiid,null,true);
			if(this.reader.ntiidOnFrameReady){
				this.up('master-view').down('library-collection').updateSelection(ntiid,true);
			}
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
		var o = ParseUtils.parseNtiid(this.reader.getLocation().NTIID);
		return o? o.toURLSuffix() : null;
	}
});
