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


	getSubmittedHistoryStore: function() {
		if (!this._submittedHistoryStore) {
			var s = this._submittedHistoryStore = new NextThought.store.courseware.AssignmentView({
				url: this.getLink('GradeSubmittedAssignmentHistory')
			});
			s.promise = new Promise();

			s.on({
				single: true,
				load: function() {
					s.promise.fulfill(s);
				}
			});

			s.on('load', '_resolveParts', this);

			s.load();
		}

		return this._submittedHistoryStore;
	},


	setRoster: function(roster) {
		this.roster = roster;
		var s = this._submittedHistoryStore;//optimization, everyone else should get it from the getter.
		if (s && !s.isLoading() && s.getCount() > 0) {
			this._resolveParts(s, s.getRange());
		}
		this.fireEvent('roster-set');
	},


	_resolveParts: function(store, records) {
		records = records || [];

		function fill(users) {
			var i = users.length - 1, r, u;

			for (i; i >= 0; i--) {
				r = records[i];
				u = users[i];
				if (u && r && r.get('Creator') === u.getId()) {
					r.set('Creator', u);
				} else {
					console.warn('Skipped record!', i, records, users);
				}
			}

			store.sort();
		}

		var me = this,
			pluck = Ext.Array.pluck,
			users = pluck(pluck(records, 'data'), 'Creator'),
			phantoms = [];

		(this.roster || []).forEach(function(o) {
			var u = o.get('Username');
			if (!Ext.Array.contains(users, u)) {
				phantoms.push(NextThought.model.courseware.UsersCourseAssignmentHistoryItem.create({
					Creator: u
				}));
				users.push(u);
			}
		});

		if (phantoms.length) {
			records = records.concat(phantoms);
			store.add(phantoms);
		}

		this._updateGradeInstance(records);

		//fill in the assignment into the history item so the synthetic fields can derive values from it.
		records.forEach(function(r) {r.set('item', me);});
		//then resolve users...
		UserRepository.makeBulkRequest(users).done(fill);
	},


	_updateGradeInstance: function(records) {
		var recs = records || this.getSubmittedHistoryStore().getRange(),
			gbe = this._gradeBookEntry;

		if (!gbe) {return;}

		function update(rec) {
			var u = rec.get('Creator'),
				submissionGrade = rec.get('Grade'),
				gradebookGrade = gbe.getFieldItem('Items', u);

			if (submissionGrade && submissionGrade.get('Username') !== u) {
				console.warn('Record creator does not match username of its own grade object', rec);
			}

			if (!gradebookGrade) {
				return;
			}

			if (gradebookGrade.get('Username') !== u) {
				console.error('Record creator does not match username of the grade object from the GradeBook entry', rec, u, gbe);
				return;
			}

			rec.set('Grade', gradebookGrade);
		}

		recs.forEach(update);
	}

});
