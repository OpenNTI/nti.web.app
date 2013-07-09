Ext.define('NextThought.view.content.reader.Location', {
	alias: 'reader.locationProvider',
	mixins: { observable: 'Ext.util.Observable' },
	requires: [
		'NextThought.Library',
		'NextThought.ContentAPIRegistry',
		'NextThought.view.video.Window',
		'NextThought.util.Content'
	],

	constructor: function(config){
		Ext.apply(this,config);

		this.mixins.observable.constructor.call(this);
		var reader = this.reader;
		reader.on('destroy','destroy',
			reader.relayEvents(this,[
				'beforeNavigate',
				'beginNavigate',
				'navigate',
	            'navigateAbort',
				'navigateComplete',
				'change'
			]));

		reader.fireEvent('uses-page-stores',this);

		Ext.apply(reader,{
			getLocation: Ext.bind(this.getLocation,this),
			getRelated: Ext.bind(this.getRelated,this),
			setLocation: Ext.bind(this.setLocation,this)
		});

		this.callParent(arguments);
	},


	/**
	 *
	 * @param ntiid
	 * @param [callback]
	 * @param [fromHistory]
	 */
	setLocation: function(ntiidOrPageInfo, callback, fromHistory){

		var me = this,
			e = Ext.get('library') || Ext.getBody(),
			ntiid = ntiidOrPageInfo && ntiidOrPageInfo.isPageInfo ? ntiidOrPageInfo.get('NTIID') : ntiidOrPageInfo,
			rootId = ContentUtils.getLineage(ntiid);

		rootId = rootId && rootId.last();

		if(!me.fireEvent('beforeNavigate',ntiid, fromHistory) || me.currentNTIID === ntiid){
			Ext.callback(callback);
			return;
		}

		function finish(a,errorDetails){
			if(finish.called){
				console.warn('finish navigation called twice');
				return;
			}
			var args = Array.prototype.slice.call(arguments), error = (errorDetails||{}).error;

			finish.called = true;

			if(e.isMasked()){
				e.unmask();
			}

			//Give the content time to settle. TODO: find a way to make an event, or prevent this from being called until the content is settled.
			//Ext.defer(Ext.callback,500,Ext,[callback,null,args]);
			Ext.callback(callback,null,args);

			if(fromHistory!==true){
				history.pushState({library:{location: ntiid}}, ContentUtils.findTitle(ntiid,'NextThought'), me.getFragment(ntiid));
			}
			if(error){
				delete me.currentNTIID;
				//Ok no bueno.  The page info request failed.  Ideally whoever
				//initiated this request handles the error  but we aren't really setup for
				//that everywhere. Need to work on error handling.
				console.error('An error occurred from setLocation', errorDetails);
				if( error.status !== undefined && Ext.Ajax.isHTTPErrorCode(error.status)) {
					//We were displaying an alert box here on 403s, but since we don't know why we
					//are being called we shouldn't do that.  I.E. unless the user triggered this action
					//an alert box will just be unexpected and they won't know what to do about it. Until
					//we move the error handling out to the caller the most friendly thing seems to
					//just log the issue and leave the splash showing.
					return;//jslint hates empty blocks
				}
				return;
			}


			//remember last ntiid for this book if it is truthy
			if(ntiid){
				localStorage[rootId] = ntiid;
			}
		}

		if(e.isMasked()){
			console.warn('navigating while busy');
			return;
		}

		if(me.currentNTIID && ntiid !== me.currentNTIID){
			e.mask('Loading...','navigation');
		}

		//make this happen out of this function's flow, so that the mask shows immediately.
		setTimeout(function(){
			if(!me.fireEvent('beginNavigate',ntiid, fromHistory)){
				finish();
				return;
			}

			me.clearPageStore();
			me.resolvePageInfo(ntiidOrPageInfo, finish, Boolean(callback));
		},1);
	},


	getFragment: function(ntiid) {
		var o = ParseUtils.parseNtiid(ntiid);
		return o? o.toURLSuffix() : '';
	},


	resolvePageInfo: function(ntiidOrPageInfo, finish, hasCallback){
		var me = this,
			service = $AppConfig.service;

		function success(pageInfo){
			me.currentPageInfo = pageInfo;
			me.currentNTIID = pageInfo.getId();
			me.fireEvent('navigateComplete', pageInfo, finish, hasCallback);
		}

		function failure(q,r){
			console.error('resolvePageInfo Failure: ',arguments);
            Ext.callback(finish,null,[me,{failure:true,req:q,error:r}]);
			me.fireEvent('navigateAbort',r, ntiidOrPageInfo);
		}

		if(ntiidOrPageInfo.isPageInfo){
			success(ntiidOrPageInfo);
		}
		else{
			service.getPageInfo(ntiidOrPageInfo, success, failure, me);
		}
	},


	getLocation : function(){
		return Ext.apply({
			pageInfo: this.currentPageInfo
		},ContentUtils.getLocation(this.currentNTIID));
	},



	getRelated: function(givenNtiid){
		var me = this,
			ntiid = givenNtiid || me.currentNTIID,
			map = {},
			info = ContentUtils.find(ntiid),
			related = info ? info.location.getElementsByTagName('Related') : null;

		function findIcon(n) {
			return !n ? null : n.getAttribute('icon') || findIcon(n.parentNode) || '';
		}

		Ext.each(related, function(r){
			r = r.firstChild;
			do{
				if(!r.tagName) {
					continue;
				}

				var tag= r.tagName,
					id = r.getAttribute('ntiid'),
					type = r.getAttribute('type'),
					qual = r.getAttribute('qualifier'),

					target = tag==='page' ? ContentUtils.find(id) : null,
					location = target? target.location : null,

					label = location? location.getAttribute('label') : r.getAttribute('title'),
					href = (location || r ).getAttribute('href');

				if(!map[id]){
					if(!info || !info.title){
						console.warn('skipping related item: '+id+' because we could not resolve the ntiid '+ntiid+' to a book');
						return;
					}

					map[id] = {
						id: id,
						type: type,
						label: label,
						href: href,
						qualifier: qual,
						root: info.title.get('root'),
						icon: findIcon(r)
					};
				}
				r = r.nextSibling;
			}
			while( r );

		},this);

		return map;

	},


	relatedItemHandler: function(el){
		var m = el.relatedInfo;

		if(m.type==='index'||m.type==='link') {
			console.log('Resolve the reader');
			//this.setLocation(m.id);
		}
		else if (/http...*/.test(m.href)){
			Ext.widget('window',{
				title: m.label,
				closeAction: 'destroy',
				width: 646,
				height: 396,
				layout: 'fit',
				items: {
					xtype: 'component',
					autoEl: {
						tag: 'iframe',
						src: m.href,
						frameBorder: 0,
						marginWidth: 0,
						marginHeight: 0,
						allowfullscreen: true
					}
				}
			}).show();
		}
		else if(m.type==='video'){
			Ext.widget('widget.video-window', {
				title: m.label,
				modal: true,
				src:[{
					src: getURL(m.root+m.href),
					type: 'video/mp4'
				}]
			}).show();

		}
		else {
			console.error('No handler for type:',m.type, m);
		}
	}


}, function(){
//	ContentAPIRegistry.register('NTIRelatedItemHandler',this.relatedItemHandler,this);
});
