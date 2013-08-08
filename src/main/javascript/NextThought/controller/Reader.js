/**
 * This controller is intended to provide instrumentation to the reader.  The messy singletons will need to be migrated
 * into this controller and deprecated.
 */
Ext.define('NextThought.controller.Reader', {
	extend: 'Ext.app.Controller',


	models: [
		'PageInfo',
		'course.navigation.Node'
	],


	stores: [
		'course.Navigation'
	],


	views: [
		'cards.Card',
		'content.Navigation',
		'content.Pager',
		'content.PageWidgets',
		'content.Reader',
		'content.Toolbar'
	],


	refs: [
		{ref: 'mainNav', selector: 'main-navigation'},
		{ref: 'libraryView', selector: 'library-view-container'},
		{ref: 'libraryNavigation', selector: 'library-view-container content-toolbar content-navigation'},
		{ref: 'libraryPager', selector: 'library-view-container content-toolbar content-pager'},
		{ref: 'libraryPageWidgets', selector: 'library-view-container content-page-widgets'},
		{ref: 'libraryReader', selector: 'library-view-container reader-content'}
	],


	init: function() {
		this.listen({
			controller:{
				'*':{
					'set-location':'setLocation',
					'set-last-location-or-root':'setLastLocation',
					'bookmark-loaded': 'onBookmark'
				}
			},
			store: {
				'*':{
					'bookmark-loaded': 'onBookmark'
				}
			},
			component:{
				'*':{
					'set-location':'setLocation',
					'set-last-location-or-root':'setLastLocation',
					'suspend-annotation-manager': 'suspendManager',
					'resume-annotation-manager': 'resumeManager'
				},
				'library-view-container reader-content':{
					'beforeNavigate':'beforeSetLocation',
					'navigateCanceled':'resetNavigationMenuBar',
					'set-content':'updateLibraryControls',
					'page-previous':'goPagePrevious',
					'page-next':'goPageNext'
				},
				'content-card':{
					'show-target':'showCardTarget'
				},

				'note-window':{
					'before-new-note-viewer':'maybeSwitchLibrarySubTabs'
				}
			}
		});
	},


	resumeManager: function(){
		var reader = this.getLibraryReader();
		reader.getAnnotations().getManager().resume();
	},


	suspendManager: function(){
		var reader = this.getLibraryReader();
		reader.getAnnotations().getManager().suspend();
	},


	beforeSetLocation: function(){
		var canNav = true,
			n = Ext.ComponentQuery.query('note-window')||[];

		try{
			Ext.each(n,function(note){ note.closeOrDie(); });
		}
		catch(e){
			canNav = false;
		}

		return canNav;
	},


	resetNavigationMenuBar: function(ntiidCancled, isCurrent, fromHistory){
		if(!isCurrent && !fromHistory){
			console.debug('reset?',arguments);
			this.getMainNav().updateCurrent(true);
		}
	},


	setLocation: function(){
		var r = this.getLibraryReader();

		if(this.fireEvent('show-view','library',true)===false){
			return;
		}

		if(!r.ntiidOnFrameReady ){
			r.setLocation.apply(r,arguments);
		}
		else {
			r.ntiidOnFrameReady = Array.prototype.slice.call(arguments);
		}
	},


	setLastLocation: function(ntiid, callback, silent){
		var lastNtiid = localStorage[ntiid] || ntiid;
		if(!ParseUtils.parseNtiid(lastNtiid)){
			lastNtiid = ntiid;
		}


		function call(a, errorDetails){
			var error = (errorDetails||{}).error;
			if(error && error.status !== undefined && Ext.Ajax.isHTTPErrorCode(error.status)) {
				delete localStorage[ntiid];
			}
			
			if( Ext.isFunction(callback) ){
				Ext.callback(callback,null,[ntiid,a,error]);
			}
		}

		this.setLocation(lastNtiid, call, silent===true);
	},


	goPagePrevious: function(){
		this.getLibraryPager().goPrev();
	},


	goPageNext: function(){
		this.getLibraryPager().goNext();
	},


	showCardTarget: function(card, data, silent, callback){
		var reader = card.up('reader-content')||ReaderPanel.get(),//for now, lets just get the default reader.
			ntiid = data.ntiid,
			postfix = data.notTarget ? '' : '-target',
			DH = Ext.DomHelper,
			s = encodeURIComponent('Pages('+ntiid+')'),
			u = encodeURIComponent($AppConfig.username),
		//Hack...
			pi = this.getPageInfoModel().create({
				ID: ntiid,
				NTIID: ntiid,
				content: DH.markup([
					{tag:'head',cn:[
						{tag:'title', html: data.title},
						{tag:'meta', name:'icon', content:data.thumbnail}
					]},
					{tag:'body',cn:{
						cls:'page-contents no-padding',
						cn:Ext.applyIf({
							tag: 'object',
							cls: 'nticard'+postfix,
							type: 'application/vnd.nextthought.nticard'+postfix,
							'data-ntiid': ntiid,
							html: DH.markup([
								{tag:'img', src:data.thumbnail},
								{tag:'span', cls:'description', html: data.description}
							])
						},data.asDomSpec())
					}}
				]),
				Links:[
					{
						Class: 'Link',
						href: '/dataserver2/users/'+u+'/'+s+'/UserGeneratedData',
						rel: 'UserGeneratedData'
					}
				]
			});

		pi.contentOrig = reader.getLocation().NTIID;
		pi.hideControls = true;

		reader.setLocation(pi, callback, !!silent);
	},


	onBookmark: function(rec){
		try{
			this.getLibraryPageWidgets().onBookmark(rec);
		}
		catch(e){
			console.error(e.stack||e.message);
		}
	},


	updateLibraryControls: function(reader, doc, assesments, pageInfo){
		var fn = (pageInfo && pageInfo.hideControls)? 'hideControls':'showControls',
			pg = this.getLibraryPager(),
			lm = Ext.ComponentQuery.query('library-collection'),
			pw = this.getLibraryPageWidgets(),
			origin = pageInfo && pageInfo.contentOrig,
			t = pageInfo && pageInfo.get('NTIID');

		pg[fn]();
		pw[fn]();

		pw.clearBookmark();
		pg.updateState(t);
		Ext.each(lm,function(m){ m.updateSelection(t,true, true); });

		//If there is no origin, we treat this as normal. (Read the location from the location provder) The origin is
		// to direct the navbar to use the origins' id instead of the current one (because we know th current one will
		// not resolve from our library... its a card)
		this.getLibraryNavigation().updateLocation(origin||t);
	},


	maybeSwitchLibrarySubTabs: function(viwer, ownerCmp){
		var view = this.getLibraryView(),
			subView;
		if(ownerCmp !== this.getLibraryReader()){
			//this event doen't concern us.
			return true;
		}

		if(this.fireEvent('show-view','library',true)===false){
			return false;
		}

		subView = view.down('course-book');
		view.setActiveTab(subView);
	}

});
