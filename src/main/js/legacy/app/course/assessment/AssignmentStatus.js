const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');
const TimeUtils = require('internal/legacy/util/Time');

const t = scoped('nti-web-app.course.assessment.AssignmentStatus', {
	status: {
		completed: {
			graded: 'graded',
		},
		excused: {
			label: 'Excused Grade',
			tooltip: 'This assignment will NOT count towards your grade',
		},
	},
	actions: {
		reset: 'Reset Assignment',
		excuse: 'Excuse Grade',
		unexcuse: 'Unexcuse Grade',
	},
});

module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.AssignmentStatus',
	{
		statics: {
			statusTpl: new Ext.XTemplate(
				Ext.DomHelper.markup({
					cls: 'assignment-status {cls}',
					cn: [
						{
							tag: 'tpl',
							if: 'maxTime',
							cn: [
								{
									cls: 'status-item maxTime {maxTime.cls}',
									html: '{maxTime.html}',
								},
							],
						},
						{
							tag: 'tpl',
							if: 'completed',
							cn: [
								{
									cls: 'status-item completed',
									cn: [
										{
											tag: 'span',
											cls: 'completed-label {completed.cls}',
											'data-qtip': '{completed.qtip}',
											html: '{completed.html}',
										},
										{
											tag: 'tpl',
											if: 'overdue || overtime',
											cn: [
												{
													tag: 'span',
													cls: 'completed-errors',
													cn: [
														'(',
														{
															tag: 'tpl',
															if: 'overtime',
															cn: [
																{
																	tag: 'span',
																	cls: 'overtime',
																	'data-qtip':
																		'{overtime.qtip}',
																	html: '{overtime.html}',
																},
															],
														},
														{
															tag: 'tpl',
															if: 'overtime && overdue',
															cn: ', ',
														},
														{
															tag: 'tpl',
															if: 'overdue',
															cn: [
																{
																	tag: 'span',
																	cls: 'overdue',
																	'data-qtip':
																		'{overdue.qtip}',
																	html: '{overdue.html}',
																},
															],
														},
														')',
													],
												},
											],
										},
										{
											tag: 'span',
											cls: 'completed-date',
											html: '{completed.date}',
										},
									],
								},
							],
						},
						{
							tag: 'tpl',
							if: 'due && !completed',
							cn: [
								{
									cls: 'status-item due {due.cls}',
									'data-qtip-fn': '{due.qtipFn}',
									html: '{due.html}',
								},
							],
						},
						{
							tag: 'tpl',
							if: 'excused',
							cn: [
								{
									tag: 'span',
									cls: 'excused',
									html: '{excused.html}',
									'data-qtip': '{excused.qtip}',
								},
							],
						},
					],
				})
			),

			__getMaxTimeStatus: function (data) {
				//if there is no max time this isn't timed
				if (!data.maxTime) {
					return null;
				}

				var d = {};

				if (data.duration) {
					d.html = TimeUtils.getNaturalDuration(data.duration, 2);

					if (data.duration <= data.maxTime) {
						d.cls = 'ontime';
					} else {
						d.cls = 'overtime';
					}
				} else {
					d.html =
						TimeUtils.getNaturalDuration(data.maxTime, 2, true) +
						' time limit';
				}

				return d;
			},

			__getDueStatus: function (data) {
				var now = new Date(),
					d = {},
					draftPrefix = data.isDraft ? 'Draft -&nbsp;' : '';
				//It's due today if it's the same day and its not past due
				if (TimeUtils.isSameDay(now, data.due) && data.due > now) {
					d.html =
						draftPrefix +
						'Due Today at ' +
						Ext.Date.format(data.due, 'g:i a T') +
						'!';
					d.cls = 'today';
					d.qtipFn = 'getTimeUntilDue';
				} else {
					if (data.isNoSubmitAssignment) {
						d.cls = 'nosubmit';
					}

					if (data.start > now && data.due > now) {
						d.html =
							draftPrefix +
							'Available ' +
							Ext.Date.format(data.start, 'l, F j g:i A T');
					} else if (data.due) {
						d.html =
							draftPrefix +
							'Due ' +
							Ext.Date.format(data.due, 'l, F j g:i A T');
					} else {
						if (data.start < now) {
							d.html = draftPrefix + 'Available Now' + '&nbsp;';
						} else if (!data.isDraft) {
							d.html =
								draftPrefix +
								'Available ' +
								Ext.Date.format(data.start, 'l, F j g:i A T');
						} else if (data.isDraft) {
							d.html = 'Draft&nbsp';
						}
					}

					if (now >= data.due) {
						d.cls = `${d.cls || ''} late`.trim();
					}
				}

				return d;
			},

			__getSubmittedToolTip: function (submitted) {
				return (
					'<span>' +
					'Submitted At ' +
					Ext.Date.format(submitted, 'g:i A n/j/Y') +
					'</span>'
				);
			},

			__getCompletedStatus: function (data) {
				if (!data.completed) {
					return null;
				}

				var d = {
					html: 'completed',
					date: Ext.Date.format(data.completed, 'l, F j'),
				};

				if (data.isNoSubmitAssignment) {
					d.html = t('status.completed.graded');
				}
				//if due is undefined this will be false
				if (data.completed < data.due) {
					d.cls = 'ontime';
					d.qtip = this.__getSubmittedToolTip(data.completed);
				}

				return d;
			},

			__getOverTimeStatus: function (data) {
				//if we don't have a max time or duration there can be no overtime string
				if (
					!data.maxTime ||
					!data.duration ||
					data.maxTime > data.duration
				) {
					return null;
				}

				var diff = data.duration - data.maxTime;

				return {
					html: 'overtime',
					qtip: TimeUtils.getNaturalDuration(diff, 1) + ' overtime',
				};
			},

			__getOverDueStatus: function (data) {
				//if we aren't completed or we were completed on time there is no overdue string
				//if we don't have a due date we can't be over due
				if (
					!data.completed ||
					!data.due ||
					data.completed <= data.due ||
					data.isNoSubmitAssignment
				) {
					return null;
				}

				var diff = data.completed.getTime() - data.due.getTime(),
					qtip = TimeUtils.getNaturalDuration(diff, 1) + ' overdue',
					d = { html: 'overdue' };

				qtip +=
					' &middot; ' + this.__getSubmittedToolTip(data.completed);

				d.qtip = qtip;

				return d;
			},

			__getExcuseGradeStatus: function (data) {
				if (!data.isExcused) {
					return null;
				}

				return {
					html: t('status.excused.label'),
					qtip: t('status.excused.tooltip'),
				};
			},

			getRenderData: function (data) {
				return {
					maxTime: this.__getMaxTimeStatus(data),
					completed: this.__getCompletedStatus(data),
					overtime: this.__getOverTimeStatus(data),
					overdue: this.__getOverDueStatus(data),
					due: this.__getDueStatus(data),
					excused: this.__getExcuseGradeStatus(data),
				};
			},

			/**
			 * Takes the data from an assignment and compiles the statusTpl, needs:
			 *
			 *	due: date,
			 *	completed: date, [optional] //only if it has been completed
			 *	maxTime: Number, [optional] //if the assignment is timed the max time allowed
			 *	duration: Number [optional] //if the assignment is timed and completed how long they took
			 *
			 * @param  {Object} data the above fields for the assignment
			 * @returns {string}		 [description]
			 */
			getStatusHTML: function (data) {
				var renderData = this.getRenderData(data);

				renderData.cls = renderData.due ? renderData.due.cls : '';

				return this.statusTpl.apply(renderData);
			},

			getTimeRemaining: function (due) {
				var diff = due.getTime() - new Date().getTime();

				return TimeUtils.getNaturalDuration(diff, 1) + ' remaining';
			},

			/**
			 * If there are any actions for a history item
			 *
			 * @param  {UsersCourseAssignmentHistoryItem}  containerRecord history item to check
			 * @returns {boolean}		if there are actions
			 */
			hasActions: function (containerRecord) {
				const record = containerRecord?.getMostRecentHistoryItem
					? containerRecord.getMostRecentHistoryItem()
					: containerRecord;
				const grade = record?.get('Grade');

				return record?.get('submission') || grade?.isExcusable();
			},

			/**
			 * Return a menu of actions available for a history item
			 *
			 * @param  {UsersCourseAssignmentHistoryItem} containerRecord the history item we are getting actions for
			 * @param {Function} onReset -
			 * @param {Function} onExcused -
			 * @returns {Ext.Menu} a menu component
			 */
			getActionsMenu: function (
				containerRecord,
				onReset = () => {},
				onExcused = () => {}
			) {
				var menu = Ext.widget('menu', {
						ownerCmp: this,
						constrainTo: Ext.getBody(),
						defaults: {
							ui: 'nt-menuitem',
							plain: true,
						},
					}),
					txt,
					grade;

				const record = containerRecord?.getMostRecentHistoryItem
					? containerRecord.getMostRecentHistoryItem()
					: containerRecord;

				if (record.get('submission')) {
					menu.add(
						new Ext.Action({
							text: t('actions.reset'),
							scope: this,
							handler: () => {
								if (containerRecord.hasLink('Reset')) {
									containerRecord.beginReset().then(onReset);
								} else if (
									containerRecord.resolveFullContainer
								) {
									containerRecord
										.resolveFullContainer()
										.then(container => {
											container
												.beginReset()
												.then(onReset);
										});
								}
							},
							itemId: 'delete-assignment-history',
							ui: 'nt-menuitem',
							plain: true,
						})
					);
				}

				grade = record.get('Grade');

				if (grade && grade.isExcusable()) {
					txt = grade.get('IsExcused')
						? t('actions.unexcuse')
						: t('actions.excuse');

					menu.add(
						new Ext.Action({
							text: txt,
							scope: this,
							handler: () => {
								record.handleExcuseGrade().then(onExcused);
							},
							itemId: 'excuse-grade-item',
							ui: 'nt-menuitem',
							plain: true,
						})
					);
				}

				menu.on('hide', 'destroy');

				return menu;
			},

			MAX_TIME_UNITS: 2,

			WARNING_TIME_MINUTES: 1,

			getTimeString: function (time, roundUp) {
				function buildTimeString(timeArray, ceil) {
					if (Ext.isEmpty(timeArray)) {
						return '';
					}

					var str = [],
						len = timeArray.length,
						tmp,
						u;

					for (var i = 0; i < len; i++) {
						u = timeArray[i];

						// If it's the last unit, roundup or down depending on passed parameter.
						if (i === len - 1) {
							if (ceil) {
								tmp = Ext.util.Format.plural(
									Math.ceil(u.value),
									u.unit
								);
							} else {
								tmp = Ext.util.Format.plural(
									Math.floor(u.value),
									u.unit
								);
							}
						} else {
							tmp = Ext.util.Format.plural(
								Math.floor(u.value),
								u.unit
							);
						}

						str.push(tmp);
					}

					return str.join(' ');
				}

				if (!time) {
					return null;
				}

				var timeBin = [],
					maxUnits = this.MAX_TIME_UNITS,
					warnTime = this.WARNING_TIME_MINUTES;

				if (parseInt(time.days, 10)) {
					timeBin.push({ unit: 'Day', value: time.days });
				}

				if (parseInt(time.hours, 10)) {
					if (timeBin.length < maxUnits) {
						timeBin.push({ unit: 'Hour', value: time.hours });
					} else {
						return buildTimeString(timeBin, roundUp);
					}
				}

				if (parseInt(time.minutes, 10)) {
					if (timeBin.length < maxUnits) {
						timeBin.push({ unit: 'Minute', value: time.minutes });
					} else {
						return buildTimeString(timeBin, roundUp);
					}
				}

				if (time.minutes < warnTime && timeBin.length < maxUnits) {
					timeBin.push({ unit: 'Second', value: time.seconds });
				}

				return buildTimeString(timeBin, roundUp);
			},
		},
	}
);
