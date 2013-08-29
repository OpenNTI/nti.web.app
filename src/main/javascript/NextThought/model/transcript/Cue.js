Ext.define('NextThought.model.transcript.Cue', {
	extend: 'Ext.data.Model',

	fields: [
		{name: 'startTime', type: 'number'},
		{name: 'endTime', type: 'number'},
		{name: 'text', type: 'string'},
		{name: 'type', type: 'string'},

		//TODO: Do we need all these other attributes?
		{name: 'identifier', type: 'string'},
		{name: 'pauseOnExit', type: 'boolean', defaultValue: false},
		{name: 'snapToLines', type: 'boolean', defaultValue: true},
		{name: 'cueTree', type: 'auto'},
		{name: 'linePosition', type: 'number'},
		{name: 'alignment', type: 'string', defaultValue: 'middle'},
		{name: 'textPosition', type: 'number'}
	],

	statics: {
		fromParserCue: function (cue) {

			return new NextThought.model.transcript.Cue({
															'identifier':   cue.identifier,
															'startTime':    cue.startTime,
															'endTime':      cue.endTime,
															'alignment':    cue.alignment,
															'text':         cue.text,
															'linePosition': cue.linePosition,
															cueTree:        cue.cueTree,
															snapToLines:    cue.snapToLines,
															textPosition:   cue.textPosition,
															type:           cue.type
														});
		}
	}

});