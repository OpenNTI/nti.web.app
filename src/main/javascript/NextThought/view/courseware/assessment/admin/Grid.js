Ext.define('NextThought.view.courseware.assessment.admin.Grid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.course-admin-grid',
	require: [
		'Ext.grid.plugin.BufferedRenderer'
	],

	gradeEditorOffsets: [0, 0],

	ui: 'course-assessment',
	plain: true,
	border: false,
	frame: false,

	scroll: 'vertical',
	sealedColumns: true,
	enableColumnHide: false,
	enableColumnMove: false,
	enableColumnResize: false,

	viewConfig: {
		loadMask: false,
		xhooks: {
			walkCells: function(pos, direction, e, preventWrap, verifierFn, scope) {
				return this.callParent([pos, direction, e, preventWrap, function(newPos) {
					var newerPos = false,
						grid = this.up('grid');

					if (newPos.column === grid.tabIndex) {
						return true;
					}
					newerPos = this.walkCells(newPos, direction, e, preventWrap);
					if (newerPos) {
						Ext.apply(newPos, newerPos);
						return true;
					}
					return false;
				}, this]);
			}
		}
	},


	selType: 'cellmodel',
	plugins: [
		{
			ptype: 'bufferedrenderer'
		},
		{
			ptype: 'cellediting',
			clicksToEdit: 1,
			listeners: {
				beforeedit: {
					element: 'el',
					fn: function(editor, e) {
						if (!e.record || e.field !== 'Grade') { return false; }

						var gradeRec = e.record.get('Grade'),
							value = gradeRec && gradeRec.get('value'),
							grades = value && value.split(' '),
							grade = grades && grades[0];

						if (!gradeRec) {
							e.record.buildGrade();
						}

						e.value = grade;
						editor.getEditor(e.record, e.column).offsets = e.grid.gradeEditorOffsets;
					}
				},
				validateedit: {
					element: 'el',
					fn: function(editor, e) {
						var grade = e.record.get('Grade'),
							v = grade.get('value');

						v = v && v.split(' ')[0];

						if (v !== e.value && !Ext.isEmpty(e.value)) {
							grade.set('value', e.value + ' -');
							grade.save();
						}

						return false;
					}
				}
			}
		}
	],



	columns: {
		ui: 'course-assessment',
		plain: true,
		border: false,
		frame: false,

		defaults: {
			ui: 'course-assessment',
			border: false,
			sortable: true,
			menuDisabled: true
		},

		items: [
				   { text: 'Assignment', dataIndex: 'name', name: 'name', tdCls: 'padded-cell', padding: '0 0 0 30', flex: 1 },


				   { text: 'Completed', dataIndex: 'completed', name: 'completed',/*submission?*/ width: 150, renderer: function(v, col, rec) {
						var d = this.dueDate || rec.get('due'),
							s = (v && v.get && v.get('Last Modified')) || v,
							item = rec.get('item'),
							parts = item && item.get('parts');


						if (!parts || !parts.length) {
							return '';
						}

						if (!s) {
							return Ext.DomHelper.markup({cls: 'incomplete', html: 'Due ' + Ext.Date.format(d, 'm/d')});
						}

						if (d > s) {
							return Ext.DomHelper.markup({cls: 'ontime', html: 'On Time'});
						}

						if (!d) {
							return Ext.DomHelper.markup({cls: 'ontime', html: 'Submitted ' + Ext.Date.format(s, 'm/d')});
						}


						d = new Duration(Math.abs(s - d) / 1000);
						return Ext.DomHelper.createTemplate({cls: 'late', html: '{late} Late'}).apply({
							late: d.ago().replace('ago', '').trim()
						});
				   } },



				   { text: 'Score', componentCls: 'score', dataIndex: 'Grade', allowTab: true, name: 'grade', width: 70,/*90*/
					   editor: 'textfield',
					   renderer: function(val) {
						   val = val && val.get('value');
						   return val && val.split(' ')[0];
					   },
					   doSort: function(state) {
						   var store = this.up('grid').getStore(),
							   sorter = new Ext.util.Sorter({
								   direction: state,
								   property: 'Grade',
								   root: 'data',
								   transform: function(o) {
									   o = o && o.get('value');
									   o = o && o.split(' ')[0];
									   return o || '';
								   }
							   });
						   store.sort(sorter);
					   }
				   },


				   { text: 'Feedback', dataIndex: 'feedback', name: 'feedback', width: 140, renderer: function(value) {
					   return value ? Ext.util.Format.plural(value, 'Comment') : '';
				   } },


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
				c.tdCls = 'sortedOn';
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
				ct.items.each(function(c) { c.tdCls = ''; }, ct);
				me.markColumn(column);
			},
			selectionchange: function(sm, selected) { sm.deselect(selected); },
			viewready: function(grid) {
				grid.mon(grid.getView(), 'refresh', function() {
					grid.markColumn(grid.down('gridcolumn[sortState]'));
				});
			},
			itemclick: {fn: 'onItemClicked', scope: this}
		});
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
			ui: 'nt',
			plain: true,
			shadow: false,
			frame: false,
			border: false,
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
