Ext.define('NextThought.app.context.components.VideoContext', {
	extend: 'Ext.Component',
	alias: 'widget.context-video',

	requires: [
		'NextThought.app.context.StateStore',
		'NextThought.app.video.Video'
	],

	cls: 'context-video',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'video'},
		{cls: 'content', cn: [
			{cls: 'text'}
		]},
		{cls: 'see-more hidden', html: 'Read More'}
	]),

	WIDTH: 512,

	renderSelectors: {
		videoEl: '.video',
		textEl: '.content .text',
		seeMoreEl: '.see-more'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},


	isInContext: function() {
		var context = this.ContextStore.getContext(),
			currentContext = context && context.last(),
			contextRecord = currentContext && currentContext.obj;

		return contextRecord && contextRecord.get('NTIID') === this.containerId;
	},


	afterRender: function() {
		this.callParent(arguments);

		var startTimeSeconds, pointer;

		if (this.isInContext()) {
			this.videoEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			this.videoEl.hide();
		}
		else {
			this.videoplayer = Ext.widget('content-video-navigation', {
				playlist: [this.video],
				renderTo: this.videoEl,
				playerWidth: this.WIDTH,
				width: this.WIDTH,
				floatParent: this
			});

			if (this.range) {
				pointer = this.range.start || {};
				startTimeSeconds = pointer.seconds / 1000; //They are actually millis not seconds
			}
			if (startTimeSeconds > 0) {
				this.videoplayer.setVideoAndPosition(this.videoplayer.currentVideoId, startTimeSeconds);
			}

			if (this.doNavigate) {
				this.seeMoreEl.removeCls('hidden');
				this.mon(this.seeMoreEl, 'click', this.doNavigate.bind(this, this.record));
			}
		}

		if (this.snippet) {
			this.textEl.appendChild(this.snippet);
		}
	}
});
