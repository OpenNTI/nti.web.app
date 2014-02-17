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


	getSubmittedHistoryStore: function() {
		if (!this._submittedHistoryStore) {
			var url = this.getLink('GradeSubmittedAssignmentHistorySummaries'),
				s = this._submittedHistoryStore = new NextThought.store.courseware.AssignmentView({ url: url });

			s.promise = PromiseFactory.make();

			s.on({
				single: true,
				load: function(me, records, successful) {
					if (!successful) {
						console.error('Failed to load: ' + url);
						s.promise.reject();
						return;
					}
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


	_resolveParts: function(store, records, success) {
		if (!success) {return;}
		records = records || [];

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
				} else {
					console.error('No user');
				}
			}
			//The natural sorts are a hotspot 2.5 seconds for 5,000 records on my very fast machine. -cutz,
			//if we don't have to use the natural sorter that will probably speed things up.
			store.sort();

			store.resumeEvents();
		}

		var me = this,
			pluck = Ext.Array.pluck,
			userSet = {},
			users = [],
			phantoms = [];

		users = pluck(pluck(records, 'data'), 'Creator');
		users.forEach(function(creator) {
			if (typeof creator !== 'string' && creator.get) {
				creator = creator.get('Username');
			}
			userSet[creator] = true;
		});

		//Note: We conditionally push onto users here, but then concat all of phantom below, so if
		//We have multiple records in records with the same user here we end up in an inconsistent state.
		//It is expected that there should only be 1 record per creator which is a contract with the view,
		//not necessarily the data
		(this.roster || []).forEach(function(o) {
			var u = o.Username;
			if (!userSet[u]) {
				phantoms.push(NextThought.model.courseware.UsersCourseAssignmentHistoryItem.create({
					Creator: u
				}));
				users.push(u);
			}
		});

		if (phantoms.length) {
			records = records.concat(phantoms);
			//This triggers a sort so the same thing applies as above, 2.5 seconds on my machine.  This this sort is pointless
			//we resort after resolving and filling in, it would be nice to find a way to not sort on the add.
			//So, to prevent the sort and just append, set remoteSort true for the duration of the add, then turn it off.
			store.remoteSort = true;
			store.add(phantoms);
			//Apparently Add ignores the filter :{
			if (store.isFiltered()) {
				store.filter();
			}
			store.remoteSort = false;
		}

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
			var c = rec.get('Creator'),
				u = typeof c === 'string' ? c : c.getId(),
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
