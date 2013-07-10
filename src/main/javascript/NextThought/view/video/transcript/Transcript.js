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
			// TODO: Group by Sections defined in the parser. Right now we're only grouping by time Interval.
			function groupByTimeInterval(cueList, timeInterval){
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
			}


			var parser = new NextThought.webvtt.Transcript({
					input: c,
					ignoreLFs: true
				}),
				cueList = parser.parseWebVTT();

			return groupByTimeInterval(cueList, 30);
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
					{tag:'span', 'cue-start':'{startTime}', 'cue-end':'{endTime}', html:'{text}'}
				]
			}}
		]}
	])),


	initComponent: function(){
		this.callParent(arguments);
		this.loadTranscript();

		this.addEvents('jump-video-to');
		this.enableBubble(['jump-video-to']);
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
			var cueGroups = NextThought.view.video.transcript.Transcript.processTranscripts(text),
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
		});
	},


	timePointerClicked: function(e){
		var t  = e.getTarget(),
			b = parseFloat(Ext.fly(t).getAttribute('data-time'));

		console.log('Jump to video to: ', b);
		this.fireEvent('jump-video-to', b, this);
	}

});
