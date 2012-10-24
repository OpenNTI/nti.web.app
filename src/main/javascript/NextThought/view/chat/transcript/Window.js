Ext.define('NextThought.view.chat.transcript.Window',{
	extend:'NextThought.view.Window',
	alias: 'widget.chat-transcript-window',

	requires: [
		'NextThought.view.chat.transcript.Main'
	],

	minWidth:350,
	minHeight:200,
	height:400,
	width:350,
	managed: false,
	modal: true,

	layout: 'auto', autoScroll: true,
	titleTpl:'{0} (Chat History)',


	failedToLoadTranscript: function(){
		alert('failedToLoadTranscript');
		this.destroy();
	},


	setTitleInfo: function(contributors){
		var me = this;
		UserRepository.getUser(contributors,function(users){
			var names = [];
			Ext.each(users, function(u){ if(!isMe(u)){ names.push(u.getName()); } });
			me.setTitle(Ext.String.format(me.titleTpl,names.join(',')));
		});
	},


	insertTranscript: function(record){

		this.setTitleInfo(record.get('Contributors'));
		var container = this.down('[windowContentWrapper]'),
			time = record.get('RoomInfo').get('CreatedTime'),
		    existing = container.items, idx = 0, inserted;

		//assume existing is already sorted
		existing.each(function(v,i){
			if(v.time < time){idx = i + 1;}
//			console.log(v.time, v, time, i);
		},this);

		inserted = container.insert(idx,{
			xtype: 'chat-transcript',
			time: time,
			messages: record.get('Messages')
		});

		this.show();
		console.log(this.waitFor);
		this.waitFor--;

		if(this.waitFor > 0 && !this.el.isMasked()){
			console.log(this.waitFor, 'masking...');
			this.el.mask('Loading...','loading');
		}

		if(this.waitFor <=0){
			console.log(this.waitFor, 'finished...');
			if(this.el.isMasked()){
				this.el.unmask();
			}
			//allow the dom to settle, let this execute in the nextish event pump.
			Ext.defer(function(){
				container.getEl().scrollTo('top',container.getEl().dom.scrollHeight);
			},10);
		}
	}
});
