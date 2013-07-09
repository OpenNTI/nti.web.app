/**
 * This controller is intended to provide instrumentation to the reader.  The messy singletons will need to be migrated
 * into this controller and deprecated.
 */
Ext.define('NextThought.controller.Reader', {
	extend: 'Ext.app.Controller',


	models: [
		'PageInfo'
	],


	stores: [],


	views: [
		'cards.Card',
		'content.Navigation',
		'content.Pager',
		'content.PageWidgets',
		'content.Reader',
		'content.Toolbar'
	],


	refs: [
		{ref: 'libraryMenu', selector: 'library-collection'},
		{ref: 'libraryNavigation', selector: 'library-view-container content-toolbar content-navigation'},
		{ref: 'libraryPager', selector: 'library-view-container content-toolbar content-pager'},
		{ref: 'libraryPageWidgets', selector: 'library-view-container content-page-widgets'},
		{ref: 'libraryReader', selector: 'library-view-container reader-panel'}
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
					'set-last-location-or-root':'setLastLocation'
				},
				'library-view-container reader-panel':{
					'beforeNavigate':'beforeSetLocation',
					'set-content':'updateLibraryControls',
					'page-previous':'goPagePrevious',
					'page-next':'goPageNext'
				},
				'content-card':{
					'show-target':'showCardTarget'
				}
			}
		});
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


	setLastLocation: function(ntiid){
		var lastNtiid = localStorage[ntiid] || ntiid;
		if(!ParseUtils.parseNtiid(lastNtiid)){
			lastNtiid = ntiid;
		}

		function callback(a, errorDetails){
			var error = (errorDetails||{}).error;
			if(error && error.status !== undefined && Ext.Ajax.isHTTPErrorCode(error.status)) {
				delete localStorage[ntiid];
			}
		}

		this.setLocation(lastNtiid, callback);
	},


	goPagePrevious: function(){
		this.getLibraryPager().goPrev();
	},


	goPageNext: function(){
		this.getLibraryPager().goNext();
	},


	showCardTarget: function(card, data, silent){
		var reader = card.up('reader-panel'),
			ntiid = data.ntiid,
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
							cls: 'nticard-target',
							type: 'application/vnd.nextthought.nticard-target',
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

		reader.setLocation(pi, null, !!silent);
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
			lm = this.getLibraryMenu(),
			pw = this.getLibraryPageWidgets(),
			origin = pageInfo && pageInfo.contentOrig,
			t = pageInfo && pageInfo.get('NTIID');

		pg[fn]();
		pw[fn]();

		pw.clearBookmark();
		pg.updateState(t);
		lm.updateSelection(t,true);

		//If there is no origin, we treat this as normal. (Read the location from the location provder) The origin is
		// to direct the navbar to use the origins' id instead of the current one (because we know th current one will
		// not resolve from our library... its a card)
		this.getLibraryNavigation().updateLocation(origin||t);
	}

});
