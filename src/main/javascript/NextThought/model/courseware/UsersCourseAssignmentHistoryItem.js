Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItem', {
	alternateClassName: 'NextThought.model.courseware.UsersCourseAssignmentHistoryItemSummary',
	extend: 'NextThought.model.Base',

	mimeType: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitem',
	//application/vnd.nextthought.assessment.userscourseassignmenthistoryitemsummary

	fields: [
		{name: 'Feedback', type: 'singleItem', persist: false},
		{name: 'Grade', type: 'singleItem', persist: false},
		{name: 'Submission', type: 'singleItem', persist: false},
		{name: 'pendingAssessment', type: 'singleItem', persist: false},

		//set by the Assignment model when loading history. This will be unset for all other uses.
		{name: 'item', type: 'auto', persist: false},

		//<editor-fold desc="Synthetic fields derived from server data and the assocated assignment.">
		{name: 'ntiid', type: 'Synthetic', persist: false, fn: function() {
			var i = this.get('item');
			return i && i.get('ntiid');
		}},

		{name: 'ContainerId', type: 'Synthetic', persist: false, fn: function() {
			var i = this.get('item');
			return i && i.get('containerId');
		}},

		{name: 'name', type: 'Synthetic', persist: false, fn: function() {
			var i = this.get('item');
			return (i && i.get('title')) || 'Missing';
		}},

		{name: 'due', type: 'Synthetic', persist: false, fn: function() {
			var i = this.get('item');
			return i && i.getDueDate();
		}},


		{name: 'feedback', type: 'Synthetic', persist: false, fn: function(r) {
			var f = r.get('Feedback');
			f = (f && f.get('Items')) || [];
			return f.length || r.raw.FeedbackCount;
		}, convert: function() {
			this.sortType = Ext.data.SortTypes.asInt;
			return this.type.convert.apply(this, arguments);
		}},

		{name: 'correct', type: 'int', persist: false, affectedBy: 'pendingAssessment', convert: function(v, r) {
			var a = r.get('pendingAssessment');
			return (a && a.getCorrectCount()) || 0;
		}},


		{name: 'completed', type: 'date', dateFormat: 'timestamp', persist: false, mapping: 'SubmissionCreatedTime', affectedBy: 'Submission',
			convert: function(v, r) {
			if (!v) {
				var s = r.get('Submission');
				return (s && this.type.convert.call(this, s.raw.CreatedTime));
			}
			return this.type.convert.call(this, v);
		}},


		{name: 'submission', type: 'string', persist: false, affectedBy: 'Submission', convert: function(v, r) {
			r = r.raw || {};
			return (r.hasOwnProperty('SubmissionCreatedTime') || r.hasOwnProperty('Submission')) ? 'true' : '';
		} },


		{name: 'grade', type: 'Synthetic', persist: false, fn: function(r) {
			var s = r.get('Grade'),
				values = s && s.getValues();

			return (values && values.value) || '';
		}}
		//</editor-fold>
	],


	constructor: function() {
		this.callParent(arguments);
		if (this.raw && this.raw.Class === 'UsersCourseAssignmentHistoryItemSummary') {
			this.isSummary = true;
		}
	},


	getAssignmentId: function() {
		var r = this.raw,
			g = r.Grade,
			s = r.Submission,
			p = r.pendingAssessment,
			i = this.get('item');

		return (i && i.getId()) || (g && g.AssignmentId) || (s && s.assignmentId) || (p && p.assignmentId);
	},


	allowReset: function() {
		return !!this.getLink('edit');
	},

	/**
	 * Deletes the assignment history item if it can, returns a promise that either
	 * 1.)	Fufill with false if they cancel the dialog
	 * 2.)	Rejects if the request was unsuccessful
	 * 3.)	Fulfills with true if the request was successful
	 * @param  {Boolean} isMine Which message to show in the confirmation
	 * @return {Promise}         fulfills is it was successful
	 */
	resetAssignment: function(isMine) {
		var record = this,
			msg, url = record.getLink('edit');

		if (!isMine) {
			msg = 'This will reset this assignment for this student. It is not recoverable.' +
					'\nFeedback and work will be deleted.';
		} else {
			msg = 'This will reset the assignment. All work will be deleted and is not recoverable.';
		}

		return new Promise(function(fulfill, reject) {
			Ext.MessageBox.alert({
				title: 'Are you sure?',
				msg: msg,
				icon: 'warning-red',
				buttonText: true,
				buttons: {
					cancel: 'Cancel',
					yes: 'caution:Yes'
				},
				fn: function(button) {
					if (button === 'yes') {
						if (!url) {
							reject('No edit link');
						} else {
							Service.request({
								url: url,
								method: 'DELETE'
							})
								.fail(function() {
									console.error('Failed to reset assignment: ', arguments);
									reject('Request Failed');
								})
								.done(function() {
									delete record.isSummary;
									delete record.raw.SubmissionCreatedTime;
									delete record.raw.Submission;
									delete record.raw.FeedbackCount;

									record.set({
										Submission: null,
										Grade: null,
										Feedback: null,
										completed: null,
										submission: null
									});

									fulfill(true);
								});
						}
					} else {
						fulfill(false);
					}
				}
			});
		});

	},


	beginReset: function() {
		var record = this;
		Ext.MessageBox.alert({
			title: 'Are you sure?',
			msg: 'This will reset this assignment for this student. It is not recoverable.' +
				 '\nFeedback and work will be deleted.',
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				cancel: 'Cancel',
				yes: 'caution:Yes'
			},
			fn: function(button) {
				if (button === 'yes') {
					Service.request({
						url: record.getLink('UsersCourseAssignmentHistoryItem') || record.get('href'),
						method: 'DELETE'})
							.fail(function() {
								alert('Sorry, I could not do that.');
								console.error(arguments);
							})
							.done(function() {
								delete record.isSummary;
								delete record.raw.SubmissionCreatedTime;
								delete record.raw.Submission;
								delete record.raw.FeedbackCount;
								record.set({
									Submission: null,
									Grade: null,
									Feedback: null,
									completed: null,
									submission: null
								});
							});

				}
			}
		});
	},


	/**
	 * @throws Ext.Error if not successful.
	 */
	buildGrade: function() {
		//if we already have a grade don't set a new one
		if (this.get('Grade')) { return; }

		var item = this.get('item'),
			student = this.get('Creator'),
			username = student.get ? student.getId() : student,
			gradeBook = item._gradeBook,
			gradeBookRef = gradeBook && gradeBook.get('href'),
			base = gradeBookRef && gradeBookRef.split(/[\?#]/)[0],
			path = item && gradeBook && gradeBook.findGradeBookEntryFor(item.getId()),
			href = [base || '/???/']
							  .concat(path.map(encodeURIComponent))
							  .concat([username])
					  .join('/'),
			grade = path && item && NextThought.model.courseware.Grade.create({
				href: href,
				Username: username,
				Links: [
					{
						Class: 'Link',
						href: href,
						rel: 'edit'
					}
				]
			});

		if (item && !path) {
			Ext.Error.raise('Could not find a GradeBookEntry for ' + item.getId());
		}

		if (grade) {
			gradeBook.add(grade, item.getId());
			grade.phantom = false;

			this.set('Grade', grade);
		} else {
			Ext.Error.raise('No Assignment associated!');
		}
	},


	getSubmissionStatus: function(due) {
		due = due || this.get('due');

		var completed = this.get('completed');

		completed = (completed && completed.get && completed.get('Last Modified')) || completed;

		if (!due && !completed) {
			console.error('Can not get the submission status without a due or completed date');
			return;
		}

		//if there's no submission
		if (!completed) {
			return {cls: 'incomplete', html: 'Due ' + Ext.Date.format(due, 'm/d')};
		}

		//if its submitted before it was due
		if (completed < due) {
			return {cls: 'ontime', html: 'On Time'};
		}

		//if no due date we can't tell how late it is...
		if (!due) {
			return {cls: 'ontime', html: 'Submitted ' + Ext.Date.format(completed, 'm/d')};
		}

		//if we get here it was late
		due = new Duration(Math.abs(completed - due) / 1000);
		due = due.ago().replace('ago', '').trim();

		return {cls: 'late', html: due + ' Late'};
	}
}, function() {
	NextThought.model.MAP['application/vnd.nextthought.assessment.userscourseassignmenthistoryitemsummary'] = this.$className;
});
