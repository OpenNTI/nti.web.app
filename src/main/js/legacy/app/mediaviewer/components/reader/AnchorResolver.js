const Ext = require('extjs');

const TimeContentPointer = require('legacy/model/anchorables/TimeContentPointer');
const TimeRangeDescription = require('legacy/model/anchorables/TimeRangeDescription');
const TranscriptContentPointer = require('legacy/model/anchorables/TranscriptContentPointer');
const TranscriptRangeDescription = require('legacy/model/anchorables/TranscriptRangeDescription');
const lazy = require('legacy/util/lazy-require')
	.get('Anchors', () => require('legacy/util/Anchors'));

require('legacy/model/anchorables/ContentPointer');
require('legacy/model/anchorables/ContentRangeDescription');
require('legacy/model/anchorables/DomContentPointer');
require('legacy/model/anchorables/DomContentRangeDescription');
require('legacy/model/anchorables/ElementDomContentPointer');
require('legacy/model/anchorables/TextContext');
require('legacy/model/anchorables/TextDomContentPointer');


const AnchorResolver =
module.exports = exports = Ext.define('NextThought.app.mediaviewer.components.reader.AnchorResolver', {

	// TODO: While most of these could be just added to Anchors.js,
	// we think in the future, each type of anchor should have information about how to resolve its range.
	// These utils deal with time range resolution. This is just a first step.

	createRangeDescriptionFromRange: function (range, docElement, cueInfo) {
		if (!range) {
			return this.createRangeDescriptionFromTimeRange(cueInfo);
		}

		lazy.Anchors.cleanRangeFromBadStartAndEndContainers(range);
		range = lazy.Anchors.makeRangeAnchorable(range, docElement);
		if (!range || range.collapsed) {
			console.error('Anchorable range for provided range could not be found', range);
			Ext.Error.raise('Anchorable range for range could not be found');
		}

		var pureRange = lazy.Anchors.purifyRange(range, docElement),
			startDomPointer = lazy.Anchors.createPointer(pureRange, 'start'),
			endDomPointer = lazy.Anchors.createPointer(pureRange, 'end');

		return {description: TranscriptRangeDescription.create({
			start: this.createTranscriptPointer(startDomPointer, 'start', cueInfo.startCueId, cueInfo.startTime),
			end: this.createTranscriptPointer(endDomPointer, 'end', cueInfo.endCueId, cueInfo.endTime),
			seriesId: cueInfo.containerId
		})};
	},

	//TODO: this function is too customized for resolving time range to dom range in transcript.
	// It needs to be reworked to handle more of a general case( any time of time range to dom Range.)
	toDomRange: function (description, doc, cleanRoot) {
		if (!description || description.isEmpty) {
			return null;
		}

		var start = description.getStart() && description.getStart().seconds,
			// end = description.getEnd() && description.getEnd().seconds,
			range, targetEl,
			utils = AnchorResolver;

		//Conversions.
		start = utils.fromMillSecondToSecond(start);
		// end = utils.fromMillSecondToSecond(end);

		if (cleanRoot) {
			// Since we're anchoring to specific exact cue, we can find the node but checking the cue with the same start as ours.
			// TODO: we should probably search within time range.
			targetEl = Ext.fly(cleanRoot).down('.cue[cue-start=' + start + ']');
			if (targetEl) {
				range = document.createRange();
				range.selectNodeContents(targetEl.dom);
			}
		}

		return range;
	},

	/**
	 * Get the dom element given a timeRange description
	 * This function filters the cueStore to find cues at a given time
	 * given by the timeRange description.
	 * It also doesn't rely on the content being in the dom.
	 * This is used as a lightweight approach to get timeRange's dom element
	 * when conmputing the context of a note for instance.
	 *
	 * @param  {[TranscriptTimeRange]} description [the range of a given userdata]
	 * @param  {[Ext.Store]} cueStore	[store of cue]
	 * @param {NextThought.model.Video} video video model
	 * @return {[HTMLElement]}			 [html element containing the described time range]
	 */
	getDomElementForTranscriptTimeRange: function (description, cueStore, video) {
		if (!description || description.isEmpty) {
			// Notes that are anchored to the title, have any empty description.
			// So if the description or range is null, return the title element.
			return Ext.DomHelper.createDom({html: video.get('title')});
		}

		var start = description.getStart() && description.getStart().seconds,
			end = description.getEnd() && description.getEnd().seconds,
			cues,
			n, context;

		//Conversions.
		start = this.fromMillSecondToSecond(start);
		end = this.fromMillSecondToSecond(end);
		cues = this.getCuesWithinRange(cueStore, start, end);
		console.log('Cues within time range: ', start, end, cues);
		console.log('cues count: ', cues && cues.getCount());

		context = document.createElement('div');
		cues.each(function (cue) {
			n = document.createElement('span');
			n.innerHTML = cue.get('text');
			context.appendChild(n);
		});

		return context;
	},

	//TODO: this function is too customized for resolving time range to dom range in transcript.
	// It needs to be reworked to handle more of a general case( any time of time range to dom Range.)
	fromTimeRangeToDomRange: function  (description, cueStore, container, docElement) {
		if (!description || description.isEmpty) {
			return;
		}
		var start = description.getStart() && description.getStart().seconds,
			end = description.getEnd() && description.getEnd().seconds,
			cues,
			els = [], resultRange;

		//Conversions.
		start = this.fromMillSecondToSecond(start);
		end = this.fromMillSecondToSecond(end);
		cues = this.getCuesWithinRange(cueStore, start, end);

		console.log('Cues within time range: ', start, end, cues);
		console.log('cues count: ', cues && cues.getCount());
		if (!cues || cues.getCount() === 0) { return null; }

		cues.each(function (cue) {
			//XXX: This blows up, because: "invalid query selector"
			var el = Ext.fly(container).down('.cue[cue-start=' + cue.get('startTime') + ']');
			if (el) { els.push(el); }
		});

		if (!Ext.isEmpty(els)) {
			resultRange = (docElement || document).createRange();
			//FIXME: Needs to be smart and select all els but for now.
			resultRange.selectNodeContents(els[0].dom);
		}

		return resultRange;
	},

	getCuesWithinRange: function  (store, start, end) {
		function fn (item) {
			return (item.get('endTime') > 0) && (start.isFloatLessThanOrEqual(item.get('startTime')) && end.isFloatGreaterThanOrEqual(item.get('endTime')));
		}
		return store ? store.queryBy(fn, this) : null;
	},

	createRangeDescriptionFromTimeRange: function  (cueInfo) {
		var desc = TimeRangeDescription.create({
			start: this.createTimePointer('start', cueInfo.startTime),
			end: this.createTimePointer('end', cueInfo.endTime),
			seriesId: cueInfo.containerId
		});

		return {description: desc};
	},

	createTranscriptPointer: function  (rangePointer, role, cueId, time) {
		return TranscriptContentPointer.create({
			pointer: rangePointer,
			cueid: cueId,
			seconds: this.toMillSecond(time),
			role: role
		});
	},

	createTimePointer: function  (role, time) {
		return TimeContentPointer.create({
			seconds: this.toMillSecond(time),
			role: role
		});
	},

	fromMillSecondToSecond: function  (millsec) {
		return millsec / 1000;
	},

	toMillSecond: function  (seconds) {
		return seconds * 1000;
	}

}).create();
