var Ext = require('extjs');
var ModelBase = require('../Base');


module.exports = exports = Ext.define('NextThought.model.courseware.Grade', {
	extend: 'NextThought.model.Base',

	ENDS_IN_LETTER_REGEX: /\s[a-zA-Z|\-]$/,

	statics: {
		//see the instance isEmpty method below
		isEmpty: function (value, letter) {
			var v = value + ' ' + letter;

			return Ext.isEmpty(v.replace('-', '').trim());
		},

		/**
		 * Takes a grade object and returns a display value
		 * It looks for value, letter, correctness, and grade
		 * @param  {Object} values grade values to get the display for
		 * @return {String}		   [escription]
		 */
		getDisplay: function (values) {
			const value = values.value || values.Correctness;
			const letter = values.letter || values.Grade;
			const display = [];

			if (value || value === 0) {
				display.push(value);
			}

			if (letter || letter === 0) {
				display.push(letter);
			}

			return display.join(' ');
		},


		Items: [
			{text: '-'},
			{text: 'A'},
			{text: 'B'},
			{text: 'C'},
			{text: 'D'},
			{text: 'F'},
			{text: 'I'},
			{text: 'W'}
		]
	},

	mimeType: 'application/vnd.nextthought.grade',
	fields: [
		{name: 'Username', type: 'string'},
		{name: 'value', type: 'string', convert: function (v) {
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
		{name: 'Correctness', type: 'string', persist: false},
		{name: 'Grade', type: 'string', persist: false},
		{name: 'RawValue', type: 'string', persist: false},
		{name: 'IsPredicted', type: 'bool', persist: false},
		{name: 'AssignmentId', type: 'string'},
		{name: 'assignmentName', type: 'string', persist: false},
		{name: 'assignmentContainer', type: 'string', persist: false},
		{name: 'IsExcused', type: 'auto', persist: false}
	],


	onSync (record) {
		this.isPlaceholder = record.isPlaceholder;
	},


	equalsGrade (grade) {
		const values = grade.getValues();

		return this.valueEquals(values.value, values.letter);
	},


	/**
	 * looks at the values set and compares them to the ones passed
	 * treat a letter grade value of '-' the same as no letter grade
	 *
	 * @param  {string} value the value of the grade
	 * @param  {char} letter the letter value of the grade
	 * @return {Boolean}		if they are the same values
	 */
	valueEquals: function (value, letter) {
		var vals = this.getValues();

		if (vals.value !== value) { return false; }

		if (!vals.letter && (!letter || letter === '-')) { return true; }

		if (vals.letter === '-' && !letter) { return true; }

		return vals.letter === letter;
	},


	isExcusable: function () {
		return this.hasLink('excuse') || this.hasLink('unexcuse');
	},



	excuseGrade: function () {
		var record = this,
			url = this.getLink('excuse') || this.getLink('unexcuse');

		return new Promise(function (fulfill, reject) {
			Service.request({
				url: url,
				method: 'POST'
			})
			.catch(function () {
				console.error('Failed to excuse grade: ', arguments);
				reject('Request Failed');
			})
			.then(function (responseText) {
				var o = Ext.JSON.decode(responseText, true);

				record.set(o);
				fulfill(record);
			});
		});
	},

	isPredicted: function () {
		return this.get('IsPredicted');
	},


	getPredictedValue: function () {
		var grade = this.get('Correctness'),
			letter = this.get('value');

		return {
			value: grade,
			letter: letter
		};
	},

	/**
	 * Looks at the value for the grade and parses it into a value and letter value
	 * @return {Object} an object with value and letter for keys
	 */
	getValues: function () {
		if (this.isPredicted()) {
			return this.getPredictedValue();
		}

		var val = this.get('value') || '', parts, letter, grade,
			correctness = this.get('Correctness');

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
			value: grade.trim(),
			letter: letter
		};
	},

	//return false if we are already trying to save the same value
	shouldSave: function (value, letter) {
		var val = value + ' ' + letter;

		return this.pendingSaveValue !== val && !this.valueEquals(value, letter);
	},


	setValue: function (value, letter) {
		value = (value && value.trim()) || '';
		letter = (letter && letter.trim()) || '';

		var val = value + ' ' + letter;

		this.set('value', val);

		return val;
	},


	saveValue: function (value, letter) {
		if (this.isPlaceholder) { return this.createNewGrade(value, letter); }

		value = (value && value.trim()) || '';
		letter = (letter && letter.trim()) || '-';

		var me = this, oldVal,
			val = value + ' ' + letter;

		//if we are attempting to save the same value we are already in the middle of saving stop
		if (val === me.pendingSaveValue) { return Promise.resolve(me); }

		me.pendingSaveValue = val;

		oldVal = me.get('value');

		me.set('value', val);

		return new Promise(function (fulfill, reject) {
			me.save({
				success: function (grade, req) {
					var response = req && req.response,
						text = response && response.responseText,
						json;

					try {
						if (!Ext.isEmpty(text)) {
							json = JSON.parse(text);

							//update the links so we can get the link for the assignment history item
							//if there is one
							grade.set('Links', json.Links);
						}
					} catch (e) {
						console.error('failed to parse response text for a saved grade:', e, text);
					} finally {
						delete me.pendingSaveValue;

						//alert that the value successfully changed
						me.fireEvent('value-change');
						fulfill(grade);
					}
				},
				failure: function () {
					delete me.pendingSaveValue;
					me.set('value', oldVal);
					reject();
					me.fireEvent('value-change-failed');
				}
			});
		});
	},


	/**
	 * Creates a grade for an assignment with out a submission. Uses the SetGrade link on the gradebook
	 * set as the href in the assignment collection
	 *
	 * @param  {string} value the value of the grade
	 * @param  {char} letter the letter value of the grade
	 * @return {Promise}	 fulfills with the assignment history item that was created
	 */
	createNewGrade: function (value, letter) {
		var me = this,
			href = me.get('href');

		me.setValue(value, letter);

		return Service.post(href, {
			Username: me.get('Username'),
			AssignmentId: me.get('AssignmentId'),
			value: me.get('value')
		})
		.then(function (response) {
			me.fireEvent('value-change');

			return response;
		})
		.catch(function (reason) {
			me.set('value', null);

			Ext.MessageBox.alert({
				title: 'Error',
				msg: 'There was an error saving the grade value.',
				icon: 'warning-red',
				buttonText: true,
				buttons: {
					primary: 'Ok'
				}
			});

			return Promise.reject(reason);
		});
	},


	/**
	 * Check if the value is empty, need to handle
	 * "# L", "# -", " L", " " -", "#", and ""
	 * @return {Boolean}
	 */
	isEmpty: function () {
		var val = this.get('value') || '';

		return Ext.isEmpty(val.replace('-', '').trim());
	},

	//Doesn't make sense for this object
	isMine: function () {
		return true;
	},

	isModifiable: function () { return true; },

	save: function (config) {
		function failed () {
			Ext.MessageBox.alert({
				title: 'Error',
				msg: 'There was an error saving the grade value.',
				icon: 'warning-red',
				buttonText: true,
				buttons: {
					primary: 'Ok'
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
