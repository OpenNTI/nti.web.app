/* globals getFormattedString,Duration */
Ext.define('NextThought.view.courseware.assessment.admin.PagedGrid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.course-admin-paged-grid',


	requires: ['NextThought.view.courseware.assessment.AssignmentStatus'],

	mixins: {
		gridGrades: 'NextThought.mixins.grid-feature.GradeInputs'
	},

	scroll: 'vertical',

	viewConfig: {
		loadMask: true
	},

	selType: 'cellmodel',

	columns: {
		defaults: {
			//reverse the default state order (descending first)
			possibleSortStates: ['DESC', 'ASC'],
			resizable: false,

			getSortParam: function() {
				return this.sortOn || this.dataIndex;
			}
		},

		items: []
	},

	columnOrder: ['Student', 'Username', 'Completed', 'Grade'],

	definedColumns: {
		Student: {
			text: 'Student',
			dataIndex: 'Alias',
			name: 'student',
			sortOn: 'LastName',
			flex: 1,
			xtype: 'templatecolumn',
			tpl: new Ext.XTemplate(Ext.DomHelper.markup([{
					cls: 'padded-cell user-cell student-cell', cn: [
						{ cls: 'avatar', style: {backgroundImage: 'url({avatar})'} },
						{ cls: 'name', html: '{[this.displayName(values)]}'}
					]
				}]), {
					displayName: function(values) {
						if (!values.User || !values.User.isModel) {
							return 'Resolving';
						}

						var creator = values.User,
							displayName = creator && creator.get && creator.get('displayName'),
							f = creator && creator.get && creator.get('FirstName'),
							l = creator && creator.get && creator.get('LastName'),
							lm, d = displayName;

						if (l) {
							lm = Ext.DomHelper.markup({tag: 'b', html: l});
							d = displayName.replace(l, lm);
							if (d === displayName) {
								d += (' (' + (f ? f + ' ' : '') + lm + ')');
							}
							d = Ext.DomHelper.markup({cls: 'accent-name', html: d});
						}

						return d;
					}
				}
			)

		},

		Username: {
			text: 'Username',
			dataIndex: 'Username',
			name: 'username',
			width: 100,
			possibleSortStates: ['ASC', 'DESC']//restore the default order of state(since the grid reverses it)
		},

		Completed: {
			text: getString('NextThought.view.courseware.assessment.admin.Grid.completed'),
			dataIndex: 'HistoryItem',
			name: 'completed',
			sortOn: 'dateSubmitted',
			width: 150,
			renderer: function(v, col, rec) {
				if (!rec.get('HistoryItemSummary')) {
					return '';
				}

				var item = rec.get('HistoryItemSummary'),
					completed = item && item.get('completed'),
					due = this.dueDate || item.get('due'),
					//pretty sure completed will always be a time stamp not sure why this is this complicated,
					//but I don't want to change the logic just in case
					submitted = (completed && completed.get && completed.get('Last Modifed')) || completed,
					assignment = item && item.get('item'),
					parts = assignment && assignment.get('parts'),
					dateFormat = 'm/d', late;

				if ((!submitted && !due) || !item) {
					return '';
				}

				//if there is no submission
				if (!submitted) {
					return Ext.DomHelper.markup({
						cls: 'incomplete',
						html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.incomplete', {
							date: Ext.Date.format(due, dateFormat)
						})
					});
				}

				//if submission is before the due date
				if (due > submitted) {
					return Ext.DomHelper.markup({
						cls: 'ontime',
						html: getString('NextThought.view.courseware.assessment.admin.Grid.ontime')
					});
				}

				///if we don't have a due date to tell how late it is
				if (!due) {
					return Ext.DomHelper.markup({
						cls: 'ontime',
						'data-qtip': getString('NextThought.view.courseware.assessment.admin.Grid.ontime'),
						html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.submitted', {
							date: Ext.Date.format(submitted, dateFormat)
						})
					});
				}

				//if we get here the submission was late
				late = new Duration(Math.abs(submitted - due) / 1000);

				return Ext.DomHelper.markup({
					cls: 'late',
					'data-qtip': getFormattedString('NextThought.view.courseware.assessment.admin.Grid.late', {
						late: late.ago().replace('ago', '').trim()
					}),
					html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.submitted', {
						date: Ext.Date.format(submitted, dateFormat)
					})
				});
			}
		},

		Grade: {
			text: 'Grade',
			dataIndex: 'HistoryItemSummary',
			name: 'grade',
			sortOn: 'Grade',
			width: 70,
			xtype: 'templatecolumn',
			tpl: new Ext.XTemplate(Ext.DomHelper.markup([
				{cls: 'gradebox', cn: [
					{tag: 'input', size: 3, tabindex: '1', type: 'text', value: '{[this.getGrade(values)]}'},
					{cls: 'dropdown letter grade', tabindex: '1', html: '{[this.getLetter(values)]}'}
				]}
			]), {
				getGrade: function(values) {
					var historyItem = values.HistoryItemSummary,
						grade = historyItem && historyItem.get('Grade'),
						gradeVals = (grade && grade.getValues()) || {};

					return gradeVals.value || '';
				},

				getLetter: function(values) {
					var historyItem = values.HistoryItemSummary,
						grade = historyItem && historyItem.get('Grade'),
						gradeVals = (grade && grade.getValues()) || {};

					return gradeVals.letter || '';
				}
			})
		},

		Feedback: {
			text: getString('NextThought.view.courseware.assessment.admin.Grid.feedback'),
			dataIndex: 'HistoryItemSummary',
			name: 'feedback',
			tdCls: 'feedback',
			sortOn: 'feedbackCount',
			width: 140,
			renderer: function(v, col, rec) {
				if (!rec.get('HistoryItemSummary')) {
					return;
				}

				var item = rec.get('HistoryItemSummary'),
					grade = item && item.get('Grade'),
					feedback = item && item.get('feedback'),
					isExcused = grade && grade.get('IsExcused'),
					excusedTpl = '', feedbackTpl = '';

				if (isExcused) {
					excusedTpl = Ext.DomHelper.markup({
						cls: 'grade-excused on',
						html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.excused')
					});
				}

				if (feedback) {
					feedbackTpl = Ext.DomHelper.markup({
						cls: 'feedback',
						html: Ext.util.Format.plural(feedback, 'Comment')
					});
				}

				return excusedTpl + feedbackTpl;
			}
		},

		Submission: {
			text: '',
			dataIndex: 'HistoryItemSummary',
			name: 'submission',
			sortable: false,
			width: 40,
			renderer: function(v, col, rec) {
				var item = rec.get('HistoryItemSummary');

				if (item && NextThought.view.courseware.assessment.AssignmentStatus.hasActions(item)) {
					return v && Ext.DomHelper.markup({cls: 'actions'});
				}
			}
		}
	},


	constructor: function(config) {
		var me = this, items = [],
			extraCols = config.extraColumns || {},
			overrides = config.columnOverrides || {},
			order = config.columnOrder || me.columnOrder || [];

		//Clone the instances columns so it doesn't affect the other instances
		me.columns = Ext.clone(me.self.prototype.columns);
		me.definedColumns = Ext.clone(me.self.prototype.definedColumns);


		order.forEach(function(name) {
			var col;

			if (extraCols[name]) {
				col = extraCols[name];
			} else if (overrides[name]) {
				col = Ext.apply(me.definedColumns[name] || {}, overrides[name]);
			} else if (me.definedColumns[name]) {
				col = me.definedColumns[name];
			}

			if (col) {
				items.push(col);
			}
		});

		me.columns.items = items;

		me.callParent(arguments);

		me.on({
			sortchange: function(ct, column) {
				ct.items.each(function(c) { c.tdCls = (c.tdCls || '').replace(/sortedOn/g, '').trim(); }, ct);
				me.markColumn(column);
			},
			viewready: function(grid) {
				grid.mon(grid.getView(), 'refresh', function() {
					grid.markColumn(grid.down('gridcolumn[sortState]'));
				});
			},
			itemclick: {fn: 'onItemClicked', scope: this},
			select: function(cmp, record) {
				me.selModel.deselect(record);
			}
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.monitorSubTree();
	},

	markColumn: function(c) {
		var cls = 'sortedOn', el = this.getEl();
		if (el) {
			el.select('.' + cls).removeCls(cls);
			if (c) {
				c.tdCls = ('sortedOn ' + (c.tdCls || '')).trim();
				Ext.select(c.getCellSelector()).addCls(cls);
			}
		}
	},


	getHistoryItemFromRecord: function(record) {
		return record.get('HistoryItemSummary');
	},


	onItemClicked: function(v, record, dom, i, e) {
		var nib = e.getTarget('.actions'),
			historyItem = record.get('HistoryItemSummary') || record,
			menu;

		if (nib) {
			menu = NextThought.view.courseware.assessment.AssignmentStatus.getActionsMenu(historyItem);

			menu.showBy(nib, 'tr-br');

			return false;
		}

		if (e.getTarget('.gradebox')) {
			return false;
		}
	},


	bindStore: function(store) {
		var res = this.callParent(arguments),
			sorts = store.getSorters(), s, sort,
			cols = this.columns, c, col;

		function sortForCol(col, sort) {
			var p = col.getSortParam();
			if (p === 'Creator') {
				p = col.name === 'username' ? 'username' : 'realname';
			}
			return p === sort.property;
		}

		function toState(sort) {
			if (/^asc/i.test(sort.direction)) { return 'ASC'; }
			return 'DESC';
		}

		for (c = cols.length - 1; c >= 0; c--) {
			col = cols[c];

			for (s = sorts.length - 1; s >= 0; s--) {
				sort = sorts[s];
				if (sortForCol(col, sort)) {
					try {
						col.setSortState(toState(sort), true, true);
					} catch (e) {
						console.warn('Not marking the intial sort orders because:', e.stack || e.message || e);
					}
				}
			}
		}

		return res;
	}
});
