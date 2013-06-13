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
			var fn = mergeChatsFilter,
				o = (item.get('Contributors')||[]).slice(),
				caller = fn.caller || {},
				seenOccupants = caller.seenOccupants || [];

			caller.seenOccupants = seenOccupants;

			o.sort();
			o = o.join('|');
			if(Ext.Array.contains(seenOccupants,o)){
				return false;
			}
			seenOccupants.push(o);
			return true;
		}


		var s = NextThought.store.PageItem.create({ filters:[ mergeChatsFilter ] });
			
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
			load: 'storeLoaded'
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
		var s = this.getStore(), max;

		if (!s.hasOwnProperty('data')) {
			return;
		}

		max = s.getPageFromRecordIndex(s.getTotalCount());
		if(s.currentPage < max && !s.isLoading()){
			s.clearOnPageLoad = false;
			s.nextPage();
		}
	},


	storeLoaded: function(s,recs){
		this.add(Ext.Array.map(recs,function(a){
			return {record: a};
		}));
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
			{cls: 'status', html: '{status}'}
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
		this.fillInInformation(this.record.get('RoomInfo'));
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click','onClick',this);
//		this.fillInInformation(roomInfo);
	},


	onAdded: function(ownerCt){
		this.callParent(arguments);
		this.mon(ownerCt,'peek','updateStatus',this);
	},


	onClick: function(e){
		var me = this;
		e.stopEvent();
		console.log(this.record);
	},


	fillInInformation: function(roomInfo){
		var me = this,
			occ = roomInfo.get('Occupants'),
			usernames = [],
			data = {},
			isGroup = occ.length > 2;

		function fill(users) {
			var userCount = 1;

			if(Ext.isEmpty(users)){
				console.error('This room info did not have any occupants',roomInfo);
				usernames.push('Empty');
				data.status = 'DoA';
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

						if(!isGroup){
							data['img'+userCount] = 'url('+u.get('avatarURL')+')';
							if( me.rendered ){
								me['img'+userCount].setStyle({backgroundImage: data['img'+userCount]});
							}
							userCount++;
						}
					}

					if(!isGroup){
						usernames.push(u.getName());
					}
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


		UserRepository.getUser(occ,fill);
	},


	updateStatus: function(){
	}
});
