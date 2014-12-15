Ext.define('NextThought.view.courseware.assessment.Header', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-header',
	ui: 'course-assessment',

	cls: 'course-assessment-header assignment-item',

	WARNING_PERCENT: 0.2,

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
						{cls: 'time', cn: {tag: 'span'}},
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
		timeEl: '.time-remaining .time span',
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
			noPrev: !me.pageSource.hasPrevious()
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
		console.log('help clicked');
	},


	hideTimer: function() {
		this.timeContainerEl.addCls('hidden');

		if (this.timer) {
			this.timer.stop();
		}
	},

	getTimeString: function(time, current) {
		var s = '';

		current = current || {};

		if (time.hour && time.hour !== current.hour) {
			s += Ext.util.Format.plural(time.hours, 'hour');

			if (time.minutes) {
				s += ' and ';
			}
		}

		if (time.minutes && time.minutes !== current.minutes) {
			s += Ext.util.Format.plural(time.minutes + 1, 'minute');
		}

		if (!time.hours && !time.minutes) {
			s += Ext.util.Format.plural(time.seconds, 'second');
		}

		return s;
	},


	showAllowedTime: function(time) {
		if (!this.rendered) {
			this.on('afterrender', this.showAllowedTime.bind(this, time));
			return;
		}

		var t = TimeUtils.getNaturalDuration(time, 1, false, {
			week: 'Week',
			day: 'Day',
			hour: 'Hour',
			minute: 'Minute',
			second: 'Second'
		});

		this.timeContainerEl.removeCls('hidden');
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

		this.timeContainerEl.removeCls('hidden');
	},


	showOverdueTime: function(time) {
		var me = this,
			current = {};

		me.timer = TimeUtils.getTimer(time, 1);

		me.timeContainerEl.removeCls('warning-orange');
		me.timeContainerEl.addCls('warning-red');

		me.timer
			.tick(function(t) {
				var s = me.getTimeString(t);

				me.timeEl.update(s + ' past due');
			})
			.start(1000);//1 second
	},


	showDueTime: function(time, max, getSubmitFn) {
		var me = this,
			current = {};

		me.timer = TimeUtils.getTimer(time, -1);

		me.timer
			.tick(function(t) {
				var s = me.getTimeString(t, current);

				if (s) {
					me.timeEl.update(s + ' remaining');
				}

				current = t;

				if (t.remaining < 30000) {
					if (!me.timeContainerEl.hasCls('warning-red')) {
						me.timeContainerEl.addCls('warning-red');
						me.timeContainerEl.removeCls('warning-orange');
						me.showSubmitToast(getSubmitFn);
					}
				} else if (t.remaining <= max * me.WARNING_PERCENT) {
					me.timeContainerEl.addCls('warning-orange');
				}
			})
			.alarm(function() {
				me.timer.stop();

				me.timeEl.update(me.getTimeString({seconds: 0}) + ' remaining');

				wait(1000)
					.then(me.showOverdueTime.bind(me, 0));
			})
			.start(1000);
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
