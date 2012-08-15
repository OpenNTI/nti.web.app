Ext.define('NextThought.providers.Location', {
	singleton: true,
	mixins: { observable: 'Ext.util.Observable' },
	requires: [
		'NextThought.Library',
		'NextThought.view.video.Window'
	],

	constructor: function(){
		this.addEvents({
			navigate: true,
			navigateComplete: true,
			change : true,
			changed : true
		});

		Ext.apply(this,{
			currentNTIID: null,
			timers: {},
			cache: {}
		});


		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
	},


	getStoreId: function(ntiid){
		return 'page-store:'+(ntiid||this.currentNTIID);
	},


	getStore: function(ntiid){
		return Ext.getStore(this.getStoreId(ntiid));
	},


	/**
	 *
	 * @param ntiid
	 * @param [callback]
	 */
	setLocation: function(ntiid, callback, fromHistory){
		var me = this,e = Ext.getCmp('viewport').getEl();

		function finish(){
			if(finish.called){
				console.warn('finish navitation called twice');
				return;
			}

			finish.called = true;

			if(e.isMasked()){
				e.unmask();
			}
			Ext.callback(callback,null,arguments);

			if(fromHistory!==true){
				history.pushState({location: ntiid}, "");
			}
			me.fireEvent('changed', ntiid);
		}

//		if(me.currentNTIID && ntiid !== me.currentNTIID){
			e.mask('Loading...');
		//}

		//make this happen out of this function's flow, so that the mask shows immediately.
		setTimeout(function(){
			if(!me.fireEvent('navigate',ntiid)){
//				finish();
				return false;
			}

			me.resolvePageInfo(ntiid,finish);

			me.currentNTIID = ntiid;
			me.fireEvent('change', ntiid);
		},1);
	},


	resolvePageInfo: function(ntiid, callback){
		var me = this,
			service = $AppConfig.service;

		function success(pageInfo){
			me.fireEvent('navigateComplete',pageInfo,callback);
		}

		function failure(q,r){
			console.error(arguments);
			Ext.callback(callback,null,[me,{req:q,error:r}]);
			me.fireEvent('navigateComplete',r);
		}

		service.getPageInfo(ntiid, success, failure, me);
	},


	/**
	 *
	 * @param [id]
	 */
	getLocation : function(id){
		function getAttribute(elements, attr){
			var i=0, v;
			for (i; i < elements.length; i++) {
				v = elements[i];
				try{
					v = v ? v.getAttribute(attr) : null;
					if (v) {return v;}
				}
				catch(e){
					console.warn('element did not have getAttribute');
				}
			}
			return null;
		}

		var me = this, r, l, d, i = id || me.currentNTIID;
		if(!i){
			return {};
		}

		r = me.cache[i];
		if( !r ) {
			r = Library.find(i);

			//If still not r, it's not locational content...
			if (!r) {return null;}

			d = r.toc.documentElement;
			l = r.location;
			r = Ext.apply({
					NTIID: i,
					icon: getAttribute([l,d],'icon'),
					root: getAttribute([l,d],'base'),
					title: getAttribute([l,d],'title'),
					label: getAttribute([l,d],'label'),
					thumbnail: getAttribute([l,d],'thumbnail')
				},r);
		}

		me.cache[i] = r;

		clearTimeout(me.timers[i]);
		me.timers[i] = setTimeout(function(){delete me.cache[i];},15000);

		return r;
	},


	getLineage: function(ntiid){
		var leaf = Library.find(ntiid||this.currentNTIID) || {},
			node = leaf.location,
			lineage = [],
			id;

		while(node){
			id = node.getAttribute? node.getAttribute('ntiid') : null;
			if( id ) {
				lineage.push(id);
			}
			node = node.parentNode;
		}

		return lineage;
	},


	getContentRoot: function(ntiid){
		var bookId = LocationProvider.getLineage(ntiid||this.currentNTIID).last();
		var title = Library.getTitle( bookId );

		return title? title.get('root') : null;
	},


	getNavigationInfo: function(ntiid) {
		var loc = Library.find(ntiid),
			info = {},
			topicOrTocRegex = /topic|toc/i,
			slice = Array.prototype.slice;

		//This function returns true if the node submitted matches a regex looking for topic or toc
		function isTopicOrToc(node){
			if (!node){return false;}
			var result = false,
				topicOrToc = topicOrTocRegex.test(node.tagName),
				href = (node.getAttribute) ? node.getAttribute('href') : null;

			//decide if this is a navigate-able thing, it most be a topic or toc, it must
			//have an href, and that href must NOT have a anchor
			if (topicOrToc && href && href.lastIndexOf('#') === -1) {
				result = true;
			}

			return result;
		}

		//returns the NTIID attribute of the node, or null if it's not there.
		function getRef(node){
			if(!node || !node.getAttribute){
				console.warn('Unable to get ntiid from node, might have navved to root?', node);
				return null;
			}

			return node.getAttribute('ntiid') || null;
		}

		function child(n,first){
			var v,
				topics = n && n.childNodes ? slice.call(n.childNodes) : [];

			if(first){
				topics.reverse();
			}

			while(topics.length && !isTopicOrToc(topics.peek())){topics.pop();}
			if(n && topics.length){
				v = topics.peek();
				return first? v : child(v,first);
			}
			return first? null : n;
		}

		//returns either the previous or next actionable node (topic or toc), or null if
		//we never find anything, meaning we are at one end or the other...
		function sibling(node,previous){
			if (!node){return null;}

			var siblingMethod = previous ? 'previousSibling' : 'nextSibling', //figure direction
				siblingNode = node[siblingMethod]; //execute directional sibling method

			//If the sibling is TOC or topic, we are done here...
			if (isTopicOrToc(siblingNode)){
				return siblingNode;
			}
			//If not, recurse in the same direction
			else {
				return sibling(node[siblingMethod],previous);
			}
		}

		loc = loc ? loc.location : null;
		if(loc) {
			info.previous = getRef(child(sibling(loc,true)) || loc.parentNode);
			info.next = getRef(child(loc,true) || sibling(loc,false) || sibling(loc.parentNode,false));
		}

		return info;
	},


	getRelated: function(givenNtiid){
		var me = this,
			ntiid = givenNtiid || me.currentNTIID,
			map = {},
			info = Library.find(ntiid),
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

					target = tag==='page' ? Library.find(id) : null,
					location = target? target.location : null,

					label = location? location.getAttribute('label') : r.getAttribute('title'),
					href = (location? location : r ).getAttribute('href');

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
			}
			while(!!(r = r.nextSibling));

		},this);

		return map;

	},


	relatedItemHandler: function(el){
		var m = el.relatedInfo;

		if(m.type==='index'||m.type==='link') {
			LocationProvider.setLocation(m.id);
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
			Ext.create('widget.video-window', {
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
	},

	updatePreferences: function(pi) {
		var ntiid = pi.get('NTIID'),
			sharing = pi.get('sharingPreference');

		if(sharing === ''){
			return;
		}

		if (!this.preferenceMap){this.preferenceMap = {};}
		this.preferenceMap[ntiid] = {sharing: sharing};

		console.log('shareing prefs updated', this.preferenceMap[ntiid]);
	},


	getPreferences: function(ntiid) {
		ntiid = ntiid || this.currentNTIID;

		if (!this.preferenceMap || !ntiid) {
			return null;
		}
		return this.preferenceMap[ntiid];
	}



}, function(){
	window.LocationProvider = this;
	ContentAPIRegistry.register('NTIRelatedItemHandler',this.relatedItemHandler,this);
});
