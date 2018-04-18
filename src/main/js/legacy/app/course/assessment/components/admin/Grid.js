const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');

const {getString, getFormattedString} = require('legacy/util/Localization');
const TimeUtils = require('legacy/util/Time');
const Globals = require('legacy/util/Globals');

const AssignmentStatus = require('../../AssignmentStatus');

require('legacy/mixins/grid-feature/GradeInputs');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.Grid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.course-admin-grid',

	mixins: {
		gridGrades: 'NextThought.mixins.grid-feature.GradeInputs'
	},

	scroll: 'vertical',

	viewConfig: {
		loadMask: true
	},

	verticalScroller: {
		synchronousRender: !Ext.isGecko,
		scrollToLoadBuffer: 100,
		trailingBufferZone: 100,
		numFromEdge: 50,
		leadingBufferZone: 150
	},

	disableSelection: true,
	selType: 'cellmodel',

	columns: {
		defaults: {
			//reverse the default state order (descending first)
			possibleSortStates: ['DESC', 'ASC'],
			resizable: false
		},

		items: [
			{
				text: getString('NextThought.view.courseware.assessment.admin.Grid.assignment'),
				dataIndex: 'name',
				name: 'name',
				tdCls: 'padded-cell',
				padding: '0 0 0 30',
				flex: 1,
				doSort: function (state) {
					let get = (o) => { return o.get('name'); },
						store = this.up('grid').getStore(),
						sorters = [
							{
								direction: state,
								property: 'name',
								sorterFn: function (a, b) {
									let aVal = get(a),
										bVal = get(b),
										aNum = parseFloat(aVal),
										bNum = parseFloat(bVal),
										sort;

									/*
										Identical to student sorting
									 */
									if (!isNaN(aNum) && isNaN(bNum)) {
										sort = -1;
									} else if (isNaN(aNum) && !isNaN(bNum)) {
										sort = 1;
									} else if (!isNaN(aNum) && !isNaN(bNum)) {
										sort = aNum > bNum ? -1 : aNum === bNum ? 0 : 1;
									} else {
										sort = Globals.naturalSortComparator((aVal || '').toUpperCase(), (bVal || '').toUpperCase());
									}
									return sort;
								}
							}
						];
					store.sort(sorters);
				}
			},


			{ text: getString('NextThought.view.courseware.assessment.admin.Grid.completed'), dataIndex: 'completed', name: 'completed', width: 140,
				renderer: function (v, col, rec) {
					var d = rec.collection.findItem(rec.get('item').getId()).get('availableEnding'),
						s = (v && v.get && v.get('Last Modified')) || v;


					if (!s && !d) {
						return '';
					}

					//if no submission
					if (!s) {
						return Ext.DomHelper.markup({
							cls: 'incomplete',
							html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.incomplete', {date: Ext.Date.format(d, 'm/d')})
						});
					}

					//If the submission was created from an instructor adding a grade
					if (rec.isSyntheticSubmission()) {
						return Ext.DomHelper.markup({
							cls: 'ontime',
							cn: [
								{tag: 'span', html: 'Graded '},
								{tag: 'span', html: Ext.Date.format(s, 'm/d')}
							]
						});
					}

					//if the submisson is before the due date
					if (d > s) {
						return Ext.DomHelper.markup({cls: 'ontime', html: getString('NextThought.view.courseware.assessment.admin.Grid.ontime')});
					}
					//if we don't have a due data to tell how late it was
					if (!d) {
						return Ext.DomHelper.markup({
							cls: 'ontime',
							'data-qtip': getString('NextThought.view.courseware.assessment.admin.Grid.ontime'),
							html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.submitted', {date: Ext.Date.format(s, 'm/d')})
						});
					}

					//if we get here the submission was late
					d.html = TimeUtils.getNaturalDuration(Math.abs(s - d), 1);

					return Ext.DomHelper.markup({
						cls: 'late',
						'data-qtip': getFormattedString('NextThought.view.courseware.assessment.admin.Grid.late', {
							late: d.html
						}),
						html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.submitted', {date: Ext.Date.format(s, 'm/d')})
					});
				},
				doSort: function (state) {
					function get (o) { o = o.data; return o.completed || o.due; }
					var store = this.up('grid').getStore(),
						groupModifier = state === 'ASC' ? 1 : -1,
						sorters = [
							{
								direction: state,
								property: 'dateSubmitted',
								sorterFn: function (a, b) {
									var v1 = !!a.get('completed'),
										v2 = !!b.get('completed'),
										v = v1 && !v2 ? -1 : (!v1 && v2 ? 1 : 0);

									//keep the completed items on top
									return groupModifier * v;
								}
							},
							{
								direction: state,
								property: 'dateSubmitted',
								//not invoked if remote sort.
								sorterFn: function (a, b) {
									var v1 = get(a), v2 = get(b);
									return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
								}
							}
						];

					store.sort(sorters);
				}
			},



			{
				text: getString('NextThought.view.courseware.assessment.admin.Grid.score'),
				componentCls: 'score',
				dataIndex: 'Grade', allowTab: true, name: 'grade', width: 120,/*90*/
				tdCls: 'text score',
				renderer: function (v, col, rec) {
					const item = rec.get('item');
					const totalPoints = item && item.get('total_points');

					var grade = rec.get('Grade'),
						scoreTpl = Ext.DomHelper.markup({tag: 'input', type: 'text', value: rec.get('grade')}),
						isExcused = grade && grade.get('IsExcused'), excusedTpl;

					if (isExcused) {
						col.tdCls += ' excused';
						excusedTpl = Ext.DomHelper.markup({
							tag: 'span',
							cls: 'grade-excused',
							html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.excused')
						});

						return scoreTpl + excusedTpl;
					} else if (totalPoints) {
						col.tdCls += ' total_points';

						const pointTpl = Ext.DomHelper.markup({
							tag: 'span',
							cls: 'total-points',
							html: `/ ${totalPoints}`
						});

						return scoreTpl + pointTpl;
					}

					return scoreTpl;

				},
				doSort: function (state) {
					function getGrade (o) {
						var grade = o.get('Grade'),
							values = grade && grade.getValues(),
							value = values && values.value,
							g = value && parseFloat(value, 10);

						if (value && isNaN(g)) {
							g = value;
						}

						return g;
					}


					var store = this.up('grid').getStore(),
						less = -1, more = 1, same = 0,
						sorter = new Ext.util.Sorter({
							direction: state,
							property: store.remoteSort ? 'gradeValue' : 'Grade',
							//the transform and root are ignored on remote sort
							root: 'data',
							sorterFn: function (oA, oB) {
								var a = getGrade(oA),
									b = getGrade(oB),
									cA = oA.get('completed'),
									cB = oB.get('completed'),
									tA = typeof a,
									tB = typeof b,
									direction;

								if (cA && !cB) {
									direction = more;
								} else if (!cA && cB) {
									direction = less;
								//these are intentionally == and not ===
								} else if (a == null && b != null) {
									direction = less;
								} else if (a != null && b == null) {
									direction = more;
								} else if (tA === 'string' && tB === 'string') {
									direction = -a.localeCompare(b);
									direction = direction === 0 ? same : (direction < 0) ? less : more;
								} else if (tA === 'string' && tB !== 'string') {
									direction = less;
								} else if (tA !== 'string' && tB === 'string') {
									direction = more;
								} else {
									direction = a === b ? same : a < b ? less : more;
								}

								return direction;
							}
						});

					store.sort(sorter);
				}
			},


			{
				text: getString('NextThought.view.courseware.assessment.admin.Grid.feedback'),
				dataIndex: 'feedback',
				name: 'feedback',
				tdCls: 'feedback',
				width: 120,
				renderer: function (v, col, rec) {
					var feedbackTpl, commentText = rec.get('feedback') === 1 ? ' Comment' : ' Comments';

					feedbackTpl = Ext.DomHelper.markup({cls: 'feedback', html: rec.get('feedback') + commentText});

					if (rec.get('feedback')) {
						return feedbackTpl;
					}

					return '';
				},
				doSort: function (state) {
					var store = this.up('grid').getStore(),
						sorter = new Ext.util.Sorter({
							direction: state,
							property: store.remoteSort ? 'feedbackCount' : 'feedback',

							root: 'data',
							transform: function (o) {
								return o || 0;
							}
						});

					store.sort(sorter);
				}
			},


			{ text: '', dataIndex: 'submission', name: 'submission', sortable: false, width: 40, renderer: function (v) {
				return v && Ext.DomHelper.markup({cls: 'actions'});
			} }
		]
	},

	tabIndex: 2,
	nameOrder: ['name', 'completed', 'grade', 'feedback', 'submission'],

	markColumn: function (c) {
		var cls = 'sortedOn', el = this.getEl();
		if (el) {
			el.select('.' + cls).removeCls(cls);
			if (c) {
				c.tdCls = ('sortedOn ' + (c.tdCls || '')).trim();
				Ext.select(c.getCellSelector()).addCls(cls);
			}
		}
	},

	constructor: function (config) {
		var me = this, items = [];

		me.columns = Ext.clone(me.self.prototype.columns);
		if (config.columnOverrides) {
			Ext.apply(me.columns.items, config.columnOverrides);
		}

		(config.nameOrder || me.nameOrder || []).forEach(function (name, i) {
			var col, index;

			for (index in me.columns.items) {
				if (me.columns.items.hasOwnProperty(index)) {
					col = me.columns.items[index];

					if (col.name === name) {
						//get the new index of the student column
						if (col.allowTab) {
							config.tabIndex = items.length;
						}

						items.push(col);

						return;
					}
				}
			}

			for (index in config.extraColumns) {
				if (config.extraColumns.hasOwnProperty(index)) {
					col = config.extraColumns[index];

					if (col.name === name) {
						items.push(col);
						return;
					}
				}
			}
		});

		me.columns.items = items;

		me.callParent(arguments);

		me.on({
			sortchange: function (ct, column) {
				ct.items.each(function (c) { c.tdCls = (c.tdCls || '').replace(/sortedOn/g, '').trim(); }, ct);
				me.markColumn(column);
			},
			//selectionchange: function (sm, selected) { sm.deselect(selected); },
			viewready: function (grid) {
				grid.mon(grid.getView(), 'refresh', function () {
					grid.markColumn(grid.down('gridcolumn[sortState]'));
				});
			},
			itemclick: {fn: 'onItemClicked', scope: this},
			select: function (cmp, record) {
				me.selModel.deselect(record);
			}
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.monitorSubTree(arguments);
		var grid = this.down('gridview');

		// NOTE: We've observed that Safari invalidates
		// the table layout styles every time it refreshes
		// So we will need to listen on refresh to reapply those styles.
		if (grid && Ext.isSafari) {
			grid.on('refresh', this.adjustTableLayout.bind(this));
		}
	},

	bindStore: function (store) {
		var res = this.callParent(arguments),
			sorts = store.getSorters(),
			cols = this.columns;

		function sortForCol (col, sort) {
			var p = col.getSortParam();
			if (p === 'Creator') {
				p = col.name === 'username' ? 'username' : 'realname';
			}
			return p === sort.property;
		}

		function toState (sort) {
			if (/^asc/i.test(sort.direction)) { return 'ASC'; }
			return 'DESC';
		}

		for (let c = cols.length - 1; c >= 0; c--) {
			const col = cols[c];

			for (let s = sorts.length - 1; s >= 0; s--) {
				const sort = sorts[s];
				if (sortForCol(col, sort)) {
					try {
						col.setSortState(toState(sort), true, true);
					} catch (e) {
						console.warn('Not marking the intial sort orders because:', e.stack || e.message || e);
					}
				}
			}
		}

		// Add table layout styles.
		this.adjustTableLayout();

		return res;
	},

	/*
	 * This function sets the table layout to fixed.
	 * We've observed that some browsers(i.e. Safari)
	 * end up mixing our styles and Ext Js table styles.
	 * In this method, we add the necessary class to override Ext Js styles.
	 */
	adjustTableLayout: function () {
		var me = this;
		this.onceRendered
			.then(function () {
				me.el.removeCls('fixed-table');
				wait(100)
					.then(function () {
						me.el.addCls('fixed-table');
					});
			});
	},

	onItemClicked: function (v, record, dom, ix, e) {
		var nib = e.getTarget('.actions');

		const gradeUpdated = () => {
			this.fireEvent('grade-updated', record);
		};

		if (nib) {
			AssignmentStatus.getActionsMenu(record, gradeUpdated, gradeUpdated).showBy(nib, 'tr-br');
			return false;
		}
	}
});
