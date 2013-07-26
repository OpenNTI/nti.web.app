Ext.define('NextThought.view.slidedeck.transcript.AnchorResolver', {

	singleton: true,

	// TODO: While most of these could be just added to Anchors.js,
	// we think in the future, each type of anchor should have information about how to resolve its range.
	// These utils deal with time range resolution. This is just a first step.

	createRangeDescriptionFromRange: function(range, docElement, cueInfo){
		if(!range){
			return this.createRangeDescriptionFromTimeRange(cueInfo);
		}

		Anchors.cleanRangeFromBadStartAndEndContainers(range);
		range = Anchors.makeRangeAnchorable(range, docElement);
		if(!range || range.collapsed){
			console.error('Anchorable range for provided range could not be found', range);
			Ext.Error.raise('Anchorable range for range could not be found');
		}

		var pureRange = Anchors.purifyRange(range, docElement),
			startDomPointer = Anchors.createPointer(pureRange, 'start'),
			endDomPointer = Anchors.createPointer(pureRange, 'end'), s, e;

		return {description: NextThought.model.anchorables.TranscriptRangeDescription.create({
			start: Anchors.createTranscriptPointer(startDomPointer, 'start', cueInfo.startCueId, cueInfo.startTime),
			end: Anchors.createTranscriptPointer(endDomPointer, 'end', cueInfo.endCueId, cueInfo.endTime),
			seriesId: cueInfo.containerId
		})};
	},


	toDomRange: function(description, doc, cleanRoot, containerId){
		var start = description.getStart() && description.getStart().seconds,
			end = description.getEnd() && description.getEnd().seconds,
			seriesId = description.getSeriesId(),
			m = seriesId + '-cues', v, range, targetEl;

		if(cleanRoot){
			v = Ext.fly(cleanRoot).select('.content-video-transcript[data-desc]');
			v.each(function(e){
				// NOTE: one transcript can be divided into many views, since we're dividing transcripts based on slides.
				// So, find all subviews that have the same description 'm' as ours. Then, within a transcript view,
				// we'll get the first cue that matches ours. We could do more and check if its endTime matches ours as well.
				// To be refactored later; ~PM.
				if(e.getAttribute('data-desc') === m && Ext.fly(e).down('.cue[cue-start='+start+']')){
					targetEl = Ext.fly(e).down('.cue[cue-start='+start+']');
					return false;
				}
			});

			if(targetEl){
				range = document.createRange();
				range.selectNodeContents(targetEl.dom);
			}
		}

		return range;
	},


	fromTimeRangeToDomRange: function(description, cueStore, container, docElement){
		var start = description.getStart() && description.getStart().seconds,
			end = description.getEnd() && description.getEnd().seconds,
		    cues = this.getCuesWithinRange(cueStore, start, end),
			els = [], resultRange;

		console.log('Cues within time range: ', start, end, cues);
		console.log('cues count: ', cues.getCount());
		if(cues.getCount() === 0){ return null; }

		cues.each(function(cue){
			var el = Ext.fly(container).down('.cue[cue-start='+cue.get('startTime')+']');
			if(el){ els.push(el); }
		});

		if(!Ext.isEmpty(els)){
			resultRange = (docElement || document).createRange();
			//FIXME: Needs to be smart and select all els but for now.
			resultRange.selectNodeContents(els[0].dom);
		}

		return resultRange;
	},

	getCuesWithinRange: function(store, start, end){
		function fn(item){
			return (start <= item.get('startTime')) && ( item.get('endTime') <= end);
		}
		return store ? store.queryBy(fn, this) : null;
	},

	createRangeDescriptionFromTimeRange: function(cueInfo){
		var desc = NextThought.model.anchorables.TimeRangeDescription.create({
			start: this.createTimePointer('start', cueInfo.startTime),
			end: this.createTimePointer('end', cueInfo.endTime),
			seriesId: cueInfo.containerId
		});

		return {description:desc};
	},


	createTranscriptPointer: function(rangePointer, role, cueId, time){
		return NextThought.model.anchorables.TranscriptContentPointer.create({
			pointer: rangePointer,
			cueid: cueId,
			seconds: time,
			role: role
		});
	},

	createTimePointer: function(role, time){
		return NextThought.model.anchorables.TimeContentPointer.create({
			seconds:time,
			role:role
		});
	}
});