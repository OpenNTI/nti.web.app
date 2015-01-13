Ext.define('NextThought.view.courseware.assessment.Header', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-header',
	ui: 'course-assessment',

    requires: ['NextThought.view.courseware.assessment.AssignmentStatus'],

	cls: 'course-assessment-header assignment-item',

	WARNING_PERCENT: 0.2,
	RED_PERCENT: 0.1,

	renderTpl: Ext.DomHelper.markup([
		//toolbar
		{
			cls: 'toolbar',
			cn: [
				{ cls: 'right controls', cn: [
					{ cls: 'page', cn: [
						{ tag: 'span', cls: 'currentPage', html: '{page}'}, ' of ', {tag: 'span', cls: 'total', html: '{total}'}
					] },
					{ cls: 'up {noPrev:boolStr("disabled")}' },
					{ cls: 'down {noNext:boolStr("disabled")}' }
				] },
				//path (bread crumb)
				{
					cls: 'path-items',
					cn: [
						{ tag: 'tpl', 'for': 'path', cn: [
							{tag: 'span', cls: "path part {[ xindex === xcount? 'current' : xindex === 1? 'root' : '']}", html: '{.}'}
						]}
					]
				},
				{
					cls: 'time-remaining hidden',
					cn: [
						{cls: 'time', cn: [
							{cls: 'loading-bar'},
							{cls: 'meta', cn: [
								{tag: 'span', cls: 'label', html: 'Time Expired'},
								{tag: 'span', cls: 'time-left'}
							]}
						]},
						{cls: 'help', html: 'Report a Problem'},
						{cls: 'submit', cn: [
							{cls: 'unanswered'},
							{cls: 'submit-btn', html: 'I\'m Finished!'}
						]}
					]
				}
			]
		},
		//header
		{
			cls: 'header',
			html: '{headerContents}'
		}
	]),

	renderSelectors: {
		totalEl: '.toolbar .page .total',
		currentPageEl: '.toolbar .page .currentPage',
		pageEl: '.toolbar .page',
		pathEl: '.toolbar .path-items',
		previousEl: '.toolbar .controls .up',
		nextEl: '.toolbar .controls .down',
		timeContainerEl: '.time-remaining',
		loadingBarEl: '.time-remaining .time .loading-bar',
		timeLabelEl: '.time-remaining .time .meta span.label',
		timeMetaEl: '.time-remaining .time .meta',
		timeEl: '.time-remaining .time .meta span.time-left',
		helpEl: '.time-remaining .help',
		submitEl: '.time-remaining .submit',
		unansweredEl: '.time-remaining .submit .unanswered',
		submitBtnEl: '.time-remaining .submit .submit-btn'
	},

	headerTpl: '',

	onClassExtended: function(cls, data) {
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {},cls.superclass.renderSelectors);
		data.headerTpl = data.headerTpl || cls.superclass.headerTpl || false;

		var tpl = cls.superclass.renderTpl;

		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}

		if (!data.renderTpl) {
			data.renderTpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}

		//merge in subclass's templates
		data.renderTpl = data.renderTpl.replace('{headerContents}', data.headerTpl || '');
	},


	beforeRender: function() {
		this.callParent(arguments);

		var me = this;

		me.renderData = Ext.apply(me.renderData || {}, {
			path: me.path || [],
			page: me.pageSource.getPageNumber(),
			total: me.pageSource.getTotal(),
			noNext: !me.pageSource.hasNext(),
			noPrev: !me.pageSource.hasPrevious(),
            excused: me.__getExcusedTpl()
		});

		me.onPagerUpdate();

		me.mon(me.pageSource, 'update', 'onPagerUpdate');

		me.on({
			pathEl: {
				click: 'onPathClicked',
				mouseover: 'onPathHover'
			},
			previousEl: { click: 'firePreviousEvent' },
			nextEl: { click: 'fireNextEvent' }
		});

		me.on('destroy', function() {
			if (me.timer) {
				me.timer.stop();
			}
		});
	},

    __getExcusedTpl: function(){
        var excusedTpl = {cls: 'off', html:'Excused'};
        if(this.assignmentHistory && this.assignmentHistory.isModel){
            this.activeGradeRecord = this.assignmentHistory.get('Grade');
            if(this.activeGradeRecord && this.activeGradeRecord.get("IsExcused")){
                excusedTpl = {cls: 'on', html:'Excused'};
            }
        }
        return excusedTpl;
    },


	afterRender: function() {
		this.callParent(arguments);

		var panel = this.up('reader');

		if (panel) {
			panel.el.appendChild(this.timeContainerEl);

			this.on('destroy', 'destroy', this.timeContainerEl);
		}

		this.mon(this.submitBtnEl, 'click', 'submitAssignmentClicked');
		this.mon(this.helpEl, 'click', 'helpClicked');
	},


	helpClicked: function() {
		this.fireEvent('show-contact-us');
	},


	hideTimer: function() {
		this.timeContainerEl.addCls('hidden');

		if (this.timer) {
			this.timer.stop();
		}
	},

	showAllowedTime: function(time) {
		if (!this.rendered) {
			this.on('afterrender', this.showAllowedTime.bind(this, time));
			return;
		}

		var t = TimeUtils.getNaturalDuration(time, 2);

		this.timeContainerEl.removeCls('hidden');
		this.timeContainerEl.addCls('max-time');
		this.timeEl.update(t);
	},


	showRemainingTime: function(time, max, getSubmitFn) {
		if (!this.rendered) {
			this.on('afterrender', this.showRemainingTime.bind(this, time));
			return;
		}

		if (time < 0) {
			wait()
				.then(this.showOverdueTime.bind(this, -1 * time, max));
		} else {
			wait()
				.then(this.showDueTime.bind(this, time, max, getSubmitFn));
		}

		this.timeContainerEl.removeCls(['hidden', 'max-time']);
	},


	showOverdueTime: function(time) {
		var me = this,
			current;

		me.timer = TimeUtils.getTimer();

		me.loadingBarEl.setWidth('100%');

		me.timer
			.countUp(null, time + 3000)
			.tick(function(t) {
				var s = NextThought.view.courseware.assessment.AssignmentStatus.getTimeString(t);

				if (s && s !== current) {
					current = s;
					me.timeEl.update(s + ' Over');
				}

				me.timeMetaEl.dom.setAttribute('data-qtip', TimeUtils.getNaturalDuration(t.time) + ' over');
			});

		me.timeContainerEl.removeCls('warning-orange');
		me.timeContainerEl.addCls(['over-time', 'recent', 'warning-red']);
		me.timeLabelEl.update('Time Expired');

		wait(3034)
			.then(me.timeContainerEl.removeCls.bind(me.timeContainerEl, 'recent'))
			.then(me.timer.start.bind(me, 'seconds'));
	},


	showDueTime: function(time, max, getSubmitFn) {
		var me = this,
			current,
			warning = max * me.WARNING_PERCENT,
			red = Math.min(max * me.RED_PERCENT, 30 * 1000); //10% or 30 seconds

		me.timer = TimeUtils.getTimer();


		me.timer
			.countDown(0, time)
			.tick(function(t) {
				var s = NextThought.view.courseware.assessment.AssignmentStatus.getTimeString(t, true),
					//since we are counting down the remaining will be the max starting out
					//so 100 - %remaining of max will give the % of time left
					percentDone = 100 - ((t.remaining / max) * 100);

				//don't update the dom unless its different
				if (s && s !== current) {
					current = s;
					me.timeEl.update(s);
				}

				me.timeMetaEl.dom.setAttribute('data-qtip', TimeUtils.getNaturalDuration(t.remaining));

				me.loadingBarEl.setWidth(Math.floor(percentDone) + '%');

				if (t.remaining < red) {
					if (!me.timeContainerEl.hasCls('warning-red')) {
						me.timeContainerEl.addCls('warning-red');
						me.timeContainerEl.removeCls('warning-orange');
						me.showSubmitToast(getSubmitFn);
					}
				} else if (t.remaining <= warning) {
					me.timeContainerEl.addCls('warning-orange');
				}
			})
			.alarm(function() {
				me.timer.stop();
				me.showOverdueTime(0);
			})
			.start('seconds');
	},


	showSubmitToast: function(getSubmitFn) {
		if (!getSubmitFn) { return; }

		var submitState = getSubmitFn(this.updateSubmitState.bind(this));

		this.updateSubmitState(submitState);
	},


	updateSubmitState: function(submitState) {
		this.submitFn = submitState.submitFn;

		this.timeContainerEl.addCls('submit-showing');

		if (submitState.enabled) {
			this.submitBtnEl.removeCls('disabled');
		} else {
			this.submitBtnEl.addCls('disabled');
		}

		if (submitState.unanswered === 0) {
			this.unansweredEl.addCls('good');
			this.unansweredEl.update('All questions answered.');
		} else {
			this.unansweredEl.removeCls('good');
			this.unansweredEl.update(Ext.util.Format.plural(submitState.unanswered, 'question') + ' unanswered.');
		}
	},


	submitAssignmentClicked: function(e) {
		if (!e.getTarget('.disabled') && this.submitFn) {
			this.submitFn.call(null);
		}
	},


	showToast: function(msgOrConfig) {
		if (!this.rendered) {
			this.on('afterrender', this.showToast.bind(this, msgOrConfig));
			return;
		}

		var me = this, toast,
			config = Ext.isString(msgOrConfig) ? { text: msgOrConfig} : msgOrConfig,
			content = config.content || {html: config.text},
			currentPath = this.pathEl.down('.path.current'),//the last item in the bread crumb
			currentPathLeft = currentPath && currentPath.getX(),
			pathLeft = this.pathEl.getX(),
			left = currentPathLeft && pathLeft ? currentPathLeft - pathLeft : 0;

		config.cls = config.cls ? 'header-toast ' + config.cls : 'header-toast';

		toast = Ext.widget('box', {
			cls: config.cls,
			autoEl: content,
			renderTo: this.pathEl,
			style: {
				left: left + 'px;'
			}
		});

		if (config.minTime) {
			toast.waitToClose = wait(config.minTime);
		}

		me.pathEl.addCls('show-toast');

		return {
			el: toast,
			//fulfills after the minimum time the toast has to be open passes
			openLongEnough: toast.waitToClose,
			close: function(time) {
				this.closing = true;
				wait(time || 0)
					.then(function() {
						//if the path el is still around
						if (me.pathEl) {
							me.pathEl.removeCls('show-toast');
						}

						//wait to give the animations a chance to finish before we
						//remove the toast from the dom
						wait(500).then(toast.destroy.bind(toast));
					});
			}
		};
	},


	onPagerUpdate: function() {
		if (!this.rendered) {
			this.on({afterrender: 'onPagerUpdate', single: true});
			return;
		}

		var current = this.pageSource.getPageNumber();

		if (this.pageSource.hasNext()) {
			this.nextEl.removeCls('disabled');
		}

		if (this.pageSource.hasPrevious()) {
			this.previousEl.removeCls('disabled');
		}

		if (current) {
			this.pageEl.show();
			this.currentPageEl.update(current);
			this.totalEl.update(this.pageSource.getTotal());
		} else {
			this.pageEl.hide();
		}
	},


	onPathClicked: function(e) {
		var goHome = !!e.getTarget('.root'),
			goNowhere = !!e.getTarget('.current'),
			goUp = !goHome && !goNowhere && !!e.getTarget('.part'),
			pV = this.parentView;

		Ext.suspendLayouts();
		try {
			if (goUp) {
				this.fireGoUp();
			} else if (goHome) {

				if (pV && pV.fireGoUp) {
					pV.fireGoUp();
				} else if (pV) { console.log(pV.id + 'does not implement fireGoUp'); }

				this.fireGoUp();
			}
		} finally {
			Ext.resumeLayouts();
		}
	},


	onPathHover: function(e) {
		var part = e.getTarget('.path');

		if (!part) { return; }

		return this.onPartHover(e, part);
	},


	onPartHover: function(e, part) {
		return true;
	},


	fireGoUp: function() {
		this.fireEvent('goup', this);
	},


	firePreviousEvent: function(e) {
		if (e.getTarget('.disabled')) {
			e.stopEvent();
			return;
		}
		this.goTo(this.pageSource.getPrevious());
	},


	fireNextEvent: function(e) {
		if (e.getTarget('.disabled')) {
			e.stopEvent();
			return;
		}
		this.goTo(this.pageSource.getNext());
	},


	goTo: function(rec) {
		this.fireEvent('goto', rec);
	}
});
