const Ext = require('@nti/extjs');

const {isCourseContentModalOpen} = require('nti-web-app-lesson-items');
const PathActions = require('legacy/app/navigation/path/Actions');
const PageInfo = require('legacy/model/PageInfo');

const ContextStateStore = require('../StateStore');

require('legacy/app/video/VideoPlayer');


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
		this.ContextStore = ContextStateStore.getInstance();
		this.PathActions = PathActions.create();
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
					if (path[i] instanceof PageInfo) {
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
			me.videoplayer = Ext.widget('content-video-player', {
				// playlist: [me.video],
				video: me.video,
				renderTo: me.videoEl,
				playerWidth: me.WIDTH,
				width: me.WIDTH,
				floatParent: me,
				doNotAutoPlay: true
			});

			if (me.range) {
				pointer = me.range.start || {};
				startTimeSeconds = pointer.seconds / 1000; //They are actually millis not seconds
			}
			if (startTimeSeconds > 0) {
				me.videoplayer.jumpToVideoLocation(startTimeSeconds);
			}

			if (me.doNavigate && !isCourseContentModalOpen()) {
				me.isInPageContext()
					.catch(function () {
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
