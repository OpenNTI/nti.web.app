Ext.define('NextThought.view.video.transcript.Transcript',{
	extend:'Ext.Component',
	alias:'widget.video-transcript',

	requires:[
		'NextThought.webvtt.Transcript',
		'NextThought.webvtt.Cue'
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


	sectionTpl: new Ext.XTemplate( Ext.DomHelper.markup([{
		cls:'section', cn:[
			{ cls: 'timestamp-container', cn:[
				{tag:'a', cls:'timestamp', html:'{startTime}', 'data-time':'{startTime}'}
			]},
			{ cls:'text', cn: {
				tag:'tpl', 'for':'group', cn:[
					{tag:'span', cls:'cue', 'cue-start':'{startTime}', 'cue-end':'{endTime}', cn:[
						{tag:'span', html:'{text}'},
						{tag: 'span', cls:'add-note-here hidden', cn:{cls:'note-here-control-box', tag:'span'}}
					]}
				]
			}}
		]}
	])),


	initComponent: function(){
		this.callParent(arguments);
		this.loadTranscript();

		this.addEvents('jump-video-to', 'transcript-ready');
		this.enableBubble(['jump-video-to', 'transcript-ready']);
	},


	appendCues: function(cueGroup){
		var html = [],
			sectionTpl= this.sectionTpl;

		Ext.each(cueGroup, function(group){
			html.push( sectionTpl.apply({
				startTime:group[0].startTime,
				group:group
			}));
		});

		return html;
	},


	loadTranscript: function(){
		function transcriptLoadFinish(text){
			var cueList = NextThought.view.video.transcript.Transcript.processTranscripts(text),
				cueGroups = me.groupByTimeInterval(cueList, 30),
				html = me.appendCues(cueGroups);

			html = html.join('');

			if(!me.rendered){
				me.renderData = Ext.apply(me.renderData || {}, {
					'content': html
				});
			}
			else{
				me.contentEl.update(html);
			}

			me.cueList = cueList;
			me.fireEvent('transcript-ready');
			Ext.defer(me.updateLayout, 1, me);
		}

		var me = this,
			proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

		if(!this.data){
			console.warn('No transcript data available..');
			return;
		}

		proxy.request({
			jsonpUrl: this.getTranscriptJsonUrl(),
			url: this.getTranscriptUrl(),
			expectedContentType: this.data.type,
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
		var groups= [], tempGroup= [],
			currentTime = cueList && cueList[0].getStartTime();

		Ext.each(cueList, function(t){
			var endTime = t.getEndTime();
			if(endTime < currentTime + timeInterval){
				tempGroup.push(t);
			}
			else{
				groups.push(tempGroup);
				tempGroup = [];
				currentTime += timeInterval;
			}
		});

		return groups;
	},


	getTranscriptJsonUrl: function(){
		return this.data.basePath + this.data.jsonUrl;
	},


	getTranscriptUrl: function(){
		return this.data.basePath + this.data.url;
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			content: this.content
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		var me = this;
		this.on('transcript-ready', function(){
			me.transcriptReady = true;
			me.mon(me.el.select('.timestamp-container'),{
				scope: me,
				'click': me.timePointerClicked
			});

			me.mon(me.el.select('.cue'), {
				scope: me,
				'mouseover':'mouseOver',
//				'mousemove':'mouseOver',
				'mouseout':'mouseOut'
			});

			me.mon(me.el.select('.cue .add-note-here'), {
				scope: me,
				'click': 'openEditor'
			});
		});
	},


	openEditor: function(e){
		console.log('show editor at: ', e.getTarget('.cue'));
		var cueEl = e.getTarget('.cue', null, true),
			cueStart = cueEl && cueEl.getAttribute('cue-start'),
			cueEnd = cueEl && cueEl.getAttribute('cue-end'),
			cueBox = cueEl.dom.getBoundingClientRect();

		this.fireEvent('show-editor', cueStart, cueEnd, cueEl.down('.add-note-here'));
	},


	mouseOver: function(e){
		if (this.suspendMoveEvents) {
			return;
		}

		var target = e.getTarget('.cue', null, true), me = this, box;
		if(target){
			box = target.down('.add-note-here');

			//clearTimeout(this.mouseLeaveTimeout);
			this.mouseLeaveTimeout = setTimeout(function () {
				//Deselect previous cue
				if(me.activeCueEl){
					me.activeCueEl.down('.add-note-here').addCls('hidden');
				}

				box.removeCls('hidden');
				me.activeCueEl = target;
			}, 50);
			console.log('should show the add note nib:', target);
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
			b = parseFloat(Ext.fly(t).getAttribute('data-time'));

		console.log('Jump to video to: ', b);
		this.fireEvent('jump-video-to', b, this);
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
