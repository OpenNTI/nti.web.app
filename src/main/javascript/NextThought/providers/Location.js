Ext.define('NextThought.providers.Location', {
	singleton: true,
	mixins: { observable: 'Ext.util.Observable' },
	requires: [
		'NextThought.Library',
		'NextThought.ContentAPIRegistry',
		'NextThought.view.video.Window'
	],

	constructor: function(){
		this.addEvents({
			navigate: true,
            navigateAbort: true,
			navigateComplete: true,
			change : true
		});

		Ext.apply(this,{
			currentNTIID: null,
			timers: {},
			cache: {}
		});


		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
	},


	clearStore: function(){
		var stores = this.currentPageStores;
		delete this.currentPageStores;
		Ext.Object.each(stores,function(id,s){
			if(s){
				s.clearListeners();
				s.removeAll(true);
			}
		});
	},

	getStore: function(id){
		var theStore, root;
		if(!id){ Ext.Error.raise('ID required'); }

		function bad(){ console.error('There is no store for id: '+id); }
		theStore =  this.currentPageStores[id];
		if(!theStore){
			root = this.currentPageStores.root;
			if(id === root.containerId){
				theStore = root;
			}
		}
		return theStore || { add: bad, getById: bad, remove: bad, on:bad, each:bad, un:bad };
	},


	setLastLocationOrRoot: function(ntiid) {
		var lastNtiid = localStorage[ntiid] || ntiid;
		this.setLocation(lastNtiid);
	},


	/**
	 *
	 * @param ntiid
	 * @param [callback]
	 * @param [fromHistory]
	 */
	setLocation: function(ntiid, callback, fromHistory){
		var me = this,
			e = Ext.getCmp('viewport').getEl(),
			rootId = this.getLineage(ntiid).last();

		if(me.currentNTIID === ntiid){
			Ext.callback(callback);
			return;
		}

		function finish(){
			if(finish.called){
				console.warn('finish navigation called twice');
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

			//remember last ntiid for this book
			localStorage[rootId] = ntiid;
		}

		if(me.currentNTIID && ntiid !== me.currentNTIID){
			e.mask('Loading...','navigation');
		}

		//make this happen out of this function's flow, so that the mask shows immediately.
		setTimeout(function(){
			if(!me.fireEvent('navigate',ntiid)){
				finish();
				return;
			}

			me.clearStore();
			me.resolvePageInfo(ntiid,finish, Boolean(callback));

			me.currentNTIID = ntiid;
		},1);
	},


	resolvePageInfo: function(ntiid, finish, hasCallback){
		var me = this,
			service = $AppConfig.service;

		function success(pageInfo){
			me.currentPageInfo = pageInfo;
			me.updatePreferences(pageInfo);
			me.currentNTIID = pageInfo.getId();
			me.fireEvent('navigateComplete', pageInfo, finish, hasCallback);
            me.fireEvent('change', me.currentNTIID);
		}

		function failure(q,r){
			console.error('resolvePageInfo Failure: ',arguments);
            me.fireEvent('change', undefined);
            Ext.callback(finish,null,[me,{req:q,error:r}]);
            if (r.status === 403 || !r.responseText) {
                me.fireEvent('navigateAbort');
                alert(r.status === 403
						? 'You don\'t have access to that content.'
						: 'Oops!\nSomething went wrong.');
                delete me.currentNTIID;
                return;
            }
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
			r = this.find(i);

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



	findTitle: function(containerId, defaultTitle){
		var l = this.find(containerId);
		if(defaultTitle === undefined){
			defaultTitle = "Not found";
		}
		return l ? l.location.getAttribute('label') : defaultTitle;
	},


	find: function(containerId) {
		var result = null;
		Library.each(function(o){
			result = Library.resolve( Library.getToc( o ), o, containerId);
			return !result;
		});

		return result;
	},


	getLineage: function(ntiid, justLabels){
		var leaf = this.find(ntiid||this.currentNTIID) || {},
			node = leaf.location,
			lineage = [],
			id;

		while(node){

			id = node.getAttribute? node.getAttribute(justLabels?'label':'ntiid') : null;
			if( id ) {
				lineage.push(id);
			}
			else if( node.nodeType !== Node.DOCUMENT_NODE ){
				console.warn( node, 'no id');
			}
			node = node.parentNode;
		}

		return lineage;
	},


	getSortIndexes: function(ntiid){
		var noLeaf = {},
			leaf = this.find(ntiid||this.currentNTIID) || noLeaf,
			node = leaf.location,
			indexes = [],
			id, i, cn, j, t;

		if(leaf === noLeaf){ return [0, Infinity];}

		while(node){
			id = node.getAttribute? node.getAttribute('ntiid') : null;
			if( id && node.parentNode ) {
				cn = node.parentNode.childNodes;
				i=0; j=0;
				while( i<cn.length){
					t=cn[i].getAttribute ? cn[i].getAttribute('ntiid'): null;
					if(t===id){
						indexes.push(j);
						break;
					}
					if(t){ j++; }
					i++;
				}
			}
			node = node.parentNode;
		}

		return indexes;
	},

	getContentRoot: function(ntiid){
		var bookId = LocationProvider.getLineage(ntiid||this.currentNTIID).last(),
			title = Library.getTitle( bookId );

		return title? title.get('root') : null;
	},


	getNavigationInfo: function(ntiid) {
		var loc = this.find(ntiid),
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
			info = this.find(ntiid),
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

					target = tag==='page' ? this.find(id) : null,
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
			}
			while(Boolean(r = r.nextSibling));

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
	},

	updatePreferences: function(pi) {
		var sharing = pi.get('sharingPreference'),
            piId = pi.getId(),
            rootId = this.getLineage(piId).last();

        if (!this.preferenceMap){this.preferenceMap = {};}

        if (sharing && /inherited/i.test(sharing.State) && rootId === sharing.Provenance) {
            //got a sharing value from the root id, add it to the map
            piId = rootId;
        }
        else if(!sharing || (!/set/i.test(sharing.State) && piId !== rootId)){
            console.debug('Not setting prefs', sharing, (sharing||{}).State);
            return;
        }		this.preferenceMap[piId] = {sharing: sharing};
		console.debug('shareing prefs updated', this.preferenceMap[piId]);
	},


	getPreferences: function(ntiid) {
		ntiid = ntiid || this.currentNTIID;

		if (!this.preferenceMap || !ntiid) {
			return null;
		}

        var lineage = this.getLineage(ntiid), result=null;
        Ext.each(lineage, function(l){return !Boolean(result = this.preferenceMap[l]); }, this);
        return result;
	}



}, function(){
	window.LocationProvider = this;
	ContentAPIRegistry.register('NTIRelatedItemHandler',this.relatedItemHandler,this);
});
