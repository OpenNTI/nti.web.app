/*
 * Transcript.js
 * This class defines an array of headers and an array of cues which are parsed from a WebVTT file, as well as methods for parsing.
 * @author Bryan Hoke
 */

Ext.define('NextThought.webvtt.Transcript', {
	requires:['NextThought.model.transcript.Cue'],

	/*@private
	 * RegExps which are used throughout the program.
	 */
	regexp: {
		// Matches everything except a line break
		reNotLF: /[^\u000a]*/,
		// Matches a sequence of line breaks
		reLF: /(\u000a)*/,
		// Matches text that contains "-->"
		reArrow: /.*-->.*/,
		// Matches a sequence of white space
		reWS: /(\s)*/,
		// Matches a digit
		reDigit: /\d/,
		// Matches a sequence of digits
		reDigits: /(\d)+/,
		// Matches text that contains a colon
		reColon: /.*:.*/,
		// Matches sequences which contain characters other than -, %, or digits
		reNotHyPerDigits: /.*[^\u002d\u0025\d].*/,
		// Matches sequences which do not contain any digits
		reNoDigits: /.*\D.*/,
		// Matches sequences in which a character other than the first is a -
		reFollowingHyphen: /\u002d?.*\u002d.*/,
		// Matches sequences in which a character other than the last is a %
		reLeadingPercent: /.*\u0025.*\u0025?/,
		// Matches sequences in which the first character is a -
		reHyphenFirst: /^\u002d/,
		// Matches sequences in which the last character is a %
		rePercentLast: /\u0025$/,
		// Matches (possibly signed) numbers without a trailing percent
		reSignedNumbersNoTail: /-?(\d)*/,
		// Matches sequences which contain characters other than percents and digits
		rePerDigits: /.*[^\u0025\d].*/
	},
	/*@private
	 * Used to store variables used for scratchwork and which are no longer needed after the Transcript is created
	 */
	scratch: {
		// 2. Pointer into fileContent
		position: 0,
		// 3. Used to buffer lines
		line: '',
		// Used to direct code execution by indicating when certain steps can be skipped
		alreadyCollectedLine: false,
		// Indicates when the parser is complete
		halt: false,
		// Indicates the current line number
		lineNo: 0,
		// Stores the text to be added to a cue
		cueText: '',
		// A cue that is being parsed out
		cue: null,
		// The content of the WebVTT file that is being parsed
		fileContent: '',
		// Whether line feeds in cue text should be ignored
		ignoreLFs: false
	},


	/*@private
	 * Used to signal that the parser is finished
	 */
	signalHalt: function() {
		//        console.debug('End');
		this.scratch.halt = true;
		return false;
	},


	/*@private
	 * Used to signal that an error has occurred
	 */
	signalError: function(msg){
		console.error(msg);
		Ext.Error.raise({
			message: msg,
			lineNumber: this.scratch.lineNo
		});
	},


	/*@private
	 * Scans text matching a RegExp in fileContent starting at position and stores the result in line.<br>
	 * Increases position by the length of the matched string.<br>
	 * @param re The RegExp to match
	 * @param canBeEmpty If this is false, throw an error if there is no match. Otherwise sets line to the empty string.
	 */
	scan: function(re, canBeEmpty){
		var scratch= this.scratch,
			match = re.exec(scratch.fileContent.substr(scratch.position))[0];

		if (match !== null) {
			scratch.line = match;
			scratch.position += scratch.line.length;
		} else {
			if (canBeEmpty) {
				scratch.line = '';
			} else {
				this.signalError('Expected '+re+' at line '+scratch.lineNo);
			}
		}
	},


	/*@private
	 * Skips text matching a RegExp in fileContent starting at position.<br>
	 * Increases position by the length of the matched string.<br>
	 * @param canBeEmpty If this is false, throw an error if there is no match
	 * @param re The RegExp to match
	 */
	skip: function(re, canBeEmpty){
		var scratch = this.scratch,
			match = re.exec(scratch.fileContent.substr(scratch.position))[0];

		if (match !== null) {
			scratch.position += match.length;
		} else if (!canBeEmpty) {
			this.signalError('Expected '+re+' at line '+scratch.lineNo);
		}
	},


	/*@private
	 * Pre-processes the WebVTT file contents in the following way:<br>
	 * - Replaces all NULL characters with REPLACEMENT CHARACTERs<br>
	 * - Replaces each CARRIAGE RETURN LINE FEED pair with a LINE FEED<br>
	 * - Replaces each CARRIAGE RETURN with a LINE FEED
	 * @param input The contents of the WebVTT file
	 * @return The pre-processed contents of the WebVTT file
	 */
	preProcess: function(input){
		var output = input; // Unnecessary?
		var reNull = /\u0000/g;
		var reCRLF = /\u000d\u000a/g;
		var reCR = /\u000d/g;

		output = output.replace(reNull, '\ufffd');
		output = output.replace(reCRLF, '\u000a');
		output = output.replace(reCR, '\u000a');

		return output;
	},


	/*@private
	 * Verifies that the WebVTT file has a proper file signature.<br>
	 * Throws an error if it does not.
	 */
	verifySignature: function(){
		var regexp = this.regexp,
			scratch = this.scratch,
			errMsg = 'Improper file signature: must be "WEBVTT"';

		// 4. Collect sequence of characters that are not line feeds
		this.scan(regexp.reNotLF);
		// 5. If too short
		if (scratch.line.length < 6) {
			this.signalError(errMsg);
		}
		// 6. If wrong string
		else if (scratch.line.length === 6) {
			if (scratch.line !== 'WEBVTT') {
				this.signalError(errMsg);
			}
			// 7. If not WEBVTT followed by a space/tab
			else if (scratch.line.length > 6) {
				if (scratch.line.substr(0, 6) !== 'WEBVTT') {
					this.signalError(errMsg);
				}
				// 7th char must be a space or a tab
				if (scratch.line.charCodeAt(6) !== 32 || scratch.line.charCodeAt(6) !== 9) {
					this.signalError(errMsg);
				}
			}
		}
	},


	/*@private
	 * Collects header string(s)
	 * @return True if this should repeat, false if not
	 */
	getHeader: function(){
		var regexp = this.regexp,
			scratch = this.scratch;

		// 10. Collect header string
		this.scan(regexp.reNotLF, true);
		// 11. Halt if we're at the end of the file content
		if (scratch.position > scratch.fileContent.length) {
			this.headers.push(scratch.line);
			//            console.debug('Header collected: '+scratch.line);
			return this.signalHalt();
		}
		// 12. Advance past current line feed
		scratch.position++;
		// 13. Start parsing a cue if we're reading a timing
		if (regexp.reArrow.test(scratch.line)) {
			scratch.alreadyCollectedLine = true;
			// position += line.length;
			return false;
		}
		// 14. Move to next phase if we're at an empty line
		if (!scratch.line) {
			return false;
		}
		// Otherwise repeat this phase
		this.headers.push(scratch.line);
		return true;
	},


	/*@private
	 * Collects all of the cues in the file
	 * @return Whether cueLoop should be repeated
	 */
	cueLoop: function(){
		var scratch = this.scratch,
			regexp = this.regexp;

		// Collect a line if not already collected
		if (!scratch.alreadyCollectedLine) {
			// 16. Skip line feeds
			this.skip(regexp.reLF, true);
			// 17. Get next sequence delineated by a line feed
			this.scan(regexp.reNotLF, true);
			// 18. Halt if at end of file
			if (scratch.line === '') {
				return this.signalHalt();
			}
		}
		// 19. Cue creation
		scratch.cue = new NextThought.webvtt.Cue();
		// If line isn't a timing (doesn't contain "-->") then it should be a cue identifier
		if (!regexp.reArrow.test(scratch.line)) {
			// Attempt to collect the cue identifier
			if (!this.collectIdentifier()) {
				if (scratch.halt) {
					return false;
				} // else
				return true;
			}
		}
		// 35. Timings
		scratch.alreadyCollectedLine = false;
		// 36. Collect timings and settings for cue and line
		if (scratch.cue = this.collectTimingsAndSettings(scratch.cue, scratch.line)) { // Else, bad cue
			// 37. Prepare to collect cue text
			scratch.cueText = '';
			// 38. Cue text loop
			while (this.cueTextLoop.call(this));
			// Repeat cueLoop
			return true;
		} else { // 49. Bad cue -- cue is discarded
			// 50. Bad cue loop
			while (this.badCueLoop.call(this));
			return !scratch.halt;
		}
	},


	/*@private
	 * Collects a cue identifier or signals parsing to halt
	 * @return Whether a cue identifier was collected successfully
	 */
	 collectIdentifier: function(){
		var scratch = this.scratch,
			regexp = this.regexp;

		// 30. Set the cue's identifier
		scratch.cue.identifier = scratch.line;
		// 31. Halt if at end of file
		if (scratch.position >= scratch.fileContent.length) {
			return this.signalHalt();
		}
		// 32. Skip line feed if at one
		if (scratch.fileContent.charCodeAt(scratch.position) === 10) {
			scratch.position++;
		}
		// 33. Read until the next LF
		this.scan(regexp.reNotLF, true);
		// 34. Discard and read another cue if we read an empty string
		return (scratch.line !== '');
	},


	/*@private
	 * Collects timings and settings for a given cue and a given input line.
	 * @param cue The cue for which timings and settings are being collected.
	 * @param input A sequence containing cue timing and setting information.
	 * @return The cue with timings/settings added, or false if there was an error
	 */
	collectTimingsAndSettings: function(cue, input){
		// 1. input // 2. position
		var pos = 0,
			remainder,
			collected,
			regexp = this.regexp,
			scratch = this.scratch;

		// 3. Skip whitespace
		pos += regexp.reWS.exec(input)[0].length;
		// 4. Collect starting timestamp
		collected = this.collectTimestamp(input, pos);
		if (collected) {
			cue.startTime = collected['timestamp'];
			pos += collected['position'];
		} else {
			return false;
		}
		// 5. Skip whitespace
		pos += regexp.reWS.exec(input.substr(pos))[0].length;
		// 6. Abort if not at a minus
		if (input.charCodeAt(pos) !== 45) {
			// return error
			console.error('collectTimingsAndSettings: 6. should be a minus sign in "'+input+'" at position '+pos);
			return false;
		}
		pos++;
		// 7. Abort if not at a minus
		if (input.charCodeAt(pos) !== 45) {
			// return error
			console.error('collectTimingsAndSettings: 7. should be a minus sign in "'+input+'" at position '+pos);
			return false;
		}
		pos++;
		// 8. Abort if not at a greater-than sign
		if (input.charCodeAt(pos) !== 62) {
			// return error
			console.error('collectTimingsAndSettings: 8. should be a greater-than sign in "'+input+'" at position '+pos);
			return false;
		}
		pos++;
		// 9. Skip whitespace
		pos += regexp.reWS.exec(input.substr(pos))[0].length;
		// 10. Collect ending timestamp
		collected = this.collectTimestamp(input, pos);
		if (collected) {
			cue.endTime = collected['timestamp'];
			pos += collected['position'];
		} else {
			return false;
		}
		// 11. TODO: Make this trail the endtime position if it doesn't?
		remainder = input.substr(pos);
		// 12. Parse settings given by remainder for cue
		this.parseSettings(cue, remainder);
		return cue;
	},


	/*@private
	 * Parses a string of timestamp information
	 * @param input 1. The string of timestamp information.
	 * @param pos 1. The current position in input.
	 * @return The timestamp value in seconds and the updated position, or false if the operation failed.
	 */
	collectTimestamp: function(input, pos){
		// 2. By default assume minutes are the most significant units of time
		var mostSigUnits = 'minutes',
			string, value1, value2, value3, value4,
			result,
			regexp = this.regexp,
			scratch = this.scratch;

		// 3. Out-of-bounds error
		if (pos >= input.length) {
			// return error
			console.error('collectTimestamp: 3. position '+pos+' is out-of-range in "'+input+'"');
			return false;
		}
		// 4. Make sure we're at a digit
		if (!regexp.reDigit.test(input.charAt(pos))) {
			// return error
			console.error('collectTimestamp: 4. should be a digit at position '+pos+' in "'+input+'"');
			return false;
		}
		// 5. Collect digits in most significant time unit
		string = regexp.reDigits.exec(input.substr(pos))[0];
		pos += string.length;
		// 6. Get value of most significant time unit
		value1 = parseInt(string, 10);
		// 7. Determine whether we're reading the hours
		// NOTE: But what if 0 <= hours <= 59 ?
		if (string.length !== 2 || value1 > 59)
			mostSigUnits = 'hours';
		// 8. Abort if past input length or not at a colon
		if (pos >= input.length || input.charCodeAt(pos) !== 58) {
			// return error
			console.error('collectTimestamp: 8. position '+pos+' in "'+input+'" is out-of-range or is not a colon');
			return false;
		}
		pos++;
		// 9.
		string = regexp.reDigits.exec(input.substr(pos))[0];
		pos += string.length;
		// 10.
		if (string.length !== 2) {
			// return error
			console.error('collectTimestamp: 10. the length of "'+string+'" should be exactly 2');
			return false;
		}
		// 11.
		value2 = parseInt(string, 10);
		// 12. Parse the hours if necessary
		if (mostSigUnits === 'hours' ||
			(pos < input.length && input.charCodeAt(pos) === 58)) {
			// 1.
			if (pos >= input.length || input.charCodeAt(pos) !== 58) {
				// return error
				console.error('collectTimestamp: 12-1. position '+pos+' in "'+input +'" is out-of-range or is not a colon');
				return false;
			}
			pos++;
			// 2.
			string = regexp.reDigits.exec(input.substr(pos))[0];
			pos += string.length;
			// 3.
			if (string.length !== 2) {
				// return error
				console.error('collectTimestamp: 12-3. the length of "'+string+'" should be exactly 2');
				return false;
			}
			value3 = parseInt(string, 10);
		} else {
			value3 = value2;
			value2 = value1;
			value1 = 0;
		}
		// 13. Abort if past input length or not at a full stop (.)
		if (pos >= input.length || input.charCodeAt(pos) !== 46) {
			// return error
			console.error('collectTimestamp: 13. position '+pos+' in "'+input+'" is out-of-range or is not a period');
			return false;
		}
		pos++;
		// 14.
		string = regexp.reDigits.exec(input.substr(pos))[0];
		pos += string.length;
		// 15.
		if (string.length !== 3) {
			// return error
			console.error('collectTimestamp: 15. the length of "'+string+'" should be exactly 3');
			return false;
		}
		// 16.
		value4 = parseInt(string, 10);
		// 17.
		if (value2 > 59 || value3 > 59) {
			// return error
			console.error('collectTimestamp: 17. the values of '+value2+' and '+value3+' must both be less than or equal to 59');
			return false;
		}
		// 18.
		result = value1*60*60 + value2*60 + value3 + value4/1000;
		// 19.
		return {
			timestamp: result,
			position: pos
		};
	},


	/*@private
	 * Parses the settings for a given cue and a settings string
	 */
	parseSettings: function(cue, input){
		// 1.
		var settings = input.split(' '),
			i, setting, name, value, number,
			regexp = this.regexp,
			alignValues = ['left', 'middle', 'right', 'start', 'end'];

		// 2.
		for (i = 0; i < settings.length; i++) {
			// 1.
			setting = settings[i];
			if (!regexp.reColon.test(setting) || setting.indexOf(':') === 0
				|| setting.indexOf(':') === setting.length - 1) {
				continue;
			}
			// 2.
			name = setting.split(':')[0];
			// 3.
			value = setting.split(':')[1];
			// 4.
			if (name === 'vertical') {
				if (value === 'rl') { // 1.
					cue.setWritingDirection('vertical growing left');
				} else if (value === 'lr') {// 2.
					cue.setWritingDirection('vertical growing right');
				}
			} else if (name === 'line') {
				if (regexp.reNotHyPerDigits.test(value)) {// 1.
					continue;
				} else if (regexp.reNoDigits.test(value)) {// 2.
					continue;
				} else if (regexp.reFollowingHyphen.test(value)) {// 3.
					continue;
				} else if (regexp.reLeadingPercent.test(value)) {// 4.
					continue;
				} else if (regexp.reHyphenFirst.test(value) && regexp.rePercentLast.test(value)) {// 5.
					continue;
				}
				number = parseInt(regexp.reSignedNumbersNoTail.exec(value)[0], 10); // 6.
				if (regexp.rePercentLast.test(value) && (number < 0 || number > 100)) {// 7.
					continue;
				}
				cue.linePosition = number; // 8.
				cue.snapToLines = !(regexp.rePercentLast.test(value)); // 9.
			} else if (name === 'position') {
				if (regexp.rePerDigits.test(value)) {// 1.
					continue;
				}
				if (regexp.reNoDigits.test(value)) {// 2.
					continue;
				}
				if (regexp.reLeadingPercent.test(value)) {// 3.
					continue;
				}
				if (!regexp.rePercentLast.test(value)) {// 4.
					continue;
				}
				number = parseInt(regexp.reSignedNumbersNoTail.exec(value)[0], 10); // 5.
				if (number < 0 || number > 100) {
					continue;
				}
				cue.setSize(number);
			} else if (name === 'align') {
				//Do We even need to check if the value is in the array. Can't we just assign it?
				if(alignValues.contains(value)){
					cue.alignment = value;
				}
			}
		}
	},


	/*@private
	 * Collects the text (payload) for the current cue
	 * @return Whether this should be repeated
	 */
	cueTextLoop: function(){
		var scratch = this.scratch,
			regexp = this.regexp;

		// Skip to processing if we've reached the end of file
		if (scratch.position < scratch.fileContent.length) {
			// 39. Skip over LF if we're at one
			if (scratch.fileContent.charCodeAt(scratch.position) === 10) {
				scratch.position++;
				scratch.lineNo++;
			}
			// 40. Scan until the next LF
			this.scan(regexp.reNotLF, true);
			// 41. Jump to cue text processing if we read an empty string
			if (scratch.line !== '') {
				// 42. If line contains "-->", it's already been collected and we skip to cue text processing
				if (!regexp.reArrow.test(scratch.line)) {
					// 43. Append a LF to cueText if it's not empty
					if (scratch.cueText !== '') {
						scratch.cueText += '\n';
					}
					// 44. Concatenate line onto cueText
					scratch.cueText += scratch.line;
					// 45. Repeat cueTextLoop
					return true;
				}
				scratch.alreadyCollectedLine = true;
			}
		}
		// 46. Cue text processing
		scratch.cue.text = this.processCueText(scratch.cueText);
		// 47. Add the cue to the list of cues
		this.cueList.push(scratch.cue);
		//        console.debug('Cue added: '+scratch.cue.getText());
		// 48. Move on to the next cue by repeating cueLoop
		return false;
	},


	/*@private
	 * Processes a cue's text as necessary, e.g., by replacing <v> tags with <span> tags.<br>
	 * Performs the role of the algorithm described at http://dev.w3.org/html5/webvtt/#webvtt-cue-text-parsing-rules
	 * but with modifications and omissions as Ext JS handles the HTML parsing.<br>
	 * Hence, this method modifies the cue's text rather than creating WebVTT objects.
	 * @param input The cue text to be processed
	 * @return The processed cue text
	 */
	processCueText: function(input){
		// The return string
		var output = input;
		// Pointer into input (the cue text)
		var position = 0;
		// To remember how many span tags to close
		var spanCount = 0;
		// TO remember how many misformed V tags were encountered
		var badVCount = 0;
		// RegExp for matching <v> tags
		var reV = /<v[^>]*>/gi;
		// RegExp for matching </v> tags
		var reEndV = /<\/(v)>/i;
		// RegExp for proper form of a <v> tag: remembers ".<classname>"* and "<speakername>"
		var reGoodV = /<v((?:\u002e[^\u002e\s]+)*)\s+([^\u000a\u000d\u0026\u003c]+)>/i,
			scratch = this.scratch,
			regexp = this.regexp;

		/*
		 * Callback for replace which replaces <v> tags with <span> tags, returning a resulting replacement string
		 * @param str The matched string, which is a <v> tag (with annotations and such)
		 */
		function replaceV(str) {
			var replacement;
			// Check whether this is a valid tag (it must have an annotation), return empty span if not
			if (!reGoodV.test(str)) {
				console.error(str+' is not a well-formed voice tag.');
				badVCount++;
				return '<span>';
			}
			replacement = str;
			// Perform the replacement on the tag contents
			replacement = replacement.replace(reGoodV, replaceVParts)
			//            console.debug(str+' replaced with '+replacement);

			return replacement;
		}


		/*
		 * Callback for replace used actually to replace parts of the tag as required.
		 * @param arguments[0] = str
		 * @param arguments[1] = ".<class name>"*
		 * @param arguments[2] = "<the name of the speaker>"
		 * @param arguments[3] = offset
		 * @param arguments[4] = s
		 * @return The replacement string
		 */
		function replaceVParts() {
			var replacement;
			var reClasses;
			var replacementClasses;

			// Initialize to the matched string
			replacement = arguments[0];
			// Replace the beginning 'v' with 'span'
			replacement = replacement.replace(/^<v/i, '<span');
			// Replace the ".<classname>"* sequence with a class attribute with each instance of <classname> as a value
			if (arguments[1]) {
				reClasses = new RegExp(arguments[1]);
				replacementClasses = arguments[1];
				replacementClasses = replacementClasses.replace(/\u002e/g, ' ');
				replacementClasses = replacementClasses.trim();
				replacement = replacement.replace(reClasses, ' class=\''+replacementClasses+'\'');
			}
			// Adds a title attribute with speakername as its value
			replacement = replacement.replace(new RegExp(arguments[arguments.length-3]+'(?=>)'),
				'title=\'' + arguments[arguments.length-3] + '\'');
			spanCount++;
			//            console.debug(arguments[0]+' replaced with '+replacement);

			return replacement;
		}


		/* Callback for replace which replaces </v> tags with </span> tags and keeps track of how many times this is done */
		function replaceEndV() {
			spanCount--;
			return '</span>';
		}

		// Replace the contents of all the <v> tags
		output = output.replace(reV, replaceV);

		// Replace </v> tags with </span> tags
		output = output.replace(reEndV, replaceEndV);

		// Add additional </span> tags as needed
		while(spanCount > 0) {
			output += '</span>';
			spanCount--;
		}

		// Convert WebVTT escape sequences and such
		output = output.replace(/&amp;/, '&#038;');
		output = output.replace(/&lt;/, '&#060;');
		output = output.replace(/&gt;/, '&#062;');
		output = output.replace(/&lrm;/, '\u200e');
		output = output.replace(/&rlm;/, '\u200f');
		output = output.replace(/&nbsp;/, '\u00a0');
		if (!scratch.ignoreLFs) {
			output = output.replace(/\u000a/, '<br>');
		}

		//        console.debug('Replaced ' + input + ' with ' + output);
		// Return the processed cue text
		return output;
	},


	/*@private
	 * Skips over malformed cues
	 * @return Whether badCueLoop should be repeated
	 */
	badCueLoop: function(){
		var scratch = this.scratch,
			regexp = this.regexp;

		// Halt if at end of file
		if (scratch.position >= scratch.fileContent.length) {
			return this.signalHalt();
		}
		// 51. Skip over LF if we're at one
		if (scratch.fileContent.charCodeAt(scratch.position) === 10) {
			scratch.position++;
			scratch.lineNo++;
		}
		// 52. Scan until the next LF
		this.scan(regexp.reNotLF, true);
		// 53. If we're reading a timing, go to that part of cueLoop
		if (regexp.reArrow.test(scratch.line)) {
			scratch.alreadyCollectedLine = true;
			return false;
		}
		// 54. Repeat cueLoop if line is the empty string 55. Otherwise, repeat badCueLoop
		return (scratch.line !== '');
	},


	/*@private
	 * Extracts the indices of section-title cues from the "sections" header, if specified
	 */
	findSections: function(){
		var i, j, hdr;
		this.sections = [];
		for (i = 0; i < this.headers.length; i++) {
			if (this.headers[i].match(/^sections/i)) {
				hdr = this.headers[i].split(/[:,]\s/);
				for (j = 1; j < hdr.length; j++) {
					this.sections.push(hdr[j]);
				}
			}
		}
	},


	/*@private
	 * Constructs a tree of nested cues in cueTree, if cues are nested
	 */
	buildCueTree: function() {
		var i, path;
		this.cueTree = [];
		for (i = 0; i < this.cueList.length; i++) {
			this.cueTreeInsert(this.cueList[i], this.cueTree);
		}
	},


	/*@private
	 * Recursively finds the string path into into cueTree where a cue should be inserted
	 * @param cue The cue which is being inserted
	 * @param tree The cueTree into which cue is currently fitting
	 */
	cueTreeInsert: function(cue, tree){
		var i, tmpCue;
		for (i = 0; i < tree.length; i++) {
			tmpCue = cue.cueTree[i];
			if (cue.startTime >= tmpCue.startTime && cue.endTime <= tmpCue.endTime) {
				this.cueTreeInsert(cue, tmpCue.cueTree);
				return;
			}
		}
		cue.cueTree.push();
	},

	/*
	 * Transcript constructor
	 */
	constructor: function(config) {
		var r = this.callParent(config);

		Ext.apply(this, config);

		this.headers = [];
		this.cueList = [];
		this.sections = [];
		this.cueTree = [];
		return r;
	},



	/*
	 * Parses the WebVTT file contents<br>
	 * Based on the algorithm described at http://dev.w3.org/html5/webvtt/#parsing<br>
	 * Numbered comments refer to steps of that algorithm
	 * @param input The contents of the WebVTT file being parsed
	 * @param ignoreLFs Whether line feeds in cue text should be ignored rather than converted to <br> tags
	 */
	parseWebVTT: function(){
		var s, scratch = this.scratch;
		// Make sure scratchwork is clear
		for (s in scratch) {
			scratch[s] = 0;
		}

		scratch.ignoreLFs = this.ignoreLFs;

		// 1. Pre-process file content
		scratch.fileContent = this.preProcess(this.input);

		// Verify signature
		this.verifySignature();

		// 8. Error if there's nothing else in the file
		if (scratch.position >= scratch.fileContent.length) {
			this.signalError('File contains no useful data');
		}

		// 9. Advance past line feed we scanned to
		scratch.position++;

		// Collect headers
		this.getHeader.call(this);
		if (scratch.halt) {
			return null;
		}

		// Collect and process cues
		while(this.cueLoop());

		this.findSections();

		this.buildCueTree();

		// Clear off scratchwork
		for (s in scratch) {
			scratch[s] = 0;
		}

		return this.cueList;
	}
});
