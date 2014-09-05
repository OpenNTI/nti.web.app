Ext.define('NextThought.model.courseware.Grade', {
	extend: 'NextThought.model.Base',

	ENDS_IN_LETTER_REGEX: /\s[a-fA-F|\-]$/,

	statics: {
		//see the instance isEmpty method below
		isEmpty: function(value, letter) {
			var v = value + ' ' + letter;

			return Ext.isEmpty(v.replace('-', '').trim());
		}
	},

	mimeType: 'application/vnd.nextthought.grade',
	fields: [
		{name: 'Username', type: 'string'},
		{name: 'value', type: 'string', convert: function(v) {
			var n;
			if (typeof v === 'number') {
				n = v.toFixed(1);
				if (n.split('.')[1] === '0') {
					n = v.toFixed(0);
				}
				v = n;
			}

			return v;
		}},
		{name: 'AssignmentId', type: 'string'},
		{name: 'assignmentName', type: 'string', persist: false},
		{name: 'assignmentContainer', type: 'string', persist: false}
	],

	/**
	 * looks at the values set and compares them to the ones passed
	 * treat a letter grade value of '-' the same as no letter grade
	 *
	 * @param  {string} value the value of the grade
	 * @param  {char} letter the letter value of the grade
	 * @return {Boolean}        if they are the same values
	 */
	valueEquals: function(value, letter) {
		var vals = this.getValues();

		if (vals.value !== value) { return false; }

		if (!vals.letter && (!letter || letter === '-')) { return true; }

		if (vals.letter === '-' && !letter) { return true; }

		return vals.letter === letter;
	},

	/**
	 * Looks at the value for the grade and parses it into a value and letter value
	 * @return {Object} an object with value and letter for keys
	 */
	getValues: function() {
		var val = this.get('value') || '', parts, letter, grade;

		//check if it ends in a character we recognize as a letter grade
		//if it does use the last part of the value as the letter grade
		if (this.ENDS_IN_LETTER_REGEX.test(val)) {
			parts = val.split(' ') || [];
			letter = parts.pop();
			grade = parts.join(' ').trim();
		} else {
		//otherwise use the whole value as the grade itself
			grade = val;
		}

		return {
			value: grade,
			letter: letter
		};
	},


	saveValue: function(value, letter) {
		value = (value && value.trim()) || '';
		letter = (letter && letter.trim()) || '-';

		var me = this,
			val = value + ' ' + letter;

		me.set('value', val);

		return new Promise(function(fulfill, reject) {
			me.save({
				success: fulfill,
				failure: reject
			});
		});
	},

	/**
	 * Check if the value is empty, need to handle
	 * "# L", "# -", " L", " " -", "#", and ""
	 * @return {Boolean}
	 */
	isEmpty: function() {
		var val = this.get('value') || '';

		return Ext.isEmpty(val.replace('-', '').trim());
	},

	//Doesn't make sense for this object
	isMine: function() {
		return true;
	},

	isModifiable: function() { return true; },

	save: function(config) {
		function failed() {
			Ext.MessageBox.alert({
				title: 'Error',
				msg: 'There was an error saving the grade value.',
				icon: 'warning-red',
				buttonText: true,
				buttons: {
					ok: 'Ok'
				}
			});
		}

		config.failure = Ext.Function.createSequence(config.failure || Ext.emptyFn, failed, null);

		if (this.isEmpty()) {
			this.destroy(config);
			return;
		}

		return this.callParent(arguments);
	}
});
