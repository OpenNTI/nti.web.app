Ext.define('NextThought.app.context.types.Video', {

	requires: [
		'NextThought.model.transcript.TranscriptItem',
		'NextThought.app.slidedeck.media.Actions',
		'NextThought.app.slidedeck.transcript.AnchorResolver',
		'NextThought.app.context.components.Default',
		'NextThought.app.context.components.VideoContext',
		'NextThought.app.context.components.cards.*'
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


	/**
	 * Parse a video object and build the context component
	 * @param  {[Object]} obj [video object]
	 * 
	 * @return {[Promise]}     [promise that will resolve with an Ext.Component]
	 */
	parse: function(obj, kind) {
		var video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: obj.ntiid }, obj)),
			root = this.course && this.course.getContentRoots && this.course.getContentRoots()[0],
			transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, root),
			Resolver = NextThought.app.slidedeck.transcript.AnchorResolver,
			context, cmp, me = this, store;

		if (kind === 'card') {
			cmp = {
				xtype: 'context-video-card',
				type: me.self.type,
				video: video,
				transcript: transcript
			};
			return cmp;
		}

		return me.MediaActions.loadTranscript(transcript)
				.then(function(cueList) {
					store = me.__buildTranscriptStore(cueList);
					context = Resolver.getDomElementForTranscriptTimeRange(me.range, store);

					cmp = Ext.widget('context-video', {
						type: me.self.type,
						snippet: context,
						containerId: me.container,
						video: video,
						range: me.range
					});

					return Promise.resolve(cmp);
				});
	}
});