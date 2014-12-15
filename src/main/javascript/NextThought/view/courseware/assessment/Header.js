Ext.define('NextThought.view.courseware.assessment.Header', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-header',
	ui: 'course-assessment',

	cls: 'course-assessment-header assignment-item',

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
						{tag: 'span', cls: 'label', html: 'Time Remaining:'},
						{tag: 'span', cls: 'hours time'},
						{tag: 'span', cls: 'minutes time'},
						{tag: 'span', cls: 'seconds time'}
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
		timeEl: '.time-remaining',
		timeLabelEl: '.time-remaining .label',
		hoursEl: '.time-remaining .hours',
		minutesEl: '.time-remaining .minutes',
		secondsEl: '.time-remaining .seconds'
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


	hideTimer: function() {
		this.timeEl.addCls('hidden');

		if (this.timer) {
			this.timer.stop();
		}
	},


	updateTimeEl: function(el, time) {
		var s = time.toFixed(0);

		if (time < 10) {
			s = '0' + s;
		}

		el.update(s);
	},


	showRemainingTime: function(time) {
		if (!this.rendered) {
			this.on('afterrender', this.showRemainingTime.bind(this, time));
			return;
		}

		if (time < 0) {
			this.showOverdueTime(-1 * time);
		} else {
			this.showDueTime(time);
		}

		this.timeEl.removeCls('hidden');
	},


	showOverdueTime: function(time) {
		var me = this,
			current = {};

		me.timer = TimeUtils.getTimer(time, 1);

		me.timeLabelEl.update('Past Due');
		me.timeEl.addCls('warning-red');

		me.timer
			.tick(function(t) {

				if (current.hours !== t.hours) {
					me.updateTimeEl(me.hoursEl, t.hours);
				}

				if (current.minutes !== t.minutes) {
					me.updateTimeEl(me.minutesEl, t.minutes);
				}

				me.updateTimeEl(me.secondsEl, t.seconds);

				current = t;
			})
			.start(1000);//1 second
	},


	showDueTime: function(time) {
		var me = this,
			current = {};

		me.timer = TimeUtils.getTimer(time, -1);

		me.timeLabelEl.update('Time Remaining');

		me.timer
			.tick(function(t) {
				if (current.hours !== t.hours) {
					me.updateTimeEl(me.hoursEl, t.hours);
				}

				if (current.minutes !== t.minutes) {
					me.updateTimeEl(me.minutesEl, t.minutes);
				}

				me.updateTimeEl(me.secondsEl, t.seconds);

				current = t;
			})
			.alarm(function() {
				me.timer.stop();
				me.showOverdueTime(0);
			})
			.start(1000);
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
