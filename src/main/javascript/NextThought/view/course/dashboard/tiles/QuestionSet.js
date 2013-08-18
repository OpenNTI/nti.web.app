Ext.define('NextThought.view.course.dashboard.tiles.QuestionSet',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-question-set',

	statics:{
		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish){
			var DQ = Ext.DomQuery, me = this,
				items = this.getChildrenNodes(courseNodeRecord),
				c = [], req,
				containerId = courseNodeRecord.getId();

			items = DQ.filter(items||[],'[mimeType$=naquestionset]');

			if(Ext.isEmpty(items)){
				Ext.callback(finish);
			}
			
			function findFirstUncompleted(ntiids, nodes){
				var node = nodes.shift();
				if(Ext.isEmpty(nodes)){
					return node;
				}

				if(Ext.Array.contains(ntiids, node.getAttribute('target-ntiid'))){
					findFirstUncompleted(ntiids, nodes);
				}else{
					return node;
				}
				
			}

			function findQuizSetNode(ntiid, nodes){
				if(Ext.isEmpty(nodes)){
					return;
				}

				var node = nodes.shift();

				if(node.getAttribute('target-ntiid') === ntiid){
					return node;
				}

				findQuizSetNode(ntiid, nodes);
			}

			function quizesLoaded(q, s, r){
				var rec, nextItemNode, currentItemNode = null,
					json = Ext.decode(r.responseText, true) || {},
					totalQuizes = items.length, totalAttempts = 0;
					
				nextItemNode = findFirstUncompleted(Ext.Array.pluck(json.Items || [], 'questionSetId'), items.slice());
				if(!s || Ext.isEmpty(json.Items)){
					rec = null;
				}else{
					rec =  ParseUtils.parseItems(json.Items[0])[0];
					currentItemNode = findQuizSetNode(rec.get('questionSetId'), items.slice());
					totalAttempts = json.Items.length;
				}

				Ext.callback(finish, null, [me.create({ 
					locationInfo: locationInfo, 
					latestAttempt: rec,
					nextItemNode: nextItemNode,
					currentItemNode: currentItemNode,
					totalQuizes:  totalQuizes,
					totalAttempts: totalAttempts,
					lessonStartDate: courseNodeRecord.get('startDate'),
					lastModified: courseNodeRecord.get('date')
				})]);
			}

			containerId = ContentUtils.getLineage(items[0].getAttribute('target-ntiid'))[1];
			req = {
				url: $AppConfig.service.getContainerUrl(containerId,'UniqueMinMaxSummary'),
				scope: this,
				method: 'GET',
				params: {
					//accept: NextThought.model.assessment.AssessedQuestionSet.mimeType,
					recurse: 'true',
					sortOrder: 'ascending',
					attribute: 'questionSetId'
				},
				callback: quizesLoaded
			}

			Ext.Ajax.request(req);			
		}
	},

	cls: 'question-set-tile',

	config:{
		cols: 3,
		baseWeight: 2
	},

	defaultType: 'course-dashboard-tiles-question-set-view',

	constructor: function(configs){
		configs.items = [
			{xtype: 'container', defaultType: this.defaultType, items:[
				{ 
					nextItemNode: configs.nextItemNode,
					currentItemNode: configs.currentItemNode,
					latestAttempt: configs.latestAttempt,
					totalQuizes: configs.totalQuizes,
					totalAttempts: configs.totalAttempts,
					lessonStartDate: configs.lessonStartDate,
					lessonEndDate: configs.lastModified
				 }
			]}
		];

		this.callParent([configs]);
	}
});

Ext.define('NextThought.view.course.dashboard.widget.QuestionSetView',{
	extend: 'Ext.Container',
	alias: 'widget.course-dashboard-tiles-question-set-view',

	requires: [ 'NextThought.view.assessment.Score' ],

	cls: 'question-set-view non-empty',

	headerTpl: { 
		xtype: 'component',
		cls: 'header',
		header: true,
		renderTpl: Ext.DomHelper.markup([
			{ cls: 'tile-title', html: 'Assesment'},
		])
	},

	lastAttemptTpl: {
		xtype: 'container',
		cls: 'attempt',
		attempt: true,
		items: [
			{ xtype: 'assessment-score', cls: 'score', value: 0, correctColor: '#42D2FF', textColor: '#42D2FF'},
			{ 
				xtype: 'component',
				renderTpl: Ext.DomHelper.markup(
					[
						{ cls: 'title' },
						{ cls: 'meta', cn: [
							{ tag: 'span', cls: 'question-count'},
							{ tag: 'span', cls: 'date'}
						]},
						{ cls: 'goto', html: 'Try Again'}
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
			{cls: 'next complete', html: 'Complete'}
		])
	},

	initComponent: function(){
		this.callParent(arguments);
		this.add(this.headerTpl);
		this.add(this.emptyTpl);
		this.add(this.lastAttemptTpl);
		this.add(this.progressTpl);
	},

	afterRender: function(){
		this.callParent(arguments);

		this.setLatestAttempt(this.latestAttempt, this.currentItemNode, this.nextItemNode);
		this.setProgress(this.totalAttempts, this.totalQuizes, this.nextItemNode);
	},

	setLatestAttempt: function(attempt, node, nextNode){
		var correct, total,
			latestAttempt = this.down('[attempt]'),
			chart = latestAttempt.down('assessment-score'),
			el = latestAttempt.el,
			title = el.down('.title'),
			count = el.down('.meta .question-count'),
			date = el.down('.meta .date'),
			go = el.down('.goto');

		if(!attempt || !node){
				total = nextNode.getAttribute('question-count');
				title.update(nextNode.getAttribute('label'));
				chart.setValue(0);
				count.update(total + ' question' + ((total > 1)? 's':''));
				date.destroy();
				go.update('Take Now');

				this.mon(go, 'click', function(e){
					var ntiid = nextNode.getAttribute('target-ntiid') || 'no-value',
						containerId = ContentUtils.getLineage(ntiid)[1];

					this.fireEvent('navigate-to-href', this, containerId);
				}, this);
			return;
		}

		correct = attempt.getCorrectCount() || 0;
		total = attempt.getTotalCount() || 1;

		title.update(node.getAttribute('label'));
		chart.setValue(Math.floor(100*(correct/total)));
		count.update(total + ' question' + ((total > 1)? 's': ''));
		date.update(TimeUtils.timeDifference(new Date(), this.latestAttempt.get('Last Modified')));

		this.mon(go, 'click', function(e){
			var containerId = attempt.get('ContainerId');

			this.fireEvent('navigate-to-href', this, containerId);
		}, this);
	},

	setProgress: function(attempts, total, nextNode){
		var percent = 0,
			progressContainer = this.down('[progress]'),
			progress = progressContainer.el.down('.progress'),
			value = progress.down('.bar .value'),
			next = progressContainer.el.down('.next');

		if(attempts && total){
			percent =  Math.floor(100*(attempts/total));
		}

		value.setStyle({width: percent+"%"});

		if(nextNode && attempts < total){
			next.update('Take Next');
			next.removeCls('complete');

			this.mon(next, 'click', function(e){
				var ntiid = nextNode.getAttribute('target-ntiid') || 'no-value',
					containerId = ContentUtils.getLineage(ntiid)[1];

				this.fireEvent('navigate-to-href', this, containerId);
			}, this)
		}
	}

});