Ext.define('NextThought.view.chat.History',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.chat-history',
	id: 'chat-history',//there should be ONLY ONE instance of this.

	requires: [
		'NextThought.model.TranscriptSummary',
		'NextThought.model.Transcript',
		'NextThought.store.PageItem',
		'NextThought.util.Time',
		'NextThought.model.converters.GroupByTime'
	],

	title: 'Chat History',
	ui: 'chat-history',
	cls: 'chat-history',
	defaultType: 'chat-history-item',
	border: false,

	initComponent: function(){
		this.callParent(arguments);
		this.initializeStore();
	},


	initializeStore: function(){
		if(NextThought.store.PageItem.prototype.proxy.url === 'tbd'){
			Ext.defer(this.initializeStore,100,this);
			return;
		}


		function mergeChatsFilter(item) {
			var o = (item.get('Contributors')||[]).slice(),
				caller = mergeChatsFilter.caller || {},
				seen = caller.seenOccupants || [];

			caller.seenOccupants = seen;

			o.sort();
			o = o.join('|');
			if(Ext.Array.contains(seen,o)){
				return false;
			}
			seen.push(o);
			return true;
		}


		var s = NextThought.store.PageItem.create({ filters:[ mergeChatsFilter ], pageSize: 100 });
			
		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'createdTime',
			sortOrder: 'descending',
			accept: [
				NextThought.model.TranscriptSummary.prototype.mimeType,
				NextThought.model.Transcript.prototype.mimeType
			].join(',')
		});

		this.mon(s,{
			scope: this,
			load: 'storeLoaded',
			add: 'storeLoaded'
		});

		this.store = s;
		s.load();
	},


	onAdded: function(ownerCt){
		this.callParent(arguments);
		this.relayEvents(ownerCt,['peek']);
	},


	getStore: function(){
		if(!this.store){
			this.initializeStore();
		}

		return this.store;
	},


	prefetchNext: function() {
		if(!this.rendered){
			Ext.log.warn('Not rendered yet');
			return;
		}
		var s = this.getStore(), links = s && s.batchLinks,
			more = this.el.down('.more'),
			body = this.ownerCt.el && this.ownerCt.el.down('#chat-dock-body');

		if(more){
			if(this.loadingMore){
				this.loadingMore = false;
				more.unmask();
			}else{
				more.mask('Loading');
				this.loadingMore = true;
				this.lastScroll = (body)? body.getScroll().top : Infinity;
			}
		}

		if (!links) {
			if(more){more.unmask();}
			return;
		}


		if(links && links['batch-next'] && !s.isLoading()){
			s.clearOnPageLoad = false;
			s.getProxy().buildUrl = function(){return links['batch-next'];};
			s.nextPage();
		}else{
			if(more){ more.unmask(); }
		}
	},


	storeLoaded: function(s){
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.storeLoaded,this,arguments),this,{single:true});
			return;
		}


		var body, l = s.batchLinks;
		this.removeAll(true);
		this.add(Ext.Array.map(s.getRange(),function(a){
			return {record: a, store: s};
		}));

		if( this.items.length< 1 || !(l && l['batch-next'])){
			this.prefetchNext();
		}

		if(l && l['batch-next']){
			this.add({
				xtype:'box',
				autoEl: {
					cls: 'more',
					html: 'Load More'
				},
				listeners: {
					click: {
						scope: this,
						fn: 'prefetchNext',
						element: 'el'
					}
				}
			});
		}
		else if(this.items.length < 1){
			this.add({
				xtype: 'box',
				autoEl: {
					cls: 'no-history',
					html: 'No chat History'
				}
			});
		}

		if(this.loadingMore){
			body = this.ownerCt.el.down('#chat-dock-body');
			if(body){ body.scrollTo('top',this.lastScroll); }
			this.loadingMore = false;
		}
	}

});




Ext.define('NextThought.view.chat.HistoryItem',{
	extend: 'Ext.Component',
	alias: 'widget.chat-history-item',
	cls: 'chat-dock-item',
	ui: 'chat-dock-item',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'avatars {avatarCls}', cn: [
			{cls: 'img1 avatar', style:{backgroundImage: '{img1}'} },
			{cls: 'img2 avatar', style:{backgroundImage: '{img2}'} },
			{cls: 'img3 avatar', style:{backgroundImage: '{img3}'} },
			{cls: 'img4 avatar', style:{backgroundImage: '{img4}'} }
		]},
		{cls: 'wrap', cn: [
			{cls: 'names {namesCls}', html:'{names}', 'data-count':'{count}'},
			{cls: 'status', html: '{date:date("n/j/Y")} &middot; {duration}'}
		]}
	]),

	renderSelectors: {
		'namesEl': '.wrap .names',
		'statusEl': '.wrap .status',
		'avatarsEl': '.avatars',
		'img1': '.avatars .img1',
		'img2': '.avatars .img2',
		'img3': '.avatars .img3',
		'img4': '.avatars .img4'
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.fillInInformation();
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click','onClick',this);
	},


	onClick: function(e){
		e.stopEvent();
		this.getTranscriptsForOccupants();
	},


	getTranscriptsForOccupants: function(){
		var records = [],
			store = this.store,
			occupants = (this.record.get('Contributors')||[]).slice(),
			length = occupants.length;


		//Lets just assume that we have all of 'em in the map for now. (there is no way to query for these objects so
		// paging them in is not really in the cards for now.)
		store.snapshot.each(function(obj){
			var list = (obj.get('Contributors')||[]),
					len = list.length;

			if(length === len){
				if(Ext.Array.intersect(occupants,list).length === length){
					records.push(obj);
				}
			}
		});


		this.fireEvent('open-chat-transcript', records, this.namesEl.getHTML());
	},


	fillInInformation: function(){
		var me = this,
			record = me.record,
			roomInfo = record.get('RoomInfo'),
			contributors = record.get('Contributors'),
			occ = roomInfo.get('Occupants'),
			started = roomInfo.get('CreatedTime'),
			ended = record.get('Last Modified'),
			usernames = [],
			data = {},
			isGroup = occ.length > 2;


		data.duration = TimeUtils.getDurationText(started,ended);
		data.date = started;

		function fill(users) {
			var userCount = 1;

			if(Ext.isEmpty(users)){
				console.error('This room info did not have any occupants',roomInfo);
				usernames.push('Empty');
			}

			Ext.each(users,function(u){
				if(!isMe(u)){
					if(userCount <= 4){
						if(userCount > 1){
							data.avatarCls = 'quad';
							if( me.rendered ){
								me.avatarsEl.addCls(data.avatarCls);
							}
						}

						//if(!isGroup){
						data['img'+userCount] = 'url('+u.get('avatarURL')+')';
						if( me.rendered ){
							me['img'+userCount].setStyle({backgroundImage: data['img'+userCount]});
						}
						userCount++;
						//}
					}

					//if(!isGroup){
					usernames.push(u.getName());
					//}
				}

			});

			//blank out the rest
			for(userCount; userCount <= 4; userCount++){
				delete data['img'+userCount];
				if( me.rendered ){
					me['img'+userCount].setStyle({backgroundImage: undefined});
				}
			}

			Ext.apply(data,{
				names: usernames.join(', '),
				count: usernames.length
			});

			if(!me.rendered){
				me.renderData = Ext.apply(me.renderData||{},data);
				return;
			}

			me.namesEl.update(data.names).set({'data-count':data.count});
			if(usernames.length > 1){
				me.namesEl.addCls('overflown');
			}
		}


		UserRepository.getUser(Ext.Array.merge(occ, contributors),fill);
	}
});
