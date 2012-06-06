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


	/**
	 *
	 * @param ntiid
	 * @param [callback]
	 */
	setLocation: function(ntiid, callback, fromHistory){
		var me = this,e = Ext.getCmp('viewport').getEl();

		function finish(){
			if(e.isMasked()){
				e.unmask();
			}
			Ext.callback(callback,null,arguments);

			if(fromHistory!==true){
				history.pushState({location: ntiid}, "");
			}

		}

		if(me.currentNTIID && ntiid !== me.currentNTIID){
			e.mask('Loading...');
		}

		//make this happen out of this function's flow, so that the mask shows immediately.
		setTimeout(function(){
			if(!me.fireEvent('navigate',ntiid,finish)){
				return false;
			}
			me.currentNTIID = ntiid;
			me.fireEvent('change', ntiid);
		},1);
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
			r = Library.findLocation(i);

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


	getNavigationInfo: function(ntiid) {
		var loc = Library.findLocation(ntiid),
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


	getRelated: function(ntiid){
		var me = this,
			map = {},
			info = Library.findLocation(ntiid || me.currentNTIID),
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

					target = tag==='page' ? Library.findLocation(id) : null,
					location = target? target.location : null,

					label = location? location.getAttribute('label') : r.getAttribute('title'),
					href = (location? location : r ).getAttribute('href');

				if(!map[id]){
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
					src: $AppConfig.server.host+m.root+m.href,
					type: 'video/mp4'
				}]
			}).show();

		}
		else {
			console.error('No handler for type:',m.type, m);
		}
	}


}, function(){
	window.LocationProvider = this;
	ContentAPIRegistry.register('NTIRelatedItemHandler',this.relatedItemHandler,this);
});
