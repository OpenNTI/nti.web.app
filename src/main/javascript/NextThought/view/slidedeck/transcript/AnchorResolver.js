Ext.define('NextThought.view.slidedeck.transcript.AnchorResolver', {
	requires: [
		'NextThought.model.anchorables.*'
	],
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
			start: this.createTranscriptPointer(startDomPointer, 'start', cueInfo.startCueId, cueInfo.startTime),
			end: this.createTranscriptPointer(endDomPointer, 'end', cueInfo.endCueId, cueInfo.endTime),
			seriesId: cueInfo.containerId
		})};
	},


	//TODO: this function is too customized for resolving time range to dom range in transcript.
	// It needs to be reworked to handle more of a general case( any time of time range to dom Range.)
	toDomRange: function(description, doc, cleanRoot, containerId){
		if(!description){
			return null;
		}

		var start = description.getStart() && description.getStart().seconds,
			end = description.getEnd() && description.getEnd().seconds, range, targetEl,
			utils = NextThought.view.slidedeck.transcript.AnchorResolver;

		//Conversions.
		start = utils.fromMillSecondToSecond(start);
		end = utils.fromMillSecondToSecond(end);

		if(cleanRoot){
			// Since we're anchoring to specific exact cue, we can find the node but checking the cue with the same start as ours.
			// TODO: we should probably search within time range.
			targetEl = Ext.fly(cleanRoot).down('.cue[cue-start='+start+']');
			if(targetEl){
				range = document.createRange();
				range.selectNodeContents(targetEl.dom);
			}
		}

		return range;
	},


	//TODO: this function is too customized for resolving time range to dom range in transcript.
	// It needs to be reworked to handle more of a general case( any time of time range to dom Range.)
	fromTimeRangeToDomRange: function(description, cueStore, container, docElement){
		if(!description){
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
		if(!cues || cues.getCount() === 0){ return null; }

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
			seconds: this.toMillSecond(time),
			role: role
		});
	},

	createTimePointer: function(role, time){
		return NextThought.model.anchorables.TimeContentPointer.create({
			seconds: this.toMillSecond(time),
			role:role
		});
	},

	fromMillSecondToSecond: function(millsec){
		return millsec / 1000;
	},

	toMillSecond: function(seconds){
		return seconds * 1000;
	}
});