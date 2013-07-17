Ext.define('NextThought.view.video.transcript.Transcript',{
	extend:'Ext.Component',
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
		},

		buildStore: function(cueList){
			var cues = [], s;
			Ext.each(cueList, function(c){
				var m = NextThought.model.Cue.fromParserCue(c);
				cues.push(m);
			});

			s = new Ext.data.Store({proxy:'memory'});
			s.add(cues);
			return s;
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
						{tag: 'span', cls:'add-note-here', cn:{cls:'note-here-control-box hidden', tag:'span'}}
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
			expectedContentType: this.data.get('mimeType'),
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
			currentTime = 0;

		Ext.each(cueList, function(t){
			var endTime = t.getEndTime();
			if(endTime < currentTime + timeInterval){
				tempGroup.push(t);
			}
			else{
				//Close group and start  a new one.
				groups.push(tempGroup);
				tempGroup = [];
				//Push the current t as the first argument.
				tempGroup.push(t);
				currentTime += timeInterval;
			}
		});

		return groups;
	},


	getTranscriptJsonUrl: function(){
		return this.data.get('basePath') + this.data.get('jsonUrl');
	},


	getTranscriptUrl: function(){
		return this.data.get('basePath') + this.data.get('url');
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
		//Allow text selections
		this.el.selectable();

		this.on('transcript-ready', function(){
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
			})
		});
	},


	openEditor: function(e){
		console.log('show editor at: ', e.getTarget('.cue'));
		var cueEl = e.getTarget('.cue', null, true),
			cueStart = cueEl && cueEl.getAttribute('cue-start'),
			cueEnd = cueEl && cueEl.getAttribute('cue-end'),
			cueBox = cueEl.dom.getBoundingClientRect(),
			data = {startTime: cueStart, endTime: cueEnd, range:null};


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
		this.contextMenu.position = [ viewBox.width - 60, xy[1] - viewBox.y - 20];
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
			endCue = cues &&  Ext.Array.slice(cues, -1).first(), startTime, endTime;

		startTime = startCue && startCue.getAttribute('cue-start');
		endTime = endCue && endCue.getAttribute('cue-end');

		return {startTime: startTime, endTime:endTime, range:range};
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
					me.activeCueEl.down('.note-here-control-box').addCls('hidden');
				}

				box.down('.note-here-control-box').removeCls('hidden');
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
