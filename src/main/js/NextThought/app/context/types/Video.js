Ext.define('NextThought.app.context.types.Video', {

	requires: [
		'NextThought.model.transcript.TranscriptItem',
		'NextThought.app.slidedeck.media.Actions',
		'NextThought.app.slidedeck.transcript.AnchorResolver',
		'NextThought.app.context.components.Card',
		'NextThought.app.context.components.VideoCard',
		'NextThought.app.context.components.Default'
	],

	videoPlayerTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ cls: 'curtain content-video-curtain', cn: [
			{ cls: 'ctr', cn: [
				{ cls: 'play', cn: [
					{cls: 'blur-clip', cn: {cls: 'blur'}},
					{ cls: 'label', 'data-qtip': 'Play' }
				]}
			]}
		]}
	])),

	statics: {
		type: 'video',

		canHandle: function(obj) {
			return obj && obj.Class === 'Video';
		}
	},

	constructor: function(config){
		this.callParent(arguments);
		Ext.applyIf(this, config || {});
		this.MediaActions = NextThought.app.slidedeck.media.Actions.create();
	},

	__buildTranscriptStore: function(vttCueList) {
		var cuesList = [], s;

		Ext.each(vttCueList, function(c) {
			var m = NextThought.model.transcript.Cue.fromParserCue(c);
			cuesList.push(m);
		});

		s = new Ext.data.Store({
					proxy: 'memory',
					model: 'NextThought.model.transcript.Cue',
					data: cuesList,
					sorters: [{
						property: 'startTime',
						direction: 'ASC'
					}]
				});

		return s;
	},

	__buildVideoPosterElement: function(video) {
		var d = document.createElement('div'),
			t = this.videoPlayerTpl.append(d), o, 
			src = video && video.get('sources')[0].poster;

		o = Ext.fly(t).setStyle({
				backgroundImage: 'url(' + src + ')',
				backgroundSize: '640px',
				backgroundPosition: '0 0'
			});

		return o.dom;
	},


	/**
	 * Parse a video object and build the context component
	 * @param  {[Object]} obj [video object]
	 * 
	 * @return {[Promise]}     [promise that will resolve with an Ext.Component]
	 */
	parse: function(obj, kind) {
		var video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: obj.ntiid }, obj)),
			transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video),
			Resolver = NextThought.app.slidedeck.transcript.AnchorResolver,
			context, cmp, me = this, store;

		if (kind === 'card') {
			cmp = Ext.widget('context-video-card', {
				type: me.self.type,
				video: video,
				transcript: transcript
			});

			return Promise.resolve(cmp);
		}

		return me.MediaActions.loadTranscript(transcript)
				.then(function(cueList) {
					store = me.__buildTranscriptStore(cueList);
					context = Resolver.getDomElementForTranscriptTimeRange(me.range, store);

					cmp = Ext.widget('context-default', {
						type: me.self.type,
						snippet: context,
						fullContext: me.__buildVideoPosterElement(video),
						containerId: me.container
					});

					return Promise.resolve(cmp);
				});
	}
});