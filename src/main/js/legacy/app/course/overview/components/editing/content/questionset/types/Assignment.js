const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');
const { scoped } = require('@nti/lib-locale');

const AssignmentRef = require('legacy/model/AssignmentRef');
const AssessmentActions = require('legacy/app/course/assessment/Actions');
const EditingActions = require('legacy/app/course/overview/components/editing/Actions');
const NavigationActions = require('legacy/app/navigation/Actions');

require('../../Editor');
require('../AssignmentSelection');
require('legacy/app/course/assessment/components/CreateMenu');

const t = scoped(
	'nti-web-app.course.overview.components.editing.content.questionset.types.Assignment',
	{
		title: 'Assignment',
		backToList: 'Assignments',
		create: 'Create Assignment',
	}
);

const Type = 'application/vnd.nextthought.assessment.assignment';

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.questionset.types.Assignment',
	{
		extend:
			'NextThought.app.course.overview.components.editing.content.Editor',
		alias: 'widget.overview-editing-questionset-assignment',

		statics: {
			getHandledMimeTypes: function () {
				return [AssignmentRef.mimeType];
			},

			getTypes: function () {
				return [
					{
						get title() {
							return t('title');
						},
						category: 'question-set',
						advanced: false,
						iconCls: 'assignment',
						description: '',
						editor: this,
						isAvailable: async bundle => {
							const available = await bundle.getAvailableContentSummary();

							return available[Type];
						},
					},
				];
			},

			getEditorForRecord: function (record) {
				if (record instanceof AssignmentRef) {
					return this;
				}
			},
		},
		isAssignment: true,
		LIST_XTYPE: 'overview-editing-assignment-selection',
		EDITOR_XTYPE: 'overview-editing-assignment-editor',
		get backToList() {
			return t('backToList');
		},
		SWITCHED: 'switched',
		cls: 'content-editor questionset assignment',

		afterRender: function () {
			this.callParent(arguments);
			this.AssessmentActions = new AssessmentActions();
			this.EditingActions = new EditingActions();

			if (this.loading) {
				this.el.mask('Loading...');
			}
		},

		showEditor: function () {
			if (this.record) {
				this.showItemEditor();
			} else {
				this.showItemList();
			}
		},

		onBack: function () {
			if (this.itemEditorCmp) {
				this.showItemList([this.itemEditorCmp.selectedItem]);
			} else if (this.doBack) {
				this.doBack();
			}
		},

		maybeEnableBack: function (text) {
			if (!this.record && this.enableBack) {
				this.enableBack(text);
			}
		},

		getItemList: function () {
			return this.bundle.getAllAssignments();
		},

		addCreateButton() {
			if (this.isAssignment) {
				return this.add({
					xtype: 'box',
					autoEl: {
						tag: 'div',
						cls: 'create-assignment-overview-editing',
						html: t('create'),
					},
					listeners: {
						click: {
							element: 'el',
							fn: this.createAssignment.bind(this),
						},
					},
				});
			}
		},

		showItemList: function (selectedItems) {
			var me = this;

			if (me.itemSelectionCmp) {
				me.itemSelectionCmp.destroy();
				delete me.itemSelectionCmp;
			}

			if (me.itemEditorCmp) {
				me.itemEditorCmp.destroy();
				delete me.itemEditorCmp;
			}

			me.removeAll(true);
			me.maybeEnableBack(me.backText);

			this.createButton = this.addCreateButton();

			me.itemSelectionCmp = me.add({
				xtype: this.LIST_XTYPE,
				onSelectionChanged: this.onItemListSelectionChange.bind(this),
				selectedItems: selectedItems,
			});

			me.getItemList().then(function (items) {
				me.itemSelectionCmp.setSelectionItems(items);
			});
		},

		createAssignment() {
			this.assignmentTypeMenu =
				this.assignmentTypeMenu ||
				Ext.widget('create-assignment-menu', {
					ownerCmp: this,
					onDiscussionAssignmentCreate: item => {
						this.doCreation(true);
					},
					onPlainAssignmentCreate: item => {
						this.doCreation();
					},
				});

			this.assignmentTypeMenu.showBy(this.createButton, 'tr-br');
		},

		doCreation(isDiscussion) {
			if (this.AssessmentActions) {
				if (this.el) {
					this.el.mask('Loading...');
				}

				const create = isDiscussion
					? this.AssessmentActions.createDiscussionAssignmentIn(
							this.bundle
					  )
					: this.AssessmentActions.createAssignmentIn(this.bundle);

				create.then(assignment => {
					const { rootRecord, parentRecord } = this;
					const values = {
						MimeType: AssignmentRef.mimeType,
						label: assignment.get('title'),
						title: assignment.get('title'),
						'Target-NTIID': assignment.get('NTIID'),
					};

					// Make the ref from the assignment to the group
					this.EditingActions.saveValues(
						values,
						null,
						null,
						{
							parent: parentRecord,
							position: parentRecord.getItemsCount(),
						},
						rootRecord
					)
						.then(() => {
							return this.bundle.getAssignments();
						})
						.then(assignmentCollection => {
							if (assignmentCollection) {
								assignmentCollection.updateAssignments(true);
								// assignmentCollection.appendAssignment(assignment);
								// const map = assignmentCollection.get('AssignmentToOutlineNodes');
								// let list = map[assignment.getId()] = (map[assignment.getId()] || []);
								// list.push(rootRecord.getId());
							}
						})
						.then(() => {
							//Navigate to the created assignment
							const route = `/course/${encodeForURI(
								this.bundle.getId()
							)}/assignments/${encodeForURI(
								assignment.getId()
							)}/edit/`;

							NavigationActions.pushRootRoute(null, route, {
								assignment,
							});

							if (this.el) {
								this.el.unmask();
							}

							this.doClose(); // Close the editor prompt
						});
				});
			}
		},

		getSelectionFromRecord: function (record) {
			return this.bundle.getAssignments().then(function (assignments) {
				return assignments.findItem(record.get('Target-NTIID'));
			});
		},

		getSelection: function () {
			var getAssignment,
				record = this.record;

			if (this.itemSelectionCmp) {
				getAssignment = Promise.resolve(
					this.itemSelectionCmp.getSelection()[0]
				);
			} else if (record) {
				getAssignment = this.getSelectionFromRecord(record);
			} else {
				getAssignment = Promise.resolve(null);
			}

			return getAssignment;
		},

		showItemEditor: function () {
			if (this.itemEditorCmp) {
				this.itemEditorCmp.destroy();
				delete this.itemEditorCmp;
			}

			if (this.createButton) {
				this.createButton.destroy();
				delete this.createButton;
			}

			var me = this;

			me.loading = true;

			if (me.rendered) {
				me.el.mask('Loading...');
			}

			me.getSelection()
				.then(function (selection) {
					me.itemEditorCmp = me.add({
						xtype: me.EDITOR_XTYPE,
						record: me.record,
						parentRecord: me.parentRecord,
						rootRecord: me.rootRecord,
						selectedItem: selection,
						doClose: me.doClose,
						onChangeItem: me.showItemList.bind(me, [selection]),
						showError: me.showError,
						enableSave: me.enableSave,
						disableSave: me.disableSave,
						setSaveText: me.setSaveText,
					});

					me.maybeEnableBack(me.backToList);
					me.setSaveText(me.record ? 'Save' : 'Add to Lesson');
				})
				.then(function () {
					if (me.itemSelectionCmp) {
						me.itemSelectionCmp.destroy();
						delete me.itemSelectionCmp;
					}
				})
				.always(function () {
					delete me.loading;
					if (me.rendered) {
						me.el.unmask('Loading...');
					}
				});
		},

		onItemListSelectionChange: function (selection) {
			var length = selection.length;

			this.setSaveText('Select');

			if (length === 0) {
				this.disableSave();
			} else {
				this.enableSave();
			}
		},

		onSaveFailure: function (reason) {
			if (reason === this.SWITCHED) {
				return;
			}

			this.callParent(arguments);
		},

		onSave: function () {
			var me = this;

			if (!me.itemEditorCmp) {
				me.showItemEditor();
				return Promise.reject(me.SWITCHED);
			}

			me.disableSubmission();
			return me.itemEditorCmp.onSave().catch(function (reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
		},
	}
);
