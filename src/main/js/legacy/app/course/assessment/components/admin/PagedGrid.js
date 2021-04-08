const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const { scoped } = require('@nti/lib-locale');
const TimeUtils = require('internal/legacy/util/Time');
const {
	getString,
	getFormattedString,
} = require('internal/legacy/util/Localization');

const AssignmentStatus = require('../../AssignmentStatus');

require('internal/legacy/model/User');
require('internal/legacy/mixins/grid-feature/GradeInputs');

const t = scoped('nti-web-app.course.assessment.components.admin.PagedGrid', {
	graded: 'Graded %(date)s',
});

module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.components.admin.PagedGrid',
	{
		extend: 'Ext.grid.Panel',
		alias: 'widget.course-admin-paged-grid',

		mixins: {
			gridGrades: 'NextThought.mixins.grid-feature.GradeInputs',
		},

		cls: 'admin-paged-grid',
		layout: 'none',
		scroll: false,

		viewConfig: {
			loadMask: true,
			preserveScrollOnRefresh: true,
			layout: 'none',
		},

		disableSelection: true,

		selType: 'cellmodel',

		columns: {
			defaults: {
				//reverse the default state order (descending first)
				possibleSortStates: ['DESC', 'ASC'],
				resizable: false,

				getSortParam: function () {
					return this.sortOn || this.dataIndex;
				},

				setSortState: function (state, skipClear) {
					var ownerHeaderCt = this.getOwnerHeaderCt(),
						ascCls = this.ascSortCls,
						descCls = this.descSortCls,
						oldSortState = this.sortState;

					state = state || null;

					if (
						!this.sorting &&
						oldSortState !== state &&
						this.getSortParam()
					) {
						switch (state) {
							case 'DESC':
								this.addCls(descCls);
								this.removeCls(ascCls);
								break;
							case 'ASC':
								this.addCls(ascCls);
								this.removeCls(descCls);
								break;
							default:
								this.removeCls([ascCls, descCls]);
						}

						if (ownerHeaderCt && !this.triStateSort && !skipClear) {
							ownerHeaderCt.clearOtherSortStates(this);
						}

						this.sortState = state;

						if (this.triStateSort || state != null) {
							ownerHeaderCt.fireEvent(
								'sortchange',
								ownerHeaderCt,
								this,
								state
							);
						}
					}
				},
			},

			items: [],
		},

		pageRowTpl: new Ext.XTemplate(
			Ext.DomHelper.markup({
				tag: 'td',
				cls: '{cls} page-row',
				colspan: '{col}',
				html: '{start} - {end}',
			})
		),

		columnOrder: ['Student', 'Username', 'Completed', 'Grade'],

		definedColumns: {
			Student: {
				text: 'Student',
				dataIndex: 'Alias',
				name: 'student',
				sortOn: 'LastName',
				flex: 1,
				xtype: 'templatecolumn',
				tpl: new Ext.XTemplate(
					Ext.DomHelper.markup([
						{
							cls: 'padded-cell user-cell student-cell',
							cn: [
								'{User:avatar}',
								{
									cls: 'name',
									html: '{[this.displayName(values)]}',
								},
							],
						},
					]),
					{
						displayName: function (values) {
							if (!values.User || !values.User.isModel) {
								return 'Resolving';
							}

							var creator = values.User,
								displayName =
									creator &&
									creator.get &&
									creator.get('displayName'),
								f =
									creator &&
									creator.get &&
									creator.get('FirstName'),
								l =
									creator &&
									creator.get &&
									creator.get('LastName'),
								lm,
								d = displayName;

							if (l) {
								lm = Ext.DomHelper.markup({
									tag: 'b',
									html: l,
								});
								d = displayName.replace(l, lm);
								if (d === displayName) {
									d += ' (' + (f ? f + ' ' : '') + lm + ')';
								}
								d = Ext.DomHelper.markup({
									cls: 'accent-name',
									'data-qtip': d,
									html: d,
								});
							}

							return d;
						},
					}
				),
			},

			Username: {
				text: 'Username',
				dataIndex: 'Username',
				name: 'username',
				width: 100,
				possibleSortStates: ['ASC', 'DESC'], //restore the default order of state(since the grid reverses it)
			},

			Completed: {
				text: getString(
					'NextThought.view.courseware.assessment.admin.Grid.completed'
				),
				dataIndex: 'HistoryItem',
				name: 'completed',
				sortOn: 'dateSubmitted',
				width: 150,
				renderer: function (v, col, rec) {
					if (!rec.get('HistoryItemSummary')) {
						return '';
					}

					var item = rec.get('HistoryItemSummary'),
						completed = item && item.get('completed'),
						due = this.dueDate || item.get('due'),
						//pretty sure completed will always be a time stamp not sure why this is this complicated,
						//but I don't want to change the logic just in case
						submitted =
							(completed &&
								completed.get &&
								completed.get('Last Modifed')) ||
							completed,
						dateFormat = 'm/d',
						late = {};

					if ((!submitted && !due) || !item) {
						return '';
					}

					//if there is no submission
					if (!submitted) {
						return Ext.DomHelper.markup({
							cls: 'incomplete',
							html: getFormattedString(
								'NextThought.view.courseware.assessment.admin.Grid.incomplete',
								{
									date: Ext.Date.format(due, dateFormat),
								}
							),
						});
					}

					//If the submission was created from an instructor adding a grade
					if (item.isSyntheticSubmission()) {
						return Ext.DomHelper.markup({
							cls: 'ontime',
							cn: [
								{
									tag: 'span',
									html: t('graded', {
										date: Ext.Date.format(
											submitted,
											dateFormat
										),
									}),
								},
							],
						});
					}

					//if submission is before the due date
					if (due > submitted) {
						return Ext.DomHelper.markup({
							cls: 'ontime',
							html: getString(
								'NextThought.view.courseware.assessment.admin.Grid.ontime'
							),
						});
					}

					///if we don't have a due date to tell how late it is
					if (!due) {
						return Ext.DomHelper.markup({
							cls: 'ontime',
							'data-qtip': getString(
								'NextThought.view.courseware.assessment.admin.Grid.ontime'
							),
							html: getFormattedString(
								'NextThought.view.courseware.assessment.admin.Grid.submitted',
								{
									date: Ext.Date.format(
										submitted,
										dateFormat
									),
								}
							),
						});
					}

					//if we get here the submission was late
					late.html = TimeUtils.getNaturalDuration(
						Math.abs(submitted - due),
						1
					);

					return Ext.DomHelper.markup({
						cls: 'late',
						'data-qtip': getFormattedString(
							'NextThought.view.courseware.assessment.admin.Grid.late',
							{
								late: late.html,
							}
						),
						html: getFormattedString(
							'NextThought.view.courseware.assessment.admin.Grid.submitted',
							{
								date: Ext.Date.format(submitted, dateFormat),
							}
						),
					});
				},
			},

			Grade: {
				text: 'Grade',
				dataIndex: 'HistoryItemSummary',
				name: 'grade',
				sortOn: 'Grade',
				width: 70,
				xtype: 'templatecolumn',
				tpl: new Ext.XTemplate(
					Ext.DomHelper.markup([
						{
							cls: 'gradebox',
							cn: [
								{
									tag: 'input',
									size: 3,
									tabindex: '1',
									type: 'text',
									value: '{[this.getGrade(values)]}',
								},
								{
									cls: 'dropdown letter grade',
									tabindex: '1',
									html: '{[this.getLetter(values)]}',
								},
							],
						},
					]),
					{
						getGrade: function (values) {
							var historyItem = values.HistoryItemSummary,
								grade = historyItem && historyItem.get('Grade'),
								gradeVals = (grade && grade.getValues()) || {};

							return gradeVals.value || '';
						},

						getLetter: function (values) {
							var historyItem = values.HistoryItemSummary,
								grade = historyItem && historyItem.get('Grade'),
								gradeVals = (grade && grade.getValues()) || {};

							return gradeVals.letter || '';
						},
					}
				),
			},

			Feedback: {
				text: getString(
					'NextThought.view.courseware.assessment.admin.Grid.feedback'
				),
				dataIndex: 'HistoryItemSummary',
				name: 'feedback',
				tdCls: 'feedback',
				sortOn: 'feedbackCount',
				width: 120,
				renderer: function (v, col, rec) {
					if (!rec.get('HistoryItemSummary')) {
						return;
					}

					var item = rec.get('HistoryItemSummary'),
						feedback = item && item.get('feedback'),
						feedbackTpl = '';

					if (feedback) {
						feedbackTpl = Ext.DomHelper.markup({
							cls: 'feedback',
							html: Ext.util.Format.plural(feedback, 'Comment'),
						});
					}

					return feedbackTpl;
				},
			},

			Submission: {
				text: '',
				dataIndex: 'HistoryItemSummary',
				name: 'submission',
				sortable: false,
				width: 40,
				renderer: function (v, col, rec) {
					var item = rec.get('HistoryItemSummary');

					if (item && AssignmentStatus.hasActions(item)) {
						return v && Ext.DomHelper.markup({ cls: 'actions' });
					}
				},
			},
		},

		__getColumnConfigs: function (order, extras, overrides) {
			var items = [],
				definedColumns = Ext.clone(this.self.prototype.definedColumns);

			extras = extras || {};
			overrides = overrides || {};

			order.forEach(function (name) {
				var col;

				if (extras[name]) {
					col = extras[name];
				} else if (overrides[name]) {
					col = Ext.apply(
						definedColumns[name] || {},
						overrides[name]
					);
				} else if (definedColumns[name]) {
					col = definedColumns[name];
				}

				if (col) {
					items.push(col);
				}
			});

			return items;
		},

		constructor: function (config) {
			var me = this,
				items = [],
				extraCols = config.extraColumns || {},
				overrides = config.columnOverrides || {},
				order = config.columnOrder || me.columnOrder || [];

			//Clone the instances columns so it doesn't affect the other instances
			me.columns = Ext.clone(me.self.prototype.columns);
			me.columnOrder = order;

			items = me.__getColumnConfigs(order, extraCols, overrides);

			me.columns.items = items;

			me.callParent(arguments);

			me.on({
				sortchange: function (ct, column) {
					ct.items.each(function (c) {
						c.tdCls = (c.tdCls || '')
							.replace(/sortedOn/g, '')
							.trim();
					}, ct);
					me.markColumn(column);
				},
				viewready: function (grid) {
					grid.mon(grid.getView(), 'refresh', function () {
						grid.markColumn(grid.down('gridcolumn[sortState]'));
					});
				},
				itemclick: { fn: 'onItemClicked', scope: this },
				select: function (cmp, record) {
					me.selModel.deselect(record);
				},
			});
		},

		showColumn: function (name) {
			var index = (this.HIDDEN_INDEX || {})[name],
				items;

			//can't show a column if we didn't hide it first
			if (!index) {
				return;
			}

			delete this.HIDDEN_INDEX[name];

			items = this.__getColumnConfigs(
				this.columnOrder.filter(cName => !this.HIDDEN_INDEX[cName]),
				this.extraColumns,
				this.columnOverrides
			);

			this.reconfigure(this.store, items);
		},

		hideColumn: function (name) {
			this.HIDDEN_INDEX = this.HIDDEN_INDEX || {};

			var index = this.columnOrder.indexOf(name),
				items;

			//if the column is already hidden
			if (this.HIDDEN_INDEX[name] >= 0) {
				return;
			}

			this.HIDDEN_INDEX[name] = index;

			items = this.__getColumnConfigs(
				this.columnOrder.filter(cName => !this.HIDDEN_INDEX[cName]),
				this.extraColumns,
				this.columnOverrides
			);

			this.reconfigure(this.store, items);
		},

		afterRender: function () {
			this.callParent(arguments);

			var view = this.getView(),
				grid = this.down('gridview');

			this.mon(view, 'refresh', 'setUpPageRows');

			this.mon(this.el, 'click', 'maybeLoadPage');

			this.monitorSubTree();

			// NOTE: We've observed that Safari invalidates
			// the table layout styles every time it refreshes
			// So we will need to listen on refresh to reapply those styles.
			if (grid && Ext.isSafari) {
				grid.on('refresh', this.adjustTableLayout.bind(this));
			}

			this.adjustTableLayout();
		},

		/*
		 * This function sets the table layout to fixed.
		 * We've observed that some browsers(i.e. Safari)
		 * end up mixing our styles and Ext Js table styles.
		 * In this method, we add the necessary class to override Ext Js styles.
		 */
		adjustTableLayout: function () {
			var me = this;
			this.onceRendered.then(function () {
				me.el.removeCls('fixed-table');
				wait(100).then(function () {
					me.el.addCls('fixed-table');
				});
			});
		},

		setDisabled: function () {
			this.addCls('disabled');
		},

		setEnabled: function () {
			this.removeCls('disabled');
		},

		scrollToTop: function () {
			var dom = Ext.getBody();

			if (dom) {
				dom.setScrollTop(0);
			}
		},

		maybeLoadPage: function (e) {
			var pageRow = e.getTarget('td.page-row');

			if (!pageRow) {
				return;
			}

			pageRow = Ext.get(pageRow);

			if (pageRow.hasCls('nextPage')) {
				this.loadNextPage();
			} else if (pageRow.hasCls('prevPage')) {
				this.loadPreviousPage();
			}
		},

		loadPreviousPage: function () {
			var current = parseInt(this.store.getCurrentPage(), 10);

			if (current > 1) {
				this.mon(this.store, {
					single: true,
					load: 'scrollToTop',
				});

				this.fireEvent('load-page', current - 1);
			}
		},

		loadNextPage: function () {
			var current = parseInt(this.store.getCurrentPage(), 10),
				total = this.store.getTotalPages();

			if (current < total) {
				this.mon(this.store, {
					single: true,
					load: 'scrollToTop',
				});

				this.fireEvent('load-page', current + 1);
			}
		},

		setUpPageRows: function () {
			var view = this.getView(),
				store = this.store,
				totalPage = store.getTotalPages(),
				tbody = view.el.down('tbody');

			if (!totalPage || !tbody) {
				return;
			}

			this.addPrevRow(tbody);
			this.addNextRow(tbody);
		},

		addPrevRow: function (tbody) {
			var prevPageRow = tbody && tbody.down('tr.prevPage'),
				currentPage = this.store.getCurrentPage(),
				pageSize = this.store.pageSize,
				prevPage = currentPage - 1,
				start,
				end;

			//if the prev page is less than the first one
			if (prevPage < 1) {
				if (prevPageRow) {
					tbody.removeChild(prevPageRow);
				}

				return;
			}

			//account for the 0 based index
			start = (prevPage - 1) * pageSize + 1;
			end = start + pageSize - 1;

			//if theres isn't a prev row or the range is different from whats currently showing
			if (
				!prevPageRow ||
				start !== this.prevStartIndex ||
				end !== this.prevEndIndex
			) {
				if (prevPageRow) {
					tbody.removeChild(prevPageRow);
				}
				//inset at the front
				prevPageRow = tbody.dom.insertRow(0);

				this.prevStartIndex = start;
				this.prevEndIndex = end;

				this.pageRowTpl.append(prevPageRow, {
					cls: 'prevPage',
					start: start,
					end: end,
					col: this.columns.length,
				});
			}
		},

		addNextRow: function (tbody) {
			var nextPageRow = tbody && tbody.down('tr.nextPage'),
				currentPage = this.store.getCurrentPage(),
				totalPages = this.store.getTotalPages(),
				pageSize = this.store.pageSize,
				totalCount = this.store.getTotalCount(),
				currentPageSize = this.store.getCount(),
				nextPage = currentPage + 1,
				start,
				end;

			if (nextPage > totalPages) {
				if (nextPageRow) {
					tbody.removeChild(nextPageRow);
				}

				return;
			}

			start = (nextPage - 1) * pageSize + 1;
			end = start + currentPageSize - 1;

			//the end can't be more than the total
			if (end > totalCount) {
				end = totalCount;
			}

			//if there isn't a next row or the range is different from whats currently showing
			if (
				!nextPageRow ||
				start !== this.nextStartIndex ||
				end !== this.nextEndIndex
			) {
				if (nextPageRow) {
					tbody.removeChild(nextPageRow);
				}
				//insert at the end
				nextPageRow = tbody.dom.insertRow();

				this.nextStartIndex = start;
				this.nextEndIndex = end;

				this.pageRowTpl.append(nextPageRow, {
					cls: 'nextPage',
					start: start,
					end: end,
					col: this.columns.length,
				});
			}
		},

		markColumn: function (c) {
			var cls = 'sortedOn',
				el = this.getEl();
			if (el) {
				el.select('.' + cls).removeCls(cls);
				if (c) {
					c.tdCls = ('sortedOn ' + (c.tdCls || '')).trim();
					Ext.select(c.getCellSelector()).addCls(cls);
				}
			}
		},

		getHistoryItemFromRecord: function (record) {
			const container = record.get('HistoryItemSummary');

			return container?.getMostRecentHistoryItem ? container.getMostRecentHistoryItem() : container;
		},

		onItemClicked: function (v, record, dom, i, e) {
			var nib = e.getTarget('.actions'),
				historyItem = record.get('HistoryItemSummary') || record,
				menu;

			if (nib) {
				menu = AssignmentStatus.getActionsMenu(historyItem);

				menu.showBy(nib, 'tr-br');

				return false;
			}

			if (e.getTarget('.gradebox')) {
				return false;
			}
		},

		bindStore: function (store) {
			var res = this.callParent(arguments),
				sorts = store.getSorters(),
				s,
				sort,
				cols = this.columns,
				c,
				col;

			function sortForCol(column, sorting) {
				var p = column.getSortParam();
				if (p === 'Creator') {
					p = column.name === 'username' ? 'username' : 'realname';
				}
				return p === sorting.property;
			}

			function toState(sorting) {
				if (/^asc/i.test(sorting.direction)) {
					return 'ASC';
				}
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
							console.warn(
								'Not marking the intial sort orders because:',
								e.stack || e.message || e
							);
						}
					}
				}
			}

			// Add table layout styles.
			this.adjustTableLayout();

			return res;
		},
	}
);
