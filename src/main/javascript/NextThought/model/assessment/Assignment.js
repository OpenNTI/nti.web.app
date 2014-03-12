Ext.define('NextThought.model.assessment.Assignment', {
	extend: 'NextThought.model.Base',
	requires: ['NextThought.model.converters.Date'],
	isAssignment: true,
	fields: [
		{ name: 'category_name', type: 'string'},
		{ name: 'containerId', type: 'string' },//lowercase C?
		{ name: 'content', type: 'string' },
		{ name: 'availableBeginning', type: 'ISODate', mapping: 'available_for_submission_beginning' },
		{ name: 'availableEnding', type: 'ISODate', mapping: 'available_for_submission_ending' },
		{ name: 'parts', type: 'arrayItem' },
		{ name: 'title', type: 'string' },
		{ name: 'SubmittedCount', type: 'int', mapping: 'GradeSubmittedCount'}
	],


	containsId: function(id) {
		var items = this.get('parts').filter(function(p) {
			p = p.get('question_set');
			return p && p.getId() === id;
		});

		return items.length > 0;
	},


	getDueDate: function() {
		return this.get('availableEnding') || this.get('availableBeginning');
	},


	tallyParts: function() {
		function sum(agg, r) {
			return agg + (r.tallyParts ? r.tallyParts() : 1);
		}
		return (this.get('parts') || []).reduce(sum, 0);
	},


	doNotShow: function() {
		return this.get('category_name') === 'no_submit' && this.get('title') === 'Final Grade';
	},


	setGradeBookEntryFrom: function(gradebook) {
		if (!gradebook) {
			console.error('No gradebook?');
			return;
		}

		this._gradeBook = gradebook;

		var t = this.get('title'), c = this.get('category_name');
		this.setGradeBookEntry(
			gradebook.getItem(t, c));
	},


	setGradeBookEntry: function(gradeBookEntry) {
		//replace the Grade object in the individual submissions with the gradebook version
		if (!gradeBookEntry) {
			console.error('falsy gradebook entry?');
			return;
		}

		this._gradeBookEntry = gradeBookEntry;

		var s = this._submittedHistoryStore;//optimization, everyone else should get it from the getter.
		if (s && !s.isLoading() && s.getCount() > 0) {
			this._updateGradeInstance();
		}
	},


	getGradeBookEntry: function() { return this._gradeBookEntry; },


	getSubmittedHistoryStore: function() {
		if (!this._submittedHistoryStore) {
			var url = this.getLink('GradeSubmittedAssignmentHistorySummaries'),
				s = this._submittedHistoryStore = new NextThought.store.courseware.AssignmentView({
					url: url,
					remoteFilter: true,
					remoteSort: true
				});

			s.on({
				scope: this,
				load: '_resolveParts',
				prefetch: '_resolveParts'
			});

			s.load();
		}

		return this._submittedHistoryStore;
	},


	_resolveParts: function(store, records, success) {
		if (!success) {return;}
		records = records || [];

		//work around a ExtJS 4.2.0 bug (fixed in 4.2.1)
		if (records && records.isStore) {
			records = [];
		}

		function fill(users) {
			var i = users.length - 1, r, u, c;
			store.suspendEvents(true);
			for (i; i >= 0; i--) {
				r = records[i];
				u = users[i];
				if (u) {
					c = r && r.get('Creator');
					if (c && c === u.getId()) {
						r.set('Creator', u);
					} else if (typeof c !== 'string') {
						if (c.getId() !== u.getId()) {
							console.warn('Already model, but ids do not match');
						}
					} else {
						console.warn('Skipped record!');
					}
				//the record already has a user object
				} else if (r && (typeof r.get('Creator') === 'string')) {
					console.error('No user');
				}
			}

			store.resumeEvents();
		}

		var me = this,
			pluck = Ext.Array.pluck,
			userSet = {},
			users;

		users = pluck(pluck(records, 'data'), 'Creator');
		users = users.map(function(creator) {
			if (typeof creator !== 'string' && creator.get) {
				creator = creator.get('Username');
			}
			userSet[creator] = true;
			return creator;
		});


		//fill in the assignment into the history item so the synthetic fields can derive values from it.
		store.suspendEvents(true);
		records.forEach(function(r) {r.set('item', me);});
		me._updateGradeInstance(records);
		store.resumeEvents();
		//then resolve users...

		UserRepository.makeBulkRequest(users).done(fill);
	},


	_updateGradeInstance: function(records) {
		var recs = records || this.getSubmittedHistoryStore().getRange(),
			gbe = this._gradeBookEntry;

		if (!gbe) {return;}

		function update(rec) {
			gbe.updateHistoryItem(rec);
			try {rec.buildGrade();} catch (e) {Error.raiseForReport(e);}
		}

		recs.forEach(update);
	}

});
