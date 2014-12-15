Ext.define('NextThought.view.courseware.assessment.AssignmentStatus', {

	statics: {
		statusTpl: new Ext.XTemplate(
			Ext.DomHelper.markup({cls: 'assignment-status', cn: [
				{tag: 'tpl', 'if': 'maxTime', cn: [
					{tag: 'span', cls: 'item maxTime {maxTime.cls}', html: '{maxTime.html}'}
				]},
				{tag: 'tpl', 'if': 'completed', cn: [
					{cls: 'item completed', cn: [
						{tag: 'span', cls: '{completed.cls}', 'data-qtip': '{completed.tip}', html: '{completed.html}'},
						{tag: 'tpl', 'if': 'overdue || overtime', cn: [
							{tag: 'span', cls: 'completed-errors', cn: [
								'(',
								{tag: 'tpl', 'if': 'overtime', cn: [
									{tag: 'span', cls: 'overtime', 'data-qtip': '{overtime.qtip}', html: '{overtime.html}'}
								]},
								{tag: 'tpl', 'if': 'overtime && overdue', cn: ', '},
								{tag: 'tpl', 'if': 'overdue', cn: [
									{tag: 'span', cls: 'overdue', 'data-qtip': '{overdue.qtip}', html: '{overdue.html}'}
								]},
								')'
							]}
						]},
						{tag: 'span', html: '{completed.date}'}
					]}
				]},
				{tag: 'tpl', 'if': 'due && !completed', cn: [
					{tag: 'span', cls: 'item due {due.cls}', 'data-qtip-fn': '{due.qtipFn}', html: '{due.html}'}
				]}
			]})
		),


		__getMaxTimeStatus: function(data) {
			//if there is no max time this isn't timed
			if (!data.maxTime) { return null; }

			var d = {};

			if (data.duration) {
				d.html = TimeUtils.getNaturalDuration(data.duration, 2);

				if (data.duration <= data.maxTime) {
					d.cls = 'ontime';
				} else {
					d.cls = 'overtime';
				}
			} else {
				d.html = TimeUtils.getNaturalDuration(data.maxTime, 1, true) + ' time limit';
			}


			return d;
		},


		__getDueStatus: function(data) {
			var now = new Date(),
				d = {};

			if (TimeUtils.isSameDay(now, data.due)) {
				d.html = 'Due Today!';
				d.cls = 'today';
			} else {
				d.html = 'Due ' + Ext.Date.format(data.due, 'l, F j');

				if (now >= data.due) {
					d.cls = 'late';
				}
			}


			return d;
		},


		__getSubmittedToolTip: function(submitted) {
			return 'Submitted At ' + Ext.Date.format(submitted, 'g:i A n/j/Y');
		},


		__getCompletedStatus: function(data) {
			if (!data.completed) { return null; }

			var d = {
				html: 'completed',
				date: Ext.Date.format(data.completed, 'l, F j')
			};

			if (data.completed < data.due) {
				d.cls = 'ontime';
				d.qtip = this.__getSubmittedToolTip(data.completed);
			}

			return d;
		},


		__getOverTimeStatus: function(data) {
			//if we don't have a max time or duration there can be no overtime string
			if (!data.maxTime || !data.duration || data.maxTime > data.duration) { return null; }

			var diff = data.duration - data.maxTime;

			return {
				html: 'overtime',
				qtip: TimeUtils.getNaturalDuration(diff, 1) + ' overtime'
			};
		},


		__getOverDueStatus: function(data) {
			//if we aren't completed or we were completed on time there is no overdue string
			if (!data.completed || data.completed <= data.due) { return null; }

			var diff = data.completed.getTime() - data.due.getTime(),
				qtip = TimeUtils.getNaturalDuration(diff, 1) + ' ago';
				d = {
					html: 'overdue'
				};

			qtip += ' &middot; ' + this.__getSubmittedToolTip(data.completed);

			d.qtip = qtip;

			return d;
		},


		__getRenderData: function(data) {
			return {
					maxTime: this.__getMaxTimeStatus(data),
					completed: this.__getCompletedStatus(data),
					overtime: this.__getOverTimeStatus(data),
					overdue: this.__getOverDueStatus(data),
					due: this.__getDueStatus(data)
				};
		},

		/**
		 * Takes the data from an assignment and compiles the statusTpl, needs:
		 *
		 *	due: date,
		 *	completed: date, [optional] //only if it has been completed
		 *	maxTime: Number, [optional] //if the assignment is timed the max time allowed
		 * 	duration: Number [optional] //if the assignment is timed and completed how long they took
		 *
		 * @param  {Object} data the above fields for the assignment
		 * @return {String}      [description]
		 */
		getStatusHTML: function(data) {
			var renderData = this.__getRenderData(data);

			return this.statusTpl.apply(renderData);
		}
	}
});
