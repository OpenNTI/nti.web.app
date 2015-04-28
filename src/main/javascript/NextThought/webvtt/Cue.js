/*
 * Cue.js
 * This class defines a single WebVTT cue as specified by http://dev.w3.org/html5/webvtt/
 * @author Bryan Hoke
 */

Ext.define('NextThought.webvtt.Cue', {
	config: {
		// ID for the cue
		identifier: '',
		// Rendering options
		pauseOnExit: false,
		writingDirection: 'horizontal',
		snapToLines: true,
		linePosition: 'auto',
		textPosition: 50,
		size: 100,
		alignment: 'middle',
		// The cue payload
		text: '',
		// Timestamps, measured in seconds
		startTime: -1,
		endTime: -1,
		// Nested tree of sub-cues, if present
		cueTree: []
	},

	constructor: function(config) {
		this.subCues = [];

		this.initConfig(config);
	}

});
