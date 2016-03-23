var Ext = require('extjs');
var SharingUtils = require('../../../../../util/Sharing');
var MixinsAnnotationsMixin = require('../mixins/AnnotationsMixin');
var UserdataActions = require('../../../../userdata/Actions');
var MediaviewerStateStore = require('../../../StateStore');


module.exports = exports = Ext.define('NextThought.app.mediaviewer.components.reader.parts.Slide', {
	extend: 'Ext.Component',
	alias: 'widget.slide-component',

	mixins: {
		transcriptItem: 'NextThought.app.mediaviewer.components.reader.mixins.AnnotationsMixin'
	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn: [
			{tag: 'img', cls: 'slide'},
			{tag: 'span', cls: 'add-note-here', cn: {cls: 'note-here-control-box hidden', tag: 'span'}}
			//			{cls: 'left', cn:[{cls: 'prev'}]},
	  //			{cls: 'right',cn:[{cls: 'next'}]}
		]}
	]),

	contextTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn: [
			{tag: 'img', src: '{image}'}
		]}
	]),

	ui: 'slide',

	renderSelectors: {
		slideImage: 'img.slide',
		createNoteEl: '.add-note-here'
	//		next: '.next',
	//		prev: '.prev'
	},

	initComponent: function() {
		this.callParent(arguments);

		this.mixins.transcriptItem.constructor.apply(this, arguments);
		this.enableBubble(['register-records', 'unregister-records']);
		this.UserDataActions = NextThought.app.userdata.Actions.create();
		this.MediaViewerStore = NextThought.app.mediaviewer.StateStore.getInstance();
	},

	containerIdForData: function() {
		return this.slide && this.slide.getId();
	},

	afterRender: function() {
		this.callParent(arguments);

		var slide = this.slide, i, me = this;
		if (slide) {
			i = this.slideImage.dom;
			i.onload = Ext.bind(me.finishedLoadingImage, me);
			i.onerror = Ext.bind(me.finishedLoadingImage, me);
			this.slideImage.set({src: slide.get('image')});

			this.mon(this.el, {
				scope: this,
				'mouseover': 'onMouseOver',
				'mouseout': 'onMouseOut'
			});

			this.mon(this.createNoteEl, {
				scope: this,
				'click': 'openNoteEditor'
			});

		}
	},

	finishedLoadingImage: function() {
		this.notifyReady();
	},

	openNoteEditor: function(e) {
		var data = {startTime: this.slide.get('video-start'), endTime: this.slide.get('video-end')};

		data.isDomRange = true;
		data.range = null;
		data.containerId = this.slide.getId();
		data.userDataStore = this.userDataStore;
		this.fireEvent('show-editor', data, e.getTarget('.add-note-here', null, true));
		wait()
			.then(this.setEditorDefaultSharing.bind(this));
	},

	setEditorDefaultSharing: function() {
		var pageInfo = this.slide.pageInfo,
			pid = pageInfo && pageInfo.getId(),
			reader = this.up('slidedeck-transcript'),
			course = reader && reader.currentBundle || this.slide.courseBundle,
			me = this;

		if (!pid || !course) { return; }

		me.MediaViewerStore.getSharingPreferences(pid, course)
			.then(function(prefs) {
				var sharing = prefs && prefs.sharing,
					sharedWith = sharing && sharing.sharedWith;

				return SharingUtils.sharedWithToSharedInfo(SharingUtils.resolveValue(sharedWith), course);
			})
			.then(function(shareInfo) {
				if (me.noteOverlay && me.noteOverlay.editor) {
					me.noteOverlay.editor.setSharedWith(shareInfo);
				}
			});
	},

	onMouseOver: function(e) {
		var t = e.getTarget('.x-component-slide', null, true),
			box = t && t.down('.add-note-here'), me = this,
			current = this.el.parent().down('.note-here-control-box:not(.hidden)');

		if (this.suspendMoveEvents || !t || !box) { return; }

		clearTimeout(this.mouseEnterTimeout);

		this.mouseLeaveTimeout = setTimeout(function() {
			box.down('.note-here-control-box').removeCls('hidden');
			if (current && current !== box.down('.note-here-control-box')) {
				current.addCls('hidden');
			}
			me.activeCueEl = t;
		}, 100);

	},

	onMouseOut: function(e) {
		var target = e.getTarget(null, null, true),
			t = target && target.is('.x-component-slide'),
			box = t && target.down('.add-note-here'), me = this;

		if (this.suspendMoveEvents || !target || !box) { return; }

		//clearTimeout(this.mouseLeaveTimeout);

		if (!box.down('.note-here-control-box').hasCls('hidden')) {
			this.mouseEnterTimeout = setTimeout(function() {
				if (box && !box.down('.note-here-control-box').hasCls('hidden')) {
					box.down('.note-here-control-box').addCls('hidden');
				}
				delete me.activeCueEl;
			}, 500);
		}
	},

	getAnchorResolver: function() {
		return Anchors;
	},

	createDomRange: function() {
		var range = document.createRange(),
			el = this.el.down('img');

		if (el) { range.selectNode(el.dom); }
		return range;
	},

	isTimeWithinTimeRange: function(time) {
		var start = this.slide.get('video-start'),
			end = this.slide.get('video-end');

		return start <= time && time <= end;
	},

	getElementAtTime: function(time) {
		return this.slideImage;
	},

	wantsRecord: function(rec) {
		var anchorResolver = this.getAnchorResolver(),
			domFrag = this.slide.get('dom-clone'),
			containerId = rec.get('ContainerId'),
			result = this.slide.getId() === containerId;

		if (!result) {
			result = anchorResolver.doesContentRangeDescriptionResolve(rec.get('applicableRange'), domFrag);
		}

		return result;
	},

	domRangeForRecord: function(rec) {
		return this.createDomRange();
	},

	getDomContextForRecord: function(r) {
		return Ext.clone(this.el.down('img').dom);
	}
});
