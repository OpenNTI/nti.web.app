Ext.define('NextThought.view.video.transcript.Transcript',{
	extend:'Ext.view.View',
	alias:'widget.video-transcript',

	requires:[
		'NextThought.webvtt.Transcript',
		'NextThought.webvtt.Cue',
		'NextThought.model.transcript.Cue'
	],


	//	ui: 'content-slidevideo',
	cls: 'content-video-transcript',


	statics: {
		processTranscripts: function(c) {
			var parser = new NextThought.webvtt.Transcript({
					input: c,
					ignoreLFs: true
				});

			return parser.parseWebVTT();
		}
	},


	renderTpl: Ext.DomHelper.markup([
		{cls: 'text-content', html:'{content}'}
	]),


	renderSelectors:{
		contentEl: '.text-content'
	},

	itemSelector: 'row-item',
	tpl: new Ext.XTemplate( Ext.DomHelper.markup([
		{tag:'tpl', for:'.', cn:[{
			tag:'tpl', if:'!type', cn:{
				tag:'span', cls:'cue row-item', 'cue-start':'{startTime}', 'cue-end':'{endTime}', 'cue-id':'{identifier}', cn:[
					{tag:'span', html:'{text}'},

					{tag: 'span', cls:'control-container', cn:{
						cls:'note-here-control-box add-note-here hidden', tag:'span'
					}}
			]}
		},{
			tag:'tpl', if:'type', cn:
				{cls:'row-item timestamp-container {type}', cn:
					{tag:'a', cls:'timestamp', html:'{startTime}', 'data-time':'{startTime}'}
				}
		}]}
	])),

	controlTpl: new Ext.XTemplate( Ext.DomHelper.markup([
			{tag:'span', cls:'count', 'data-count':'{count}', html:'{count}'}
	])),


	initComponent: function(){
		this.fireEvent('uses-page-stores',this);
		this.callParent(arguments);
		this.loadTranscript();

		this.addEvents('jump-video-to', 'transcript-ready');
		this.enableBubble(['jump-video-to', 'transcript-ready']);
	},


	buildStore: function(cueList, filter){
		var cues = [], s;
		Ext.each(cueList, function(c){
			var m = NextThought.model.transcript.Cue.fromParserCue(c);
			cues.push(m);
		});

		s = new Ext.data.Store({
			proxy:'memory',
			sorters: [{
				property: 'startTime',
				direction: 'ASC'
			}]
		});

		s.loadData(cues);
		s.filter([{filterFn: filter}]);

//		console.log('transcript  expected starts to ', this.transcript.get('desired-time-start'), ', end at: ', this.transcript.get('desired-time-end'));
//		console.log('first cue starts at ', s.data.items[0].get('startTime'), ', and last cue ends at: ', s.data.items[s.data.items.length-1].get('endTime'));
		return s;
	},


	buildUserDataStore: function(){
		var containerId = this.transcript.get('associatedVideoId'),
			filter = this.getUserDataTimeFilter(),
			me = this;

		function finish(store){
			// Apply filter to know which user data belong belong within the timing of this transcript.
			if(!store){ return; }
			store.filter([{filterFn:filter}]);
			console.log('userdata store: ', store);
			// Now we will start to bucket notes.
			console.log('should start to show and bucket items');
			me.bucketUserData(store);
		}

		var url = $AppConfig.service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA),
			store = NextThought.store.PageItem.make(url, containerId,true);

		/** {@see NextThought.controller.UserData#addPageStore} for why we set this flag. */
		store.doesNotShareEventsImplicitly = true;
		Ext.apply(store.proxy.extraParams,{
			accept: NextThought.model.Note.mimeType,
			filter: 'TopLevel'
		});

		me.mon(store, 'load', finish, me);
		store.load();
	},


	bucketUserData: function(store){
		var records = store.getRange(),
			tpl = this.controlTpl, destinationEl,
			me = this;

		Ext.each(records, function(rec){
			var count;
			destinationEl = me.getLocationForNoteRecord(rec);
			if(!Ext.isEmpty(destinationEl)){
				console.log(destinationEl);
				count = destinationEl.down('.count') ? destinationEl.down('.count').getAttribute('data-count') : '0';
				count = parseInt(count);
				count++;
				tpl.insertBefore(destinationEl.down('.add-note-here'), {count: count}, true);
			}
		});
	},


	getLocationForNoteRecord: function(rec){
		function fn(item){
			return (item.get('startTime') <= anchorStart) && (anchorStart <= item.get('endTime'));
		}

		var range = rec.get('applicableRange'),
			anchorStart = range.start.seconds,
			cueid = range.start.cueid,
			el, cue, res;

		if(cueid){
			el = this.el.down('.cue[identifier='+cueid+']');
			if(el){return el;}
		}

		res = this.store.queryBy(fn, this);
		if(res.getCount() > 0){
			cue = res.getAt(0);
			el = this.el.down('.cue[cue-start='+cue.get('startTime')+']');
		}
		return el;
	},


	getUserDataTimeFilter: function(){
		function fn(item){
			var range = item.get('applicableRange'),
				startAnchorTime = range.start && range.start.seconds,
				endAnchorTime = range.end && range.end.seconds;

			return (startAnchorTime >= start) && (endAnchorTime <= end);
		}

		var start = this.transcript.get('desired-time-start'),
			end = this.transcript.get('desired-time-end');

		return fn;
	},


	getTimeRangeFilter: function(){
		function fn(item){
			if(item.get('type') === 'section'){
				// NOTE: For section cue, we may not have an endTime set. So just make sure that
				// it's start time is within the range of time we care about.
				return (item.get('startTime') >= start) && (item.get('startTime') <= end);
			}

			return (item.get('startTime') >= start) && (item.get('endTime') <= end);
		}

		var start = this.transcript.get('desired-time-start'),
			end = this.transcript.get('desired-time-end');

		return (start >= 0 && end >= 0) ? fn : Ext.emptyFn;
	},


	loadTranscript: function(){
		function transcriptLoadFinish(text){
			var cueList = NextThought.view.video.transcript.Transcript.processTranscripts(text);


			cueList = me.groupByTimeInterval(cueList, 30);
			me.store = me.buildStore(cueList, me.getTimeRangeFilter());
			me.bindStore(me.store);
			Ext.defer(function(){
				me.fireEvent('transcript-ready');
			}, 1, me);

			// Save the content and hopefully we won't have to load it again.
			if(Ext.isEmpty(me.transcript.get('content'))){
				me.transcript.set('content', text);
			}

			me.cueList = cueList;
		}

		var me = this,
			proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax,
			content = this.transcript && this.transcript.get('content');

		if(!this.transcript){
			console.warn('No transcript data available..');
			return;
		}

		//Avoid loading the content if we already have it.
		if(!Ext.isEmpty(content)){
			transcriptLoadFinish(content);
			return
		}

		proxy.request({
			jsonpUrl: this.getTranscriptJsonUrl(),
			url: this.getTranscriptUrl(),
			expectedContentType: this.transcript.get('contentType'),
			scope:this,
			success: function(res, req){
				console.log('SUCCESS Loading Transcripts: ', arguments);
				Ext.callback(transcriptLoadFinish, me, [res.responseText]);
			},
			failure: function(){
				console.log('FAILURE Loading Transcripts: ', arguments);
			}
		});
	},


	groupByTimeInterval: function(cueList, timeInterval){
		// TODO: Group by Sections defined in the parser. Right now we're only grouping by time Interval.
		var list = [],
			currentTime = this.transcript.get('desired-time-start') || cueList[0].startTime;

		list.push({type: 'section', startTime: currentTime, endTime:-1});
		Ext.each(cueList, function(t){
			var endTime = t.endTime;
			if(endTime < currentTime + timeInterval){
				list.push(t);
			}
			else{
				//insert a new section entry.
				list.push({type: 'section', startTime: t.startTime, endTime:-1});
				list.push(t);
				currentTime += timeInterval;
			}
		});

		return list;
	},


	getTranscriptJsonUrl: function(){
		return this.transcript.get('basePath') + this.transcript.get('jsonUrl');
	},


	getTranscriptUrl: function(){
		return this.transcript.get('basePath') + this.transcript.get('url');
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			content: this.content
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		//Allow text selections
		this.el.selectable();
		this.on('transcript-ready', this.onViewReady, this);
	},


	onViewReady: function(){
		var me = this;
		me.transcriptReady = true;

		me.mon(me.el.select('.timestamp-container'),{
			scope: me,
			'click': me.timePointerClicked
		});

		me.mon(me.el.select('.cue'), {
			scope: me,
			'mouseover':'mouseOver',
			'mousemove':'mouseOver',
			'mouseout':'mouseOut'
		});

		me.mon(me.el.select('.cue .add-note-here'), {
			scope: me,
			'click': 'openEditor'
		});

		me.mon(me.el, {
			scope: me,
			'mouseup':'showContextMenu'
		});

		me.buildUserDataStore();
	},


	openEditor: function(e){
//		console.log('show editor at: ', e.getTarget('.cue'));
		var cueEl = e.getTarget('.cue', null, true),
			cueStart = cueEl && cueEl.getAttribute('cue-start'),
			cueEnd = cueEl && cueEl.getAttribute('cue-end'),
			range = document.createRange(),
			sid = cueEl && cueEl.getAttribute('cue-id'),
			cid = this.transcript.get('associatedVideoId'), data;

		range.selectNodeContents(cueEl.dom);
		data = { startTime:cueStart, endTime:cueEnd, range:range, startCueId:sid, endCueId:sid, containerId: cid };
		this.fireEvent('show-editor', data, cueEl.down('.add-note-here'));
	},


	openEditorInline: function(){
		this.contextMenu.hide();
		this.fireEvent('show-editor-inline', this.contextMenu.cueData, this.contextMenu.position);
	},


	buildContextMenu: function(){
		var me = this,
			menu = Ext.widget('menu',{
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			closeAction: 'destroy',
			minWidth: 150,
			defaults: {ui: 'nt-annotaion', plain: true }
		});

		menu.add({
			text: 'Save Highlight',
			handler:function(){
				console.warn('No support for highlights yet');
			},
			disabled: true
		});

		menu.add({
			text: 'Add Note',
			handler: function(){
				me.openEditorInline();
			}
		});
		this.contextMenu = menu;
	},


	showContextMenu: function(e){
		console.log('Should show context menu');
		e.stopEvent();

		if(!this.contextMenu){
			this.buildContextMenu();
		}

		var xy = e.getXY(),
			sel = window.getSelection(),
			range = sel.getRangeAt(0).cloneRange(), cueData = {},
			viewBox = this.getBox(), pos;

		// If no selection, return.
		if(sel.isCollapsed){ return; }

		Ext.apply(cueData, this.getCueInfoFromRange(range) || {});
		this.contextMenu.position = [viewBox.width + 50, xy[1] - 10];
		console.log(' Desired editor position: ', this.contextMenu.position);
		this.contextMenu.cueData = cueData;

		// Show menu
		this.contextMenu.showAt(xy);
		Ext.defer(function(){ sel.addRange(range); }, 10, this);
	},


	getCueInfoFromRange: function(range){
		if(!range || range.isCollapsed){ return null; }

		var d = range.cloneContents(),
			cues = d.querySelectorAll('.cue'),
			startCue = cues && cues[0],
			endCue = cues &&  Ext.Array.slice(cues, -1).first(),
			startTime, endTime, sid, eid, cid;

		startTime = startCue && startCue.getAttribute('cue-start');
		endTime = endCue && endCue.getAttribute('cue-end');
		sid = startCue && startCue.getAttribute('cue-id');
		eid = endCue && endCue.getAttribute('cue-id');
		cid = this.transcript.get('associatedVideoId');

		return { startTime:startTime, endTime:endTime, range:range, startCueId:sid, endCueId:eid, containerId: cid };
	},


	mouseOver: function(e){
		if (this.suspendMoveEvents) {
			return;
		}

		var target = e.getTarget('.cue', null, true), me = this, box;
		if(target){
			box = target.down('.add-note-here');

			if(this.lastTarget && (this.lastTarget.dom === target.dom)){
				return;
			}

			this.lastTarget = target;
			//clearTimeout(this.mouseLeaveTimeout);
			this.mouseLeaveTimeout = setTimeout(function () {
				//Deselect previous cue
				if(me.activeCueEl){
					me.activeCueEl.down('.add-note-here').addCls('hidden');
				}

				box.removeCls('hidden');
				me.activeCueEl = target;
			}, 50);
		}
	},


	mouseOut: function(e){
		if (this.suspendMoveEvents) {
			return;
		}

		var target = e.getTarget('.cue'), me = this,
			box = Ext.fly(target).down('.add-note-here');

		clearTimeout(this.mouseLeaveTimeout);
	},


	timePointerClicked: function(e){
		var t  = e.getTarget(),
			b = parseFloat(Ext.fly(t).getAttribute('data-time')),
			videoInfo = {
				ntiid: this.transcript.get('associatedVideoId'),
				start:this.transcript.get('desired-time-start') || 0,
				end:this.transcript.get('desired-time-end')
			};

		console.log('Jump to video ', videoInfo,' to : ', b);
		this.fireEvent('jump-video-to', videoInfo, b);
	},


	syncTranscriptWithVideo: function(videoState){
		if(Ext.isEmpty(videoState)){ return; }

		var currentTime = (videoState || {}).time, currentCue, s;

		s = Ext.Array.filter(this.cueList, function(cue){
			return (currentTime >= cue.startTime  && currentTime < cue.endTime);
		});

		//console.log(s);
		currentCue = s && s[0];
		this.selectNewCue(currentCue);
	},


	selectNewCue: function(newCue){
		if(newCue === this.currentCue || Ext.isEmpty(newCue)){ return; }

		var c = this.currentCue,
			prevCueEl = c && this.el.down('[cue-start='+c.startTime+'][cue-end='+c.endTime+']'),
			newCueEl = this.el.down('[cue-start='+newCue.startTime+'][cue-end='+newCue.endTime+']');

		if(prevCueEl){
			prevCueEl.removeCls('active');
		}
		if(newCueEl){
			newCueEl.addCls('active');
		}

		this.currentCue = newCue;
	}

});
