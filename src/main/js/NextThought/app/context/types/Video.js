Ext.define('NextThought.app.context.types.Video', {

	requires: [
		'NextThought.model.transcript.TranscriptItem',
		'NextThought.app.mediaviewer.Actions',
		'NextThought.app.mediaviewer.components.reader.AnchorResolver',
		'NextThought.app.context.components.Default',
		'NextThought.app.context.components.VideoContext',
		'NextThought.app.context.components.cards.*',
		'NextThought.app.context.components.list.Video',
		'NextThought.app.navigation.path.Actions'
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
			return obj && (obj.Class === 'Video' || obj instanceof NextThought.model.Video);
		}
	},

	constructor: function(config) {
		this.callParent(arguments);
		Ext.applyIf(this, config || {});
		this.MediaActions = NextThought.app.mediaviewer.Actions.create();
		this.PathActions = NextThought.app.navigation.path.Actions.create();
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


	__getBasePath: function(obj) {
		var me = this;

		return new Promise(function(fulfill, reject) {
			if (me.course && me.course.getContentRoots) {
				fulfill(me.course.getContentRoots()[0]);
			} else {
				me.PathActions.getPathToObject(me.contextRecord || obj)
					.then(function(path) {
						var course = path[0], p;

						if (course) {
							p = course.getContentRoots()[0];
						}
						fulfill(p);
					})
					.fail(reject);
			}
		});
	},


	/**
	 * Parse a video object and build the context component
	 * @param  {[Object]} obj [video object]
	 *
	 * @return {[Promise]}     [promise that will resolve with an Ext.Component]
	 */
	parse: function(obj, kind) {
		obj = obj.getData();

		var video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: obj.ntiid }, obj)),
			Resolver = NextThought.app.mediaviewer.components.reader.AnchorResolver,
			context, cmp, me = this, store, t;

		return this.__getBasePath(obj)
				.then(function(basePath) {
					t = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
					return Promise.resolve(t);
				})
				.fail(function() {
					t = NextThought.model.transcript.TranscriptItem.fromVideo(video);
					return Promise.resolve(t);
				})
				.then(function(transcript) {
					if (kind === 'card') {
						cmp = {
							xtype: 'context-video-card',
							type: me.self.type,
							video: video,
							transcript: transcript
						};
						return cmp;
					}

					if (kind === 'list') {
						return Ext.widget('context-video-list', {
							type: me.self.type,
							video: video,
							transcript: transcript,
							record: me.contextRecord
						});
					}

					return me.MediaActions.loadTranscript(transcript)
							.then(function(cueList) {
								store = me.__buildTranscriptStore(cueList);
								context = Resolver.getDomElementForTranscriptTimeRange(me.range, store, video);

								cmp = Ext.widget('context-video', {
									type: me.self.type,
									snippet: context,
									containerId: me.container,
									video: video,
									range: me.range,
									record: me.contextRecord,
									doNavigate: me.doNavigate.bind(me)
								});

								return Promise.resolve(cmp);
							})
							.fail(function(reason) {
								cmp = Ext.widget('context-video', {
									type: me.self.type,
									containerId: me.container,
									video: video,
									range: me.range,
									record: me.contextRecord,
									doNavigate: me.doNavigate.bind(me)
								});

								return cmp;
							});
				});
	}
});
