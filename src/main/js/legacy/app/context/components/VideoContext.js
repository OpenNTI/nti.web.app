var Ext = require('extjs');
var ContextStateStore = require('../StateStore');
var PathActions = require('../../navigation/path/Actions');
var VideoVideo = require('../../video/Video');


module.exports = exports = Ext.define('NextThought.app.context.components.VideoContext', {
	extend: 'Ext.Component',
	alias: 'widget.context-video',
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

	initComponent: function () {
		this.callParent(arguments);
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
		this.PathActions = NextThought.app.navigation.path.Actions.create();
	},

	isInContext: function () {
		var context = this.ContextStore.getContext(),
			currentContext = context && context.last(),
			contextRecord = currentContext && currentContext.obj,
			currentCmp = currentContext && currentContext.cmp, inContext;

		if (currentCmp && currentCmp.containsId) {
			inContext = currentCmp.containsId(contextRecord, this.containerId);
		}
		return inContext || contextRecord && contextRecord.get('NTIID') === this.containerId;
	},

	isInPageContext: function () {
		var context = this.ContextStore.getContext(),
			currentContext = context && context.last(),
			contextRecord = currentContext && currentContext.obj;

		if (!contextRecord || !contextRecord.getId()) {
			return Promise.reject();
		}

		return this.PathActions.getPathToObject(this.record)
			.then(function (path) {
				var pageInfo, i;

				for (i = path.length - 1; i >= 0; i--) {
					if (path[i] instanceof NextThought.model.PageInfo) {
						pageInfo = path[i];
						break;
					}
				}

				if (pageInfo && pageInfo.getId() === contextRecord.getId()) {
					return Promise.resolve();
				}

				return Promise.reject();
			});
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this,
			startTimeSeconds, pointer;

		if (me.isInContext()) {
			me.videoEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			me.videoEl.hide();
		} else {
			me.videoplayer = Ext.widget('content-video-navigation', {
				playlist: [me.video],
				renderTo: me.videoEl,
				playerWidth: me.WIDTH,
				width: me.WIDTH,
				floatParent: me
			});

			if (me.range) {
				pointer = me.range.start || {};
				startTimeSeconds = pointer.seconds / 1000; //They are actually millis not seconds
			}
			if (startTimeSeconds > 0) {
				me.videoplayer.setVideoAndPosition(me.videoplayer.currentVideoId, startTimeSeconds);
			}

			if (me.doNavigate) {
				me.isInPageContext()
					.fail(function () {
						me.seeMoreEl.removeCls('hidden');
						me.mon(me.seeMoreEl, 'click', me.doNavigate.bind(me, me.record));
					});
			}
		}

		if (me.snippet) {
			me.textEl.appendChild(me.snippet);
		}
	}
});
