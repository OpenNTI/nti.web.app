const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');
const {ControlBar, NavigationBar} = require('@nti/web-assignment-editor');
const { encodeForURI } = require('@nti/lib-ntiids');

const ReactHarness = require('legacy/overrides/ReactHarness');
const TimeUtils = require('legacy/util/Time');

const AssignmentStatus = require('../../../course/assessment/AssignmentStatus');
const AccountActions = require('../../../account/Actions');

require('../Base');

function getCurrentHistoryItem (container, assignment) {
	const {CurrentMetadataAttemptItem} = assignment;
	const {Items: historyItems = []} = container;

	if (!CurrentMetadataAttemptItem) { return historyItems[historyItems.length - 1]; }

	return historyItems.find((item) => {
		return item.MetadataAttemptItem.NTIID === CurrentMetadataAttemptItem.NTIID;
	});
}


module.exports = exports = Ext.define('NextThought.app.contentviewer.navigation.assignment.Student', {
	extend: 'NextThought.app.contentviewer.navigation.Base',
	alias: 'widget.assignment-header',
	WARNING_PERCENT: 0.2,
	RED_PERCENT: 0.1,
	cls: 'student-reader-header reader-header course-assessment-header assignment-item',

	usePageSource: true,

	toolbarTpl: Ext.DomHelper.markup([
		'{super}',
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
				]},
				{cls: 'control-bar-container'}
			]
		}
	]),

	headerTpl: Ext.DomHelper.markup([
		{cls: 'assignment-status-container'}
	]),

	renderSelectors: {
		assignmentStatusContainerEl: '.assignment-status-container',
		timeContainerEl: '.time-remaining',
		loadingBarEl: '.time-remaining .time .loading-bar',
		timeLabelEl: '.time-remaining .time .meta span.label',
		timeMetaEl: '.time-remaining .time .meta',
		timeEl: '.time-remaining .time .meta span.time-left',
		helpEl: '.time-remaining .help',
		submitEl: '.time-remaining .submit',
		unansweredEl: '.time-remaining .submit .unanswered',
		submitBtnEl: '.time-remaining .submit .submit-btn',
		controlBarEl: '.control-bar-container'
	},

	beforeRender: function () {
		this.callParent(arguments);

		const totalPoints = this.assignment && this.assignment.get('total_points');
		var rd = {};

		this.AccountActions = AccountActions.create();

		rd.title = this.assignment.get('title');

		if (this.assignmentHistory) {
			if (this.assignmentHistory instanceof Promise) {
				this.assignmentHistory.then(this.applyHistoryContainer.bind(this));
			} else {
				this.applyHistoryContainer(this.assignmentHistory);
			}
		} else {
			this.applyHistoryContainer(this.assignmentHistory);
		}

		if (totalPoints) {
			rd.totalPoints = totalPoints;
		}

		this.renderData = Ext.apply(this.renderData || {}, rd);
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this,
			panel = me.up('reader');

		if (panel) {
			panel.el.appendChild(me.timeContainerEl);

			me.alignTimer();

			Ext.EventManager.onWindowResize(me.alignTimer, me, false);

			me.on('destroy', function () {
				Ext.EventManager.removeResizeListener(me.alignTimer, me);
				if (me.timer) {
					me.timer.stop();
				}
			});

			me.on('destroy', me.timeContainerEl.destroy.bind(me.timeContainerEl));
		}

		me.mon(me.submitBtnEl, 'click', 'submitAssignmentClicked');
		me.mon(me.helpEl, 'click', 'helpClicked');

		this.maybeMountControlBar();

		this.assignment.getInterfaceInstance()
			.then((assignment) => {
				this.assignmentStatusComponent = new ReactHarness({
					component: NavigationBar.Status,
					assignment: assignment,
					renderTo: this.assignmentStatusContainerEl,
					historyItemContainer: this.resolvedHistoryItemContainer,
					historyItem: this.resolvedHistoryItem,
					onTryAgain: () => {
						if (this.onTryAgain) {
							this.onTryAgain();
						}
					}
				});

				this.on('destroy', () => {
					if (this.assignmentStatusComponent) {
						this.assignmentStatusComponent.destroy();
					}
				});
			});

	},


	getControlBarConfig () {
		const routePart = encodeForURI(this.assignment.getId());

		return {
			component: ControlBar,
			assignment: this.assignment,
			doEdit: () => {
				if (this.handleEdit) {
					this.handleEdit(this.assignment);
				} else {
					this.doNavigation('', `${routePart}/edit`, {assignment: this.assignment});
				}
			},
			renderTo: this.controlBarEl
		};
	},


	maybeMountControlBar () {
		if (!this.rendered) { return; }

		if (this.assignment && this.assignment.canEdit()) {
			this.ControlBar = new ReactHarness(this.getControlBarConfig());

			this.on('destroy', () => this.ControlBar.destroy());
		}

	},


	maybeAddControlbarForPageInfo () {},


	alignTimer: function () {
		if (!this.rendered) {
			return;
		}

		var rect = this.el.dom.getBoundingClientRect();

		this.timeContainerEl.setStyle({
			left: rect.left + rect.width + 'px'
		});
	},

	helpClicked: function () {
		this.AccountActions.showContactUs();
	},

	hideTimer: function () {
		this.timeContainerEl.addCls('hidden');

		if (this.timer) {
			this.timer.stop();
		}
	},

	showAllowedTime: function (time) {
		if (!this.rendered) {
			this.on('afterrender', this.showAllowedTime.bind(this, time));
			return;
		}

		var t = TimeUtils.getNaturalDuration(time, 2);

		this.timeContainerEl.removeCls('hidden');
		this.timeContainerEl.addCls('max-time');
		this.timeEl.update(t);
	},

	showRemainingTime: function (time, max, getSubmitFn) {
		if (!this.rendered) {
			this.on('afterrender', this.showRemainingTime.bind(this, time, max, getSubmitFn));
			return;
		}

		if (this.hasHistory) { return; }

		if (time < 0) {
			wait()
				.then(this.showOverdueTime.bind(this, -1 * time, max));
		} else {
			wait()
				.then(this.showDueTime.bind(this, time, max, getSubmitFn));
		}

		this.timeContainerEl.removeCls(['hidden', 'max-time']);
	},

	showOverdueTime: function (time) {
		var me = this,
			current;

		me.timer = TimeUtils.getTimer();

		me.loadingBarEl.setWidth('100%');

		me.timer
			//add 3 seconds since the overdue animation is 3 seconds long
			.countUp(null, time + 3000)
			.tick(function (t) {
				var s = AssignmentStatus.getTimeString(t);

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
			.then(me.timer.start.bind(me.timer, 'seconds'));
	},

	showDueTime: function (time, max, getSubmitFn) {
		var me = this,
			current,
			warning = max * me.WARNING_PERCENT,
			red = Math.min(max * me.RED_PERCENT, 30 * 1000); //10% or 30 Seconds

		me.timer = TimeUtils.getTimer();

		me.timer
			.countDown(0, time)
			.tick(function (t) {
				var s = AssignmentStatus.getTimeString(t, true),
					//since we are counting down the remaining will be the max starting out
					//so 100 - %remaining of max will give the % of time left
					percentDone = 100 - ((t.remaining / max) * 100);

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
			.alarm(function () {
				me.timer.stop();
				me.showOverdueTime(0);
			})
			.start('seconds');
	},

	showSubmitToast: function (getSubmitFn) {
		if (!getSubmitFn) { return; }

		var submitState = getSubmitFn(this.updateSubmitState.bind(this));

		this.updateSubmitState(submitState);
	},

	updateSubmitState: function (submitState) {
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

	submitAssignmentClicked: function (e) {
		if (!e.getTarget('.disabled') && this.submitFn) {
			this.submitFn.call(null);
		}
	},


	applyHistoryContainer (historyContainer) {
		const updateStatusComponent = (assignment, container, item) => {
			if (this.assignmentStatusComponent) {
				this.assignmentStatusComponent.setProps({
					assignment,
					historyItemContainer: container,
					historyItem: item
				});
			}
		};


		if (!this.rendered) {
			this.on('afterrender', this.applyHistoryContainer.bind(this, historyContainer));
			return;
		}

		if (!historyContainer) {
			this.assignment.getInterfaceInstance()
				.then((assignment) => {
					delete this.resolvedHistoryContainer;
					delete this.resolvedHistoryItem;

					updateStatusComponent(assignment, null, null);
				});
			return;
		}

		Promise.all([
			historyContainer.getInterfaceInstance(),
			this.assignment.getInterfaceInstance()
		]).then(([container, assignment]) => {
			return [container, assignment, getCurrentHistoryItem(container, assignment)];
		}).then(([container, assignment, item]) => {
			if (!item) {
				updateStatusComponent(assignment, container, item);
				return;
			}

			this.hasHistory = true;

			if (this.hideTimer) {
				this.hideTimer();
			}

			this.resolvedHistoryContainer = container;
			this.resolvedHistoryItem = item;

			updateStatusComponent(assignment, container, item);
		});
	},

	setHistory: function (item, historyContainer) {
		this.assignment.updateFromServer()
			.then(() => this.applyHistoryContainer(historyContainer));
	}
});
