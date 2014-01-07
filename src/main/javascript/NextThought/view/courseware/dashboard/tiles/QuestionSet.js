Ext.define('NextThought.view.courseware.dashboard.tiles.QuestionSet', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-question-set',

	statics: {
		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish) {
			var DQ = Ext.DomQuery, me = this,
				items = this.getChildrenNodes(courseNodeRecord);

			items = DQ.filter(items || [], '[mimeType$=naquestionset]');

			if (Ext.isEmpty(items)) {
				Ext.callback(finish);
				return;
			}

			locationInfo.courseInstance.getAssignments()
				.done(function(assignments){
					var id = items[0].getAttribute('target-ntiid'),
						assignment = assignments.getItem(id);

					if (assignment) {
						me.getTilesForAssignment(assignment, assignments, items, locationInfo, courseNodeRecord, finish);
					} else {
						me.getTileForAssessment(items, locationInfo, courseNodeRecord, finish);
					}
				})
				.fail(function(reason){
					console.error(reason);
				});
		},

		getTileForAssessment: function(items, locationInfo, courseNodeRecord, finish){
			var req, me = this, containerId = ContentUtils.getLineage(items[0].getAttribute('target-ntiid'))[1];

			function findFirstUncompleted(ntiids, nodes) {
				var node = nodes.shift();
				if (Ext.isEmpty(nodes)) {
					return node;
				}

				if (Ext.Array.contains(ntiids, node.getAttribute('target-ntiid'))) {
					findFirstUncompleted(ntiids, nodes);
				}else {
					return node;
				}
			}

			function findQuizSetNode(ntiid, nodes) {
				if (Ext.isEmpty(nodes)) {
					return;
				}

				var node = nodes.shift();

				if (node.getAttribute('target-ntiid') === ntiid) {
					return node;
				}

				findQuizSetNode(ntiid, nodes);
			}

			function assessmentsLoaded(q, s, r) {
				var rec, nextItemNode, currentItemNode = null,
					json = Ext.decode(r.responseText, true) || {},
					totalQuizes = items.length, totalAttempts = 0;
				
				nextItemNode = findFirstUncompleted(Ext.Array.pluck(json.Items || [], 'questionSetId'), items.slice());
				
				if (!s || Ext.isEmpty(json.Items)) {
					rec = null;
				}else {
					rec = ParseUtils.parseItems(json.Items[0])[0];
					currentItemNode = findQuizSetNode(rec.get('questionSetId'), items.slice());
					totalAttempts = json.Items.length;
				}
				
				Ext.callback(finish, null, [me.create({
					locationInfo: locationInfo,
					latestAttempt: rec,
					nextItemNode: nextItemNode,
					currentItemNode: currentItemNode,
					totalQuizes: totalQuizes,
					totalAttempts: totalAttempts,
					lessonStartDate: courseNodeRecord.get('startDate'),
					lastModified: courseNodeRecord.get('date'),
					isAssignment: false
				})]);				
			}

			req = {
				url: Service.getContainerUrl(containerId, 'UniqueMinMaxSummary'),
				scope: me,
				method: 'GET',
				params: {
					//accept: NextThought.model.assessment.AssessedQuestionSet.mimeType,
					recurse: 'true',
					sortOrder: 'ascending',
					attribute: 'questionSetId'
				},
				callback: assessmentsLoaded
			};

			Ext.Ajax.request(req);
		},

		getTilesForAssignment: function(assignment, assignments, items, locationInfo, courseNodeRecord, finish){
			function getNextAssignment(a, as){
				var next, difference;

				as.get('Items').forEach(function(item){
					var due = item.get('availableBeginning'),
						diff = due && (a.get('availableBeginning') - due);

					if ( diff && diff > 0 && diff < difference) {
						next = item;
						difference = diff;
					}
				});
			}


			Ext.callback(finish, null, [this.create({
				locationInfo: locationInfo,
				nextItemNode: getNextAssignment(assignment, assignments),
				currentItemNode: assignment,
				totalQuizes: items.length,
				lessonStartDate: courseNodeRecord.get('startDate'),
				lastModified: courseNodeRecord.get('date'),
				isAssignment: true
			})]);
		}
	},

	cls: 'question-set-tile',

	config: {
		cols: 3,
		baseWeight: 2
	},

	defaultType: 'course-dashboard-tiles-question-set-view',

	constructor: function(configs) {
		var xtype = configs.isAssignment? 'course-dashboard-tiles-assignment-view' : 'course-dashboard-tiles-question-set-view';

		configs.items = [
			{xtype: 'container', defaultType: xtype, items: [
				{
					nextItemNode: configs.nextItemNode,
					currentItemNode: configs.currentItemNode,
					latestAttempt: configs.latestAttempt,
					totalQuizes: configs.totalQuizes,
					totalAttempts: configs.totalAttempts,
					lessonStartDate: configs.lessonStartDate,
					lessonEndDate: configs.lastModified,
					isAssignment: true
				 }
			]}
		];

		this.callParent([configs]);
	}
});

Ext.define('NextThought.view.courseware.dashboard.widget.QuestionSetView', {
	extend: 'Ext.Container',
	alias: 'widget.course-dashboard-tiles-question-set-view',

	requires: ['NextThought.view.assessment.Score'],

	cls: 'question-set-view non-empty',

	headerTpl: {
		xtype: 'component',
		cls: 'header',
		header: true,
		renderTpl: Ext.DomHelper.markup([
			{ cls: 'tile-title', html: 'Assessment'}
		])
	},

	lastAttemptTpl: {
		xtype: 'container',
		cls: 'attempt',
		attempt: true,
		items: [
			{ xtype: 'assessment-score', cls: 'score', value: 0, correctColor: '#047091', textColor: '#42D2FF', chartStyle: { 'stroke-width': 0 } },
			{
				xtype: 'component',
				renderTpl: Ext.DomHelper.markup(
					[
						{ cls: 'title' },
						{ cls: 'meta', cn: [
							{ tag: 'span', cls: 'question-count'},
							{ tag: 'span', cls: 'date'}
						]}
					]
				)
			}
		]
	},

	progressTpl: {
		xtype: 'component',
		cls: 'progress-container',
		progress: true,
		renderTpl: Ext.DomHelper.markup([
			{cls: 'progress', cn: [
				{cls: 'bar', cn: [
					{cls: 'value'}
				]}
			]},
			{cls: 'next complete', html: 'Try Again'}
		])
	},

	initComponent: function() {
		this.callParent(arguments);
		this.add(this.headerTpl);
		this.add(this.emptyTpl);//wtf? not defined??
		this.add(this.lastAttemptTpl);
		this.add(this.progressTpl);
	},

	afterRender: function() {
		this.callParent(arguments);

		this.setLatestAttempt(this.latestAttempt, this.currentItemNode, this.nextItemNode);
		this.setProgress(this.totalAttempts, this.totalQuizes, this.nextItemNode);
	},

	setLatestAttempt: function(attempt, node, nextNode) {
		var correct, total,
			latestAttempt = this.down('[attempt]'),
			chart = latestAttempt.down('assessment-score'),
			el = latestAttempt.el,
			title = el.down('.title'),
			count = el.down('.meta .question-count'),
			date = el.down('.meta .date'),
			go = this.el.down('.next');

		if (!attempt || !node) {
				total = nextNode.getAttribute('question-count');
				title.update(nextNode.getAttribute('label'));
				chart.setValue(0);
				count.update(total + ' question' + ((total > 1) ? 's' : ''));
				date.destroy();

				this.mon(go, 'click', function(e) {
					var ntiid = nextNode.getAttribute('target-ntiid') || 'no-value',
						containerId = ContentUtils.getLineage(ntiid)[1];

					this.fireEvent('navigate-to-href', this, containerId);
				}, this);
			return;
		}

		correct = attempt.getCorrectCount() || 0;
		total = attempt.getTotalCount() || 1;

		title.update(node.getAttribute('label'));
		chart.setValue(Math.floor(100 * (correct / total)));
		count.update(total + ' question' + ((total > 1) ? 's' : ''));
		date.update(TimeUtils.timeDifference(new Date(), this.latestAttempt.get('Last Modified')));

		this.mon(go, 'click', function(e) {
			var containerId = attempt.get('ContainerId');

			this.fireEvent('navigate-to-href', this, containerId);
		}, this);
	},

	setProgress: function(attempts, total, nextNode) {
		var percent = 0,
			progressContainer = this.down('[progress]'),
			progress = progressContainer.el.down('.progress'),
			value = progress.down('.bar .value'),
			next = progressContainer.el.down('.next');

		progress.down('.bar').hide();

		if (attempts && total) {
			percent = Math.floor(100 * (attempts / total));
		}

		value.setStyle({width: percent + '%'});

		if (nextNode && attempts < total) {
			next.update('Start');
			next.removeCls('complete');

			/*this.mon(next, 'click', function(e) {
				var ntiid = nextNode.getAttribute('target-ntiid') || 'no-value',
					containerId = ContentUtils.getLineage(ntiid)[1];

				this.fireEvent('navigate-to-href', this, containerId);
			}, this);*/
		}
	}

}, function(){
	Ext.define('NextThought.view.courseware.dashboard.widget.AssignmentView', {
		extend: 'NextThought.view.courseware.dashboard.widget.QuestionSetView',
		alias: 'widget.course-dashboard-tiles-assignment-view',

		cls: 'question-set-view non-empty assignment',

		headerTpl: {
			xtype: 'component',
			cls: 'header',
			header: true,
			renderTpl: Ext.DomHelper.markup([
				{ cls: 'tile-title', html: 'Assignment'}
			])
		},

		lastAttemptTpl: {
			xtype: 'container',
			cls: 'attempt',
			attempt: true,
			items: [
				{
					xtype: 'component',
					renderTpl: Ext.DomHelper.markup(
						[
							{ cls: 'title' },
							{ cls: 'meta', cn: [
								{ tag: 'span', cls: 'question-count'},
								{ tag: 'span', cls: 'date'}
							]}
						]
					)
				}
			]
		},


		afterRender: function(){
			this.callParent(arguments);

			this.assignmentId = this.currentItemNode.getId();
			this.setLatestAssignmentAttempt(false, null, this.currentItemNode, this.nextItemNode);
			this.fireEvent('has-been-submitted', this);			
		},


		setHistory: function(history){
			if(!history){
				console.warn('No history');
			}

			var submission = history.get('Submission'),
				completed = (submission && submission.get('CreatedTime')) || new Date(),
				due = this.assignment && this.assignment.get('availableEnding');

			this.setLatestAssignmentAttempt(true, completed > due, this.currentItemNode, this.nextItemNode);
		},


		setLatestAttempt: function(){},

		
		setLatestAssignmentAttempt: function(attempted, late, assignment, next){
			var me = this,
				lastAttempt = me.down('[attempt]'),
				el = lastAttempt.el,
				title = el.down('.title'),
				count = el.down('.meta .question-count'),
				date = el.down('.meta .date'),
				go = me.el.down('.next'),
				parts = assignment && assignment.get('parts')[0],
				questionSet = parts && parts.get('question_set'),
				questions = questionSet && questionSet.get('questions');

			title.update(assignment.get('title'));
			
			if (questions) {  
				count.update(Ext.util.Format.plural(questions.length, 'question'));
			}

			if(attempted){
				go.update('Review');
			} else {
				go.update('Start');
			}

			this.mon(go, 'click', function(){
				me.fireEvent('navigate-to-assignment', assignment.getId());
			}, {single: true});

		}
	});

});
