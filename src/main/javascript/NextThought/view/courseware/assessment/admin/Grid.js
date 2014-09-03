Ext.define('NextThought.view.courseware.assessment.admin.Grid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.course-admin-grid',
	requires: [],

	mixins: {
		gridGrades: 'NextThought.mixins.grid-feature.GradeInputs'
	},

	scroll: 'vertical',

	viewConfig: {
		loadMask: true
	},

	verticalScroller: {
		synchronousRender: true,
		scrollToLoadBuffer: 100,
		trailingBufferZone: 100,
		numFromEdge: 50,
		leadingBufferZone: 150
	},

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
						flex: 1
					},


					{ text: getString('NextThought.view.courseware.assessment.admin.Grid.completed'), dataIndex: 'completed', name: 'completed', width: 150,
						renderer: function(v, col, rec) {
							var d = this.dueDate || rec.get('due'),
								s = (v && v.get && v.get('Last Modified')) || v,
								item = rec.get('item'),
								parts = item && item.get('parts');


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
							d = new Duration(Math.abs(s - d) / 1000);

							return Ext.DomHelper.markup({
								cls: 'late',
								'data-qtip': getFormattedString('NextThought.view.courseware.assessment.admin.Grid.late', {
									late: d.ago().replace('ago', '').trim()
								}),
								html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.submitted', {date: Ext.Date.format(s, 'm/d')})
							});
						},
						doSort: function(state) {
							function get(o) { o = o.data; return o.completed || o.due; }
							var store = this.up('grid').getStore(),
								groupModifier = state === 'ASC' ? 1 : -1,
								sorters = [
									{
										direction: state,
										property: 'dateSubmitted',
										sorterFn: function(a, b) {
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
										sorterFn: function(a, b) {
											var v1 = get(a), v2 = get(b);
											return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
										}
									}
							  ];

							store.sort(sorters);
						}
					},



					{ text: getString('NextThought.view.courseware.assessment.admin.Grid.score'), xtype: 'templatecolumn',
						componentCls: 'score',
						dataIndex: 'Grade', allowTab: true, name: 'grade', width: 70,/*90*/
						tdCls: 'text score',
						//editor: 'textfield',
						tpl: Ext.DomHelper.markup({tag: 'input', type: 'text', value: '{grade}'}),
						doSort: function(state) {
							var store = this.up('grid').getStore(),
								sorter = new Ext.util.Sorter({
									direction: state,
									property: store.remoteSort ? 'gradeValue' : 'Grade',
									//the transform and root are ignored on remote sort
									root: 'data',
									transform: function(o) {
										var f;

										o = o && o.getValues();
										o = o && o.value;

										//convert it to a number so the sort makes sense
										f = parseFloat(o, 10);

										if (!isFinite(f)) {
											f = o;
										}
										return f || '';
									}
								});
							store.sort(sorter);
						}
					},


					{
						text: getString('NextThought.view.courseware.assessment.admin.Grid.feedback'),
						xtype: 'templatecolumn',
						dataIndex: 'feedback',
						name: 'feedback',
						width: 140,
						tpl: Ext.DomHelper.markup('{feedback:pluralIf("Comment")}'),
						doSort: function(state) {
							var store = this.up('grid').getStore(),
								sorter = new Ext.util.Sorter({
									direction: state,
									property: store.remoteSort ? 'feedbackCount' : 'feedback',

									root: 'data',
									transform: function(o) {
										return o || 0;
									}
								});

							store.sort(sorter);
						}
					},


					{ text: '', dataIndex: 'submission', name: 'submission', sortable: false, width: 40, renderer: function(v) {
						return v && Ext.DomHelper.markup({cls: 'actions'});
					} }
				]
	},

	tabIndex: 2,

	nameOrder: ['name', 'completed', 'grade', 'feedback', 'submission'],

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


	constructor: function(config) {
		var me = this, items = [];

		me.columns = Ext.clone(me.self.prototype.columns);
		if (config.columnOverrides) {
			Ext.apply(me.columns.items, config.columnOverrides);
		}

		(config.nameOrder || me.nameOrder || []).forEach(function(name, i) {
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
			sortchange: function(ct, column) {
				ct.items.each(function(c) { c.tdCls = (c.tdCls || '').replace(/sortedOn/g, '').trim(); }, ct);
				me.markColumn(column);
			},
			//selectionchange: function(sm, selected) { sm.deselect(selected); },
			viewready: function(grid) {
				grid.mon(grid.getView(), 'refresh', function() {
					grid.markColumn(grid.down('gridcolumn[sortState]'));
				});
			},
			itemclick: {fn: 'onItemClicked', scope: this},
			select: function(cmp, record) {
				me.selModel.deselect(record);
			},
			afterrender: 'monitorSubTree'
		});
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
	},


	onItemClicked: function(v, record, dom, ix, e) {
		var nib = e.getTarget('.actions');
		if (nib) {
			this.getActionsMenu(record).showBy(nib, 'tr-br');
			return false;
		}
	},


	getActionsMenu: function(record) {
		var menu = Ext.widget('menu', {
			ownerCmp: this,
			constrainTo: Ext.getBody(),
			defaults: {
				ui: 'nt-menuitem',
				plain: true
			}
		});

		menu.add(new Ext.Action({
			text: 'Reset Assignment',
			scope: this,
			handler: Ext.bind(record.beginReset, record),
			itemId: 'delete-assignment-history',
			ui: 'nt-menuitem', plain: true
		}));


		menu.on('hide', 'destroy');

		return menu;
	}
});
