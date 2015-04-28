Ext.define('NextThought.view.account.activity.feedback.Preview', {
	extend: 'Ext.container.Container',
	alias: ['widget.activity-preview-userscourseassignmenthistoryitemfeedback'],

	requires: [
		'NextThought.view.assessment.AssignmentFeedback'
	],

	cls: 'feedback-preview',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'path', cn: [
				{tag: 'span', cls: 'part course', html: '{course}'},
				{tag: 'span', cls: 'part lesson', html: '{lesson}'}
			]
		},
		{
			cls: 'assignment', cn: [
				{cls: 'status {ontime}'},
				{cls: 'meta', cn: [
					{cls: 'name', html: '{assignment}'},
					{cls: 'turned-in', html: '{turnedIn}'}
				]}
			]
		},
		{
			cls: 'show-more', cn: [
				{tag: 'span', cls: 'more-text', html: ''}
			]
		},
		{
			id: '{id}-body',
			cls: 'replies',
			cn: ['{%this.renderContainer(out,values)%}']
		}
	]),

	items: [{xtype: 'assignment-feedback', setHistory: Ext.emptyFn}],

	renderSelectors: {
		courseEl: '.path .course',
		lessonEl: '.path .lesson',
		assignmentEl: '.assignment',
		statusEl: '.assignment .status',
		nameEl: '.assignment .name',
		turnedInEl: '.assignment .turned-in',
		respondEl: '.respond',
		showMoreEl: '.show-more',
		moreTextEl: '.show-more .more-text'
	},

	initComponent: function() {
		this.callParent(arguments);

		var header;

		this.feedback = this.down('assignment-feedback');

		if (!this.feedback) {
			console.error('No assignment feedback....');
			return;
		}

		header = this.feedback.down('[name=title]');

		if (header) {
			header.destroy();
		}
	},

	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			rec = this.record;

		Promise.all([rec.getSubmission(), rec.getCourse(), rec.getFeedbackContainer()])
			.done(function(results) {
				var submission = results[0],
					course = results[1],
					courseInstance = course && course.get('CourseInstance'),
					catalogEntry = courseInstance && courseInstance.getCourseCatalogEntry(),
					courseTitle = catalogEntry && catalogEntry.get('Title'),
					feedbackContainer = results[2],
					assignmentName = rec.get('assignmentName'),
					submissionStatus = submission && submission.getSubmissionStatus(rec.get('assignmentDueDate'));

				//set the course name
				if (courseTitle) {
					me.courseEl.update(courseTitle);
				} else {
					me.courseEl.destroy();
				}

				//get and set the lesson title
				me.courseInstance = courseInstance;
				courseInstance.getOutline()
					.done(function(outline) {
						var node,
							lesson = ContentUtils.getLineage(rec.get('assignmentContainer'));
						lesson.pop(); //discard root

						if (lesson.length > 1) {
							lesson.shift();//discard leaf page
						}

						node = outline.getNode(lesson[0]);
						node = node && node.get('title');

						if (node) {
							me.lessonEl.update(node);
						} else {
							me.lessonEl.destroy();
						}

					});

				//set the assignment name
				if (assignmentName) {
					me.nameEl.update(assignmentName);
				}

				//set the submission status
				if (submissionStatus) {
					me.assignmentEl.addCls(submissionStatus.cls);
					me.turnedInEl.update(submissionStatus.html);
				}

				//fill in the feedback comments
				me.fillInFeedback(submission, feedbackContainer);

				console.log(rec, me);
			});

		me.mon(me.assignmentEl, 'click', function() {
			if (!me.courseInstance) {
				console.error('No course instance to navigate to');
				return;
			}

			me.courseInstance.fireNavigationEvent(me)
				.done(function() {
					me.fireEvent('navigate-to-assignment', me.record.get('AssignmentId'));
				});
		});

		me.mon(me.courseEl, 'click', function() {
			if (!me.courseInstance) {
				console.error('No course instance to navigate to');
				return;
			}

			me.courseInstance.fireNavigationEvent(me);
		});
	},


	fillInFeedback: function(submission, feedbackContainer) {
		var me = this, desiredHeight,
			activeId = me.record.getId(),
			items = feedbackContainer.get('Items'),
			totalItems = (items || []).length;

		me.feedback.history = submission;

		me.store = new Ext.data.Store({
			model: NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback,
			data: items,
			sorters: [
				{ property: 'CreatedTime' }
			]
		});

		me.store.addFilter({
			id: 'olderCommentsFilter',
			filterFn: function(rec) {
				return rec.getId() === activeId;
			}
		});

		totalItems = totalItems - me.store.getCount();

		//set the older comment count
		if (totalItems || true) {
			me.moreTextEl.update(Ext.util.Format.plural(totalItems, 'Comment'));

			me.mon(me.moreTextEl, 'click', function() {
				me.store.removeFilter('olderCommentsFilter');

				me.feedback.resolveUsers(me.store);

				me.showMoreEl.destroy();
			});
		} else {
			me.showMoreEl.destroy();
		}

		me.feedback.feedbackList.bindStore(me.store);

		me.feedback.resolveUsers(me.store);

		me.feedback.mon(me.feedback.feedbackList, 'itemclick', 'onFeedbackClick');

		me.feedback.show();

		me.mon(me.feedback.editor, 'deactivated-editor', function() {
			me.updateLayout();
		});
	}
});
