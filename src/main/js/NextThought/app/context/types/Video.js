Ext.define('NextThought.app.context.types.Video', {

	requires: [
		'NextThought.model.transcript.TranscriptItem',
		'NextThought.app.slidedeck.media.Actions',
		'NextThought.app.slidedeck.transcript.AnchorResolver',
		'NextThought.app.context.components.Card'
	],

	statics: {
		type: 'video',

		canHandle: function(obj) {
			return obj && obj.Class === 'Video';
		}
	},

	constructor: function(config){
		this.callParent(arguments);
		// this.range = config.range;
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
	 * @return {[Promise]}     [promise that will resolve with an Ext.Component]
	 */
	parse: function(obj) {
		var video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: obj.ntiid }, obj)),
			transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video),
			Resolver = NextThought.app.slidedeck.transcript.AnchorResolver,
			context, cmp, me = this, store;

		return me.MediaActions.loadTranscript(transcript)
				.then(function(cueList) {
					store = me.__buildTranscriptStore(cueList);
					context = Resolver.getDomElementForTranscriptTimeRange(me.range, store);

					cmp = Ext.widget('context-card', {
						type: me.self.type,
						range: context,
						html: context,
						containerId: me.container
					});

					return Promise.resolve(cmp);
				});
	}
});