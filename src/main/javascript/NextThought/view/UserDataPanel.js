Ext.define('NextThought.view.UserDataPanel',{
	extend: 'Ext.Component',
	alias: 'widget.user-data-panel',

	requires: [
		'NextThought.model.events.Bus',
		'NextThought.store.PageItem'
	],


	cls: 'user-data-panel',
	autoScroll: true,


	feedTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag:'tpl', 'if':'length==0', cn:[{
			cls:"history nothing",
			cn: ['No Items']
		}]},
		{tag:'tpl', 'for':'.', cn:[


			{tag:'tpl', 'if':'isNote', cn:[
				{
					'data-guid': '{guid}',
					cls: 'history note',
					cn:[
						{cls: 'path', html:'{path}'},
						{cls: 'location', html:'{location}'},
						{cls: 'body', html: '{textContent}'}
					]
				}]},

			{tag:'tpl', 'if':'isFavorite', cn:[
				{
					'data-guid': '{guid}',
					cls: 'history favorite',
					cn:[
//					{cls: 'path', html:'{path}'},
//					{cls: 'location', html:'{location}'}
					]
				}]},


			{tag:'tpl', 'if':'isChat', cn:[
				{
					'data-guid': '{guid}',
					cls: 'history chat',
					cn:[
						{cls: 'occupants', cn:[
							{tag: 'span', cls: 'names', html: '{occupants}'},
							{tag: 'span', cls: 'count', html: '{count}'}
						]},
						{cls: 'time', cn:[
							'{started} - Lasted ',
							{tag: 'span', cls: 'duration', html:'{duration}'}
						]}
					]
				}]},



			{tag:'tpl', 'if':'label', cn:[{
				cls: 'divider', cn:[{tag:'span', html:'{label}'}]
			}]}
		]}
	])),



	initComponent: function(){
		var data = NextThought.model,
				m = this.dataMapper = {},
				types = [];

		m[data.Note.prototype.mimeType] = this.getNoteItem;
		m[data.Highlight.prototype.mimeType] = this.getHighlightItem;
		m[data.TranscriptSummary.prototype.mimeType] = this.getChatItem;
		m[data.Transcript.prototype.mimeType] = this.getChatItem;

		this.callParent(arguments);

		//create a regex for our filter
		Ext.each(this.mimeType, function(t){ types.push(RegExp.escape(t)); });
		this.mimeTypeRe = new RegExp('^application\\/vnd\\.nextthought\\.('+types.join('|')+')$');


		this.on('activate', this.onActivate, this);
		this.initializeStore();
	},



	initializeStore: function(){
		if(NextThought.store.PageItem.prototype.proxy.url === 'tbd'){
			Ext.defer(this.initializeStore,100,this);
			return;
		}

		var s = this.self;

		if(!s.store){
			s.store = this.buildStore('MeOnly','historyStore','GroupingField');
		}
		if(!s.favStore){
			s.favStore = this.buildStore('Favorite','favoriteStore','MimeType');
			NextThought.model.events.Bus.on({
				scope: this,
				'favorate-changed': function(rec){
					var store = s.favStore;

					if (store.isLoading()){
						return;
					}

					if(rec.isFavorited()){
						store.add(rec);
					}
					else {
						store.remove(store.findRecord('NTIID',rec.get('NTIID'),0,false,true,true));
					}
				}
			});
		}


		//now that the stores are setup, use getStore to pick the one we care about and setup our event listers on just
		// that store.
		this.mon(this.getStore(),{
			scope: this,
			datachanged: this.maybeRedraw,
			load: this.maybeRedraw
		});
	},


	buildStore: function(filter,id,grouping){
		var s = NextThought.store.PageItem.create({id:id, groupField:grouping});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'lastModified',
			sortOrder: 'descending',
			filter: filter
		});

		return s;
	},


	getStore: function(){
		var favFakeMime = 'application/vnd.nextthought.favorite';
		return this.mimeTypeRe.test(favFakeMime)? this.self.favStore : this.self.store;
	},


	prefetchNext: function(){
		var s = this.getStore(), max;

		if (!s.hasOwnProperty('data')) {
			return;
		}

		max = s.getPageFromRecordIndex(s.getTotalCount());
		if(s.currentPage < max && !s.isLoading()){
			this.el.parent().mask('Loading...','loading');
			s.clearOnPageLoad = false;
			s.nextPage();
		}
	},


	onActivate: function() {
		if (this.needsRedraw) {
			this.redraw();
			delete this.needsRedraw;
		}
	},


	maybeRedraw: function(){
		if (this.isVisible()){
			this.redraw();
		}
		else {
			this.needsRedraw = true;
		}
	},


	applyMimeTypeFilter: function(){
		var filters = [{ property: 'MimeType', value: this.mimeTypeRe }],
			s = this.self.store,//this store is the only store we need to filter. The favStore is seporate.
			seenOccupants = [];

		s.suspendEvents();
		s.clearFilter();

		if(/transcript/i.test(this.mimeType.join('|'))){
			filters.push({
				//Assuming the store is sorted decending (newest to oldest), as we come accross repeated occupants lists,
				// we can filter them out.
				filterFn: function(item) {
					var o = (item.get('Contributors')||[]).slice();
					o.sort();
					o = o.join('|');
					if(Ext.Array.contains(seenOccupants,o)){
						return false;
					}
					seenOccupants.push(o);
					return true;
				}
			});
		}

		s.filter(filters);
		s.resumeEvents();
	},


	afterRender: function(){
		this.callParent(arguments);
		var s = this.getStore();
		try{
			if (!s.initialLoaded){
				s.initialLoaded = true;
				s.load();
				this.el.parent().mask('Loading...','loading');
			}

			if(this.redrawOnRender){
				delete this.redrawOnRender;
				this.redraw();
			}
		}
		catch(e){
			console.error(e.message, e.stack || e.stacktrace);
		}

		this.mon(this.el, {
			scope: this,
			click: this.onClick,
			scroll: this.onScroll
		});
	},


	onScroll: function(e,dom){
		var el = dom.lastChild,
				offsets = Ext.fly(el).getOffsetsTo(dom),
				top = offsets[1] + dom.scrollTop,
				ctBottom = dom.scrollTop + dom.clientHeight;

		if(ctBottom > top){
			this.prefetchNext();
		}

	},


	onClick: function(evt){
		var historyElement = evt.getTarget('.history'),
				data = NextThought.model,
				rec, cid, targets, mt;

		evt.stopEvent();
		if (!historyElement){return;}

		rec = this.dataGuidMap[historyElement.getAttribute('data-guid')];
		mt = rec.get('MimeType');

		if(mt === data.TranscriptSummary.prototype.mimeType){
			this.getTranscriptsForOccupants(rec);
		}
		else {
			cid = rec.get('ContainerId');
			targets = (rec.get('references')||[]).slice();
			targets.push(rec.getId());
			this.fireEvent('navigation-selected', cid, targets, null);
		}
	},


	getTranscriptsForOccupants: function(initialRecord){
		var records = [],
			store = this.getStore(),
			mimeRe = this.mimeTypeRe,
			occupants = (initialRecord.get('Contributors')||[]).slice(),
			length = occupants.length;

		//Lets just assume that we have all of 'em in the map for now. (there is no way to query for these objects so
		// paging them in is not really in the cards for now.)
		store.snapshot.each(function(obj){
			if(!mimeRe.test(obj.get('MimeType'))){return;}

			var list = (obj.get('Contributors')||[]),
					len = list.length;

			if(length === len){
				if(Ext.Array.intersect(occupants,list).length === length){
					records.push(obj);
				}
			}
		});

		this.fireEvent('open-chat-transcript', records);
	},


	redraw: Ext.Function.createBuffered( function(){
		if(!this.rendered){
			this.redrawOnRender = true;
			return;
		}

		this.applyMimeTypeFilter();

		var container = this,
				items = [],
				store = this.getStore(),
				groups = store.getGroups(),
				me = this;

		me.dataGuidMap = {};

		function doGroup(group){
			var label = (group.name||'').replace(/^[A-Z]\d{0,}\s/,'') || 'Today';
			label = label.replace(/^application\/vnd.nextthought\.(.*)$/,'$1s');

			items.push({ label: label });

			Ext.each(group.children,function(c){
				var fn = me.dataMapper[c.mimeType];
				if( fn ){ items.push(fn.call(me,c)); }

				me.dataGuidMap[items.last().guid] = c;
			});
		}

		if(groups.length === 0){
			this.feedTpl.overwrite(container.getEl(), []);
			container.updateLayout();
		}

		Ext.each(groups,doGroup,this);

		this.el.parent().unmask();
		this.feedTpl.overwrite(container.getEl(),items);
		container.updateLayout();

		//just in case the items in the list don't fill the view.
		if (this.el.dom.scrollHeight <= this.el.dom.clientHeight){
			this.onScroll(null,this.el.dom);
		}
	}, 10),//posibily a tweak point



	getHighlightItem: function(rec){

		rec.getBodyText = function(){
			return rec.get('selectedText');
		};

		return this.getNoteItem(rec);
	},


	getNoteItem: function(rec){
		var me = this,
				guid = guidGenerator(),
				data = {
					isNote: true,
					guid: guid,
					location: '...',
					path: '...',
					textContent: rec.getBodyText()
				};

		LocationMeta.getMeta(rec.get('ContainerId'),function(meta){
			var lineage = [],
					location = '',
					dom;

			if(!meta){
				console.warn('No meta for '+rec.get('ContainerId'));
			}
			else {
				lineage = LocationProvider.getLineage(meta.NTIID,true);
				location = lineage.shift();
				lineage.reverse();

				Ext.apply(data, {
					location: Ext.String.ellipsis(location, 150, false),
					path: lineage.join(' / ')
				});
			}

			try {
				dom = me.el.down('[data-guid='+guid+']');
				if (dom) {
					dom.down('.path').update(data.path);
					dom.down('.location').update(data.location);
				}
			}
			catch(e){
				console.log('strange :P', e.message, e.stack);
			}


		});

		return data;
	},


	getChatItem: function(rec){
		var me = this,
				guid = guidGenerator(),
				ri = rec.get('RoomInfo'),
				started = ri.get('CreatedTime'),
				ended = rec.get('Last Modified'),
				data = {
					isChat: true,
					guid: guid,
					occupants: rec.get('Contributors'),
					started: Ext.Date.format(started, 'g:i A'),
					duration: rec.timeDifference(ended, started).replace(/ ago/i, '')
				};

		UserRepository.getUser(data.occupants, function(users){
			var names = [],
					dom;
			Ext.each(users, function(u){
				if (!isMe(u) && names.length < 4){
					names.push(u.getName().split(/\s/)[0]);
				}
			});
			if (users.length > 5){data.count = '('+(users.length-1)+')';}
			data.occupants = names.join(', ');


			try {
				dom = me.el.down('[data-guid='+guid+']');
				if (dom) {
					dom.down('.occupants .names').update(data.occupants);
					dom.down('.occupants .count').update(data.count || '');
				}
			}
			catch(e){
				console.log('strange :P', e.message, e.stack);
			}
		});


		return data;
	}

});
