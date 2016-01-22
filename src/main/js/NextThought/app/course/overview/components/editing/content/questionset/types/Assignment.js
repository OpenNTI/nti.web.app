Ext.define('NextThought.app.course.overview.components.editing.content.questionset.types.Assignment', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-questionset-assignment',

	requires: [
		'NextThought.model.AssignmentRef',
		'NextThought.app.course.overview.components.editing.content.questionset.AssignmentSelection'
	],

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.AssignmentRef.mimeType
			];
		},

		getTypes: function() {
			return [
				{
					title: 'Assignment',
					category: 'question-set',
					isAdvanced: true,
					iconCls: 'assignment',
					description: '',
					editor: this
				}
			];
		},

		getEditorForRecord: function(record) {
			if (record instanceof NextThought.model.AssignmentRef) {
				return this;
			}
		}
	},

	SWITCHED: 'switched',

	cls: 'content-editor questionset assignment',


	afterRender: function() {
		this.callParent(arguments);

		if (this.loading) {
			this.el.mask('Loading...');
		}
	},


	showEditor: function() {
		if (this.record) {
			this.showAssignmentEditor();
		} else {
			this.showAssignmentList();
		}
	},


	showAssignmentList: function(selectedItems) {
		var me = this;

		if (me.assignmentSelectionCmp) {
			me.assignmentSelectionCmp.destroy();
			delete me.assignmentSelectionCmp;
		}

		if (me.assignmentEditorCmp) {
			me.assignmentEditorCmp.destroy();
			delete me.assignmentEditorCmp;
		}

		me.removeAll(true);

		me.assignmentSelectionCmp = me.add({
			xtype: 'overview-editing-assignment-selection',
			onSelectionChanged: this.onAssignmentListSelectionChange.bind(this),
			selectedItems: selectedItems
		});

		me.bundle.getAssignments()
			.then(function(assignmentCollection) {
				var assignments = assignmentCollection.get('Assignments');

				me.assignmentSelectionCmp.setSelectionItems(assignments);
			});
	},


	getSelection: function() {
		var getAssignment,
			record = this.record;

		if (this.assignmentSelectionCmp) {
			getAssignment = Promise.resolve(this.assignmentSelectionCmp.getSelection()[0]);
		} else if (record) {
			getAssignment = this.bundle.getAssignments()
				.then(function(assignments) {
					return assignments.getItem(record.get('Target-NTIID'));
				});
		} else {
			getAssignment = Promise.resolve(null);
		}

		return getAssignment;
	},


	showAssignmentEditor: function() {
		if (this.assignmentEditorCmp) {
			this.assignmentEditorCmp.destroy();
			delete this.assignmentEditorCmp;
		}

		var me = this;

		me.loading = true;

		if (me.rendered) {
			me.el.mask('Loading...');
		}

		me.getSelection()
			.then(function(selection) {
				me.assignmentEditorCmp = me.add({
					xtype: 'overview-editing-assignment-editor',
					record: me.record,
					parentRecord: me.parentRecord,
					rootRecord: me.rootRecord,
					selectedItem: selection,
					doClose: me.doClose,
					onChangeAssignment: me.showAssignmentList.bind(me, [selection]),
					showError: me.showError,
					enableSave: me.enableSave,
					disableSave: me.disableSave,
					setSaveText: me.setSaveText
				});

				me.setSaveText(me.record ? 'Save' : 'Add to Lesson');
			})
			.then(function() {
				if (me.assignmentSelectionCmp) {
					me.assignmentSelectionCmp.destroy();
					delete me.assignmentSelectionCmp;
				}
			})
			.always(function() {
				delete me.loading;
				if (me.rendered) {
					me.el.unmask('Loading...');
				}
			});
	},


	onAssignmentListSelectionChange: function(selection) {
		var length = selection.length;

		this.setSaveText('Select');

		if (length === 0) {
			this.disableSave();
		} else {
			this.enableSave();
		}
	},


	onSaveFailure: function(reason) {
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	},


	onSave: function() {
		var me = this;

		if (!me.assignmentEditorCmp) {
			me.showAssignmentEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.assignmentEditorCmp.onSave()
			.fail(function(reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	}
});
