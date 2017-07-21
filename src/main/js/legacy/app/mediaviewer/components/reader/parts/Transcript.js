const Ext = require('extjs');
const RangeUtils = require('legacy/util/Ranges');
const {wait} = require('legacy/util/Promise');

require('legacy/app/mediaviewer/components/reader/mixins/AnnotationsMixin');

const Transcript = require('legacy/webvtt/Transcript');
const Cue = require('legacy/model/transcript/Cue');
const MediaViewerActions = require('legacy/app/mediaviewer/Actions');

const AnchorResolver = require('legacy/app/mediaviewer/components/reader/AnchorResolver');


module.exports = exports = Ext.define('NextThought.app.mediaviewer.components.reader.parts.Transcript', {
	extend: 'Ext.view.View',
	alias: 'widget.video-transcript',

	mixins: {
		transcriptItem: 'NextThought.app.mediaviewer.components.reader.mixins.AnnotationsMixin'
	},

	//	ui: 'content-launcher',
	cls: 'content-video-transcript',

	trackOver: true,
	overItemCls: 'over',
	isPresentationPartReady: false,

	statics: {
		processTranscripts: function (c) {
			const parser = new Transcript({
				input: c,
				ignoreLFs: true
			});

			return parser.parseWebVTT();
		}
	},

	renderSelectors: {
		contentEl: '.text-content'
	},

	itemSelector: '.row-item',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': '.', cn: [{
			tag: 'tpl', 'if': '!type', cn: {
				tag: 'span', cls: 'cue row-item', 'cue-start': '{startTime}', 'cue-end': '{endTime}', 'cue-id': '{identifier}', cn: [
					{tag: 'span', html: '{text}'},

					{tag: 'span', cls: 'control-container', cn: {
						cls: 'note-here-control-box add-note-here hidden', tag: 'span'
					}}
				]}
		},{
			tag: 'tpl', 'if': 'type', cn:
			{cls: 'row-item timestamp-container {type}', cn:
					{tag: 'a', cls: 'timestamp', html: '{%this.toTimeFormat(values,out)%}', 'data-time': '{startTime}'}
			}
		}]}
	]), {
		toTimeFormat: function (values, out) {
			var min = Math.floor((values.startTime || 0) / 60),
				sec = Math.round((values.startTime || 0) % 60);

			if (sec >= 60) { min++; sec = sec - 60; }//make sure seconds doesn't round to 60
			if (sec < 10) { sec = '0' + sec; }
			out.push(min + ':' + sec);
			return out;
		}
	}),

	initComponent: function () {
		this.callParent(arguments);
		this.mixins.transcriptItem.constructor.apply(this, arguments);
		this.enableBubble(['jump-video-to', 'presentation-part-ready', 'register-records', 'unregister-records']);

		this.MediaViewerActions = MediaViewerActions.create();
		this.__setContent();
	},

	containerIdForData: function () {
		var cid = this.transcript && this.transcript.get('associatedVideoId');
		if (!cid) {
			return null;
		}
		return {containerId: cid, doesNotParticipateWithFlattenedPage: true};
	},

	buildStore: function (cueList, filter) {
		var cues = [], s;
		Ext.each(cueList, function (c) {
			var m = Cue.fromParserCue(c);
			cues.push(m);
		});

		s = new Ext.data.Store({
			proxy: 'memory',
			sorters: [{
				property: 'startTime',
				direction: 'ASC'
			}]
		});

		s.loadData(cues);
		if (!Ext.isEmpty(filter) && Ext.isFunction(filter)) {
			s.filter([{filterFn: filter}]);
		}

	//		console.log('transcript	 expected starts to ', this.transcript.get('desired-time-start'), ', end at: ', this.transcript.get('desired-time-end'));
	//		console.log('first cue starts at ', s.data.items[0].get('startTime'), ', and last cue ends at: ', s.data.items[s.data.items.length-1].get('endTime'));
		return s;
	},

	getUserDataTimeFilter: function () {
		let start = this.transcript.get('desired-time-start');
		let end = this.transcript.get('desired-time-end');

		function fn (item) {
			var range = item.get('applicableRange'),
				startAnchorTime = range.start && range.start.seconds,
				endAnchorTime = range.end && range.end.seconds,
				utils = NextThought.app.mediaviewer.components.AnchorResolver;

			//Conversions
			startAnchorTime = utils.fromMillSecondToSecond(startAnchorTime);
			endAnchorTime = utils.fromMillSecondToSecond(endAnchorTime);

			return (startAnchorTime >= start) && (endAnchorTime <= end);
		}


		//TODO: some transcript/video don't have a endTime or it's set to 0. Need to adjust for this.
		return (start >= 0 && end > start) ? fn : null;
	},

	getTimeRangeFilter: function () {
		let start = this.transcript.get('desired-time-start');
		let end = this.transcript.get('desired-time-end');

		function fn (item) {
			if (item.get('type') === 'section') {
				// NOTE: For section cue, we may not have an endTime set. So just make sure that
				// it's start time is within the range of time we care about.
				return (item.get('startTime') >= start) && (item.get('startTime') <= end);
			}

			return (item.get('startTime') >= start) && (item.get('startTime') <= end);
		}


		//if they are both zero don't filter out any of the transcript
		if (start === 0 && end === 0) { return null; }

		//if start and end are a valid range filter out all the lines not between start and end
		return (start >= 0 && end >= start) ? fn : null;
	},

	__setContent: function () {
		var me = this;

		this.MediaViewerActions.loadTranscript(this.transcript)
			.then(function (cueList) {
				cueList = me.groupByTimeInterval(cueList, 30);
				me.store = me.buildStore(cueList, me.getTimeRangeFilter());
				me.bindStore(me.store);
				me.cueList = cueList;

				if (me.rendered) {
					me.refresh();
				}

				wait()
					.then(me.notifyReady.bind(me));
			})
			.catch(() => {
				if (this.switchToFull) {
					this.switchToFull();
				} else {
					console.log('No Method to switch to full video after transcript failed to load...');
				}

				this.notifyReady();
			});
	},

	groupByTimeInterval: function (cueList, timeInterval) {
		// TODO: Group by Sections defined in the parser. Right now we're only grouping by time Interval.
		var list = [],
			currentTime = this.transcript.get('desired-time-start') || (cueList[0] && cueList[0].startTime);

		list.push({type: 'section', startTime: currentTime, endTime: -1});
		Ext.each(cueList, function (t) {
			var endTime = t.endTime;
			if (endTime < currentTime + timeInterval) {
				list.push(t);
			}
			else {
				//insert a new section entry.
				list.push({type: 'section', startTime: t.startTime, endTime: -1});
				list.push(t);
				currentTime += timeInterval;
			}
		});

		return list;
	},

	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			content: this.content
		});
	},

	afterRender: function () {
		this.callParent(arguments);
		this.el.unselectable();

		if (this.isPresentationPartReady) {
			this.onViewReady();
		}
		else {
			this.on('presentation-part-ready', this.onViewReady, this);
		}

		this.on({
			scope: this,
			'beforeselect': function () {return false;},
			'itemmouseenter': 'mouseOver',
			'itemmouseleave': 'mouseOut',
			'itemclick': 'cueSelected',
			'beforeitemclick': function (sel, rec) {
				return rec.get('type') !== 'section';
			}
		});
	},

	onViewReady: function () {
		var me = this;
		me.transcriptReady = true;

		me.mon(me.el.select('.timestamp-container'), {
			scope: me,
			'click': 'timePointerClicked'
		});

		me.mon(me.el, {
			scope: me,
			'mouseup': 'showContextMenu'
		});
	},

	positionAnnotationNibs: function () {
		var me = this;
		// Set the top position of note widget nibs.
		Ext.each(this.el.query('.cue .add-note-here'), function (nib) {
			var cueEl = Ext.fly(nib).up('.cue'),
				//outerOffset = parentEl ?	0 : 0,
				innerOffset = me.el.getY(),
				//y = cueEl.getY() - outerOffset - innerOffset;
				y = cueEl.getY() - innerOffset;
			y = y + 'px';
			Ext.fly(nib).up('.control-container').setStyle({'top': y});
		});
	},

	cueSelected: function (view, record, item, index, e) {
		if (!record) { return; }
		if (e.getTarget('.add-note-here')) {
			this.openEditor.apply(this, arguments);
			return;
		}

		var start = record.get('startTime'),
			videoId = this.transcript.get('associatedVideoId');

		console.log('Jump to video ', videoId, ' to : ', start);
		this.fireEvent('jump-video-to', videoId, start);
	},

	openEditor: function (view, record, item) {
		var cueEl = Ext.get(item),
			cueStart = record.get('startTime'),
			cueEnd = record.get('endTime'),
			sid = record.get('identifier'),
			cid = this.transcript.get('associatedVideoId'), data;

		cueEl.addCls('active');
		data = { startTime: cueStart, endTime: cueEnd, startCueId: sid, endCueId: sid, containerId: cid, userDataStore: this.userDataStore };
		this.fireEvent('show-editor', data, cueEl.down('.add-note-here'), function () {
			cueEl.removeCls('active');
		});
	},

	getAnchorResolver: function () {
		return AnchorResolver;
	},

	getCueStore: function () {
		return this.store;
	},

	openEditorInline: function () {
		this.contextMenu.hide();
		this.fireEvent('show-editor-inline', this.contextMenu.cueData, this.contextMenu.position);
	},

	buildContextMenu: function () {
		var me = this,
			menu = Ext.widget('menu', {
				closeAction: 'destroy',
				minWidth: 150,
				defaults: {ui: 'nt-annotaion', plain: true }
			});

		menu.add({
			text: 'Save Highlight',
			handler: function () {
				console.warn('No support for highlights yet');
			},
			disabled: true
		});

		menu.add({
			text: 'Add Note',
			handler: function () {
				me.openEditorInline();
			}
		});
		this.contextMenu = menu;
	},

	showContextMenu: function (e) {
		e.stopEvent();

		if (!this.contextMenu) {
			this.buildContextMenu();
		}
		var xy = e.getXY(),
			sel = window.getSelection(),
			range = (sel.rangeCount > 0) && (sel.getRangeAt(0).cloneRange()),
			cueData = {},
			viewBox = this.getBox();

		// If no selection, return.
		if (sel.isCollapsed) { return; }

		Ext.apply(cueData, this.getCueInfoFromRange(range) || {});
		this.contextMenu.position = [viewBox.width + 50, xy[1] - 10];
		console.log(' Desired editor position: ', this.contextMenu.position);
		this.contextMenu.cueData = cueData;

		// Show menu
		console.log('Should show context menu');
		this.contextMenu.showAt(xy);
		Ext.defer(function () { sel.addRange(range); }, 10, this);
	},

	getCueInfoFromRange: function (range) {
		if (!range || range.isCollapsed) { return null; }

		var d = range.cloneContents(),
			cues = d.querySelectorAll('.cue'),
			startCue = cues && cues[0],
			endCue = cues && Ext.Array.slice(cues, -1).first(),
			startTime, endTime, sid, eid, cid;

		startTime = startCue && startCue.getAttribute('cue-start');
		endTime = endCue && endCue.getAttribute('cue-end');
		sid = startCue && startCue.getAttribute('cue-id');
		eid = endCue && endCue.getAttribute('cue-id');
		cid = this.transcript.get('associatedVideoId');

		return { startTime: startTime, endTime: endTime, range: range, startCueId: sid, endCueId: eid, containerId: cid, userDataStore: this.userDataStore };
	},

	mouseOver: function (view, record, item) {
		var box = item && item.querySelector('.add-note-here'),
			add = Ext.get(box),
			currentDivs = this.el.query('.add-note-here:not(.hidden)');

		if (this.suspendMoveEvents || !item || !add) { return; }

		clearTimeout(this.mouseEnterTimeout);

		this.mouseLeaveTimeout = setTimeout(function () {
			add.removeCls('hidden');

			Ext.each(currentDivs, function (cur) {
				if (cur !== add.dom) {
					Ext.fly(cur).addCls('hidden');
				}
			});
		}, 100);
	},

	mouseOut: function (view, record, item) {
		var box = item && item.querySelector('.add-note-here'),
			add = Ext.get(box);

		if (this.suspendMoveEvents || !item || !add) { return; }

		if (!add.hasCls('hidden')) {
			this.mouseEnterTimeout = setTimeout(function () {
				if (add && !add.hasCls('hidden')) {
					add.addCls('hidden');
				}
			}, 500);
		}
	},

	timePointerClicked: function (e) {
		var t = e.getTarget(),
			b = parseFloat(Ext.fly(t).getAttribute('data-time')),
			videoId = this.transcript.get('associatedVideoId');

		console.log('Jump to video ', videoId, ' to : ', b);
		this.fireEvent('jump-video-to', videoId, b);
	},

	syncTranscriptWithVideo: function (videoState) {
		if (Ext.isEmpty(videoState)) { return; }

		var currentTime = (videoState || {}).time, currentCue, s;

		s = Ext.Array.filter(this.cueList, function (cue) {
			return (currentTime >= cue.startTime && currentTime < cue.endTime);
		});

		//console.log(s);
		currentCue = s && s[0];
		this.selectNewCue(currentCue);
	},

	isTimeWithinTimeRange: function (time) {
		var tRange = this.getTimeRange();
		return tRange.start <= time && time <= tRange.end;
	},

	getElementAtTime: function (seconds) {
		var cueStore = this.getCueStore(),
			cues = cueStore && cueStore.queryBy(function (rec) {
				return rec.get('startTime') <= seconds && seconds <= rec.get('endTime');
			}), sEl, cue;

		if (!cues || cues.getCount() === 0) {
			return null;
		}
		cue = cues.getAt(0);
		sEl = this.el.down('.cue[cue-start=' + cue.get('startTime') + ']');
		return sEl;
	},

	getTimeRange: function () {
		var t = this.transcript,
			start = t.get('desired-time-start'),
			end = t.get('desired-time-end'),
			node;

		if (!start || start < 0) {
			node = this.getCueStore().first();
			start = node && node.get('startTime');
		}

		// if the end is not set, set it to be the endTime of the last cue. CueStore should be sorted.
		if (Ext.isEmpty(end) || end <= 0) {
			node = this.getCueStore().last();
			end = node && node.get('endTime');
		}
		return {start: start, end: end};
	},

	selectNewCue: function (newCue) {
		if (newCue === this.currentCue || Ext.isEmpty(newCue)) { return; }

		var c = this.currentCue,
			prevCueEl = c && this.el.down('[cue-start=' + c.startTime + '][cue-end=' + c.endTime + ']'),
			newCueEl = this.el.down('[cue-start=' + newCue.startTime + '][cue-end=' + newCue.endTime + ']');

		if (prevCueEl) {
			prevCueEl.removeCls('active');
		}
		if (newCueEl) {
			newCueEl.addCls('active');
		}

		this.currentCue = newCue;
	},

	getDocumentElement: function () {
		return this.el.dom.ownerDocument;
	},

	getCleanContent: function () {
		return this.el.dom;
	},

	domRangeForRecord: function (rec) {
		var cueStore = this.getCueStore();

		return AnchorResolver.fromTimeRangeToDomRange(rec.get('applicableRange'), cueStore, this.el);
	},

	getDomContextForRecord: function (r) {
		return RangeUtils.getContextAroundRange(r.get('applicableRange'), this.getDocumentElement(), this.getCleanContent(), r.get('ContainerId'));
	}
});
