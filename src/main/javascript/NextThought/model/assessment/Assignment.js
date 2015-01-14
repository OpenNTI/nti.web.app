Ext.define('NextThought.model.assessment.Assignment', {
	extend: 'NextThought.model.Base',
	requires: ['NextThought.model.converters.Date'],
	isAssignment: true,
	fields: [
		{ name: 'category_name', type: 'string'},
		{ name: 'ContainerId', type: 'string', persist: false, convert: function(v, rec) {
			return v || (rec && rec.raw.containerId);
		}},
		{ name: 'containerId', type: 'string' },//lowercase C?
		{ name: 'content', type: 'string' },
		{ name: 'availableBeginning', type: 'ISODate', mapping: 'available_for_submission_beginning' },
		{ name: 'availableEnding', type: 'ISODate', mapping: 'available_for_submission_ending' },
		{ name: 'parts', type: 'arrayItem' },
		{ name: 'title', type: 'string' },
		{ name: 'SubmittedCount', type: 'int', mapping: 'GradeAssignmentSubmittedCount'},
		{ name: 'no_submit', type: 'boolean'}
	],


	containsId: function(id) {
		var parts = this.get('parts') || [],
			items = parts.filter(function(p) {
				p = p.get('question_set');
				return p && p.getId() === id;
			});

		return items.length > 0;
	},


	canSaveProgress: function() {
		return !!this.getLink('Savepoint');
	},


	getSavePoint: function() {
		var url = this.getLink('Savepoint');

		if (!url) {
			return Promise.resolve();
		}

		return Service.request(url)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			})
			.fail(function(reason) {
				console.error('Failed to get the assignment save point: ', reason);
			});
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


	isNoSubmit: function() {
		return this.get('no_submit');
	},


	doNotShow: function() {
		return this.isNoSubmit() && this.get('title') === 'Final Grade';
	},


	setGradeBookEntryFrom: function(gradebook) {
		if (!gradebook) {
			console.error('No gradebook?');
			return;
		}

		this._gradeBook = gradebook;

		var t = this.get('title'), c = this.get('category_name');
		this.setGradeBookEntry(
			gradebook.getItem(t, c, this.getId())
		);
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
			var url = this.getLink('GradeSubmittedAssignmentHistorySummaries'), s;

			if (!url) {
				console.error('The assignment record %o did not have a "Link" for GradeSubmittedAssignmentHistorySummaries', this);
				return Ext.getStore('ext-empty-store');
			}

			s = this._submittedHistoryStore = new NextThought.store.courseware.AssignmentView({
				url: url,
				remoteFilter: true,
				remoteSort: true,
				filters: [
					{id: 'LegacyEnrollmentStatus', property: 'LegacyEnrollmentStatus', value: isFeature('show-open-students-first') ? 'Open' : 'ForCredit'}
				]
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
		store.loaded = true;
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
	},


	updateGradeBookEntry: function(grade, field) {
		if (!this._gradeBookEntry) { return; }

		var username = grade.get('Username'),
            f = field || 'value',
			value = grade && grade.get(f),
			gradeBookGrade = this._gradeBookEntry.getFieldItem('Items', username);

        if(gradeBookGrade){
            gradeBookGrade.set(f, value);
        }
	},


	findMyCourse: function() {
		//returns a string that can be compared. NOTE: not for use as a URL!
		function nomnom(href) {
			return (getURL(href) || '').split('/').map(decodeURIComponent).join('/');
		}

		var link = (this.getLink('History') || this.get('href')).replace(/\/AssignmentHistories.*/, '');

		link = nomnom(link);

		return function(instance) {
			var course = instance.get('CourseInstance') || instance,
				href = nomnom(course && course.get('href'));

			return href === link;
		};
	},


	getQuestionCount: function() {
		var parts = this.get('parts'),
			part = parts && parts[0];

		return part && part.tallyParts();
	}
});
