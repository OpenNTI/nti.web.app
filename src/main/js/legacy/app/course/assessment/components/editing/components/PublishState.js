const Ext = require('extjs');
const {Publish, Constants} = require('nti-web-commons');
require('legacy/common/form/fields/DateTimeField');
const {PUBLISH_STATES} = Constants;
const getPublishState = value => PUBLISH_STATES[value] || (value instanceof Date ? PUBLISH_STATES.SCHEDULE : null);

module.exports = exports = Ext.define('NextThought.app.course.assessment.components.editing.PublishState', {
	extend: 'Ext.container.Container',
	alias: 'widget.assignment-inline-publish-editor',

	cls: 'inline-publish-editor',

	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		this.onPublishCheckChanged = this.onPublishCheckChanged.bind(this);
		this.onScheduleCheckChanged = this.onScheduleCheckChanged.bind(this);
		this.onDraftCheckChanged = this.onDraftCheckChanged.bind(this);

		const group = 'publish-state-' + this.id;
		const now = new Date();

		this.add([
			{
				xtype: 'box',
				isPublish: true,
				autoEl: {
					cls: 'label publish',
					cn: [
						{cls: 'nti-radio', cn: [
							{
								tag: 'input',
								type: 'radio',
								cls: 'publish-now',
								name: group,
								'id': 'publish-state-radio-' + this.id
							},
							{tag: 'label', 'for': 'publish-state-radio-' + this.id, html: 'Publish'}
						]}
					]
				}
			},
			{
				xtype: 'container',
				layout: 'none',
				isPublishContainer: true,
				cls: 'publish-container container hidden',
				items: [
					{xtype: 'box', autoEl: {cls: 'publish-label', html: 'Assignment is visible to students'}}
				]
			},
			{
				xtype: 'box',
				isSchedule: true,
				autoEl: {
					cls: 'label schedule',
					cn: [
						{cls: 'nti-radio', cn: [
							{
								tag: 'input',
								type: 'radio',
								cls: 'schedule',
								name: group,
								'id': 'schedule-state-radio-' + this.id
							},
							{tag: 'label', 'for': 'schedule-state-radio-' + this.id, html: 'Schedule'}
						]}
					]
				}
			},
			{
				xtype: 'container',
				layout: 'none',
				isScheduleContainer: true,
				cls: 'schedule-container container hidden',
				items: [
					{xtype: 'box', autoEl: {cls: 'schedule-label', html: ''}},
					{
						xtype: 'date-time-field',
						isAvailableEditor: true,
						lowerBound: now,
						currentDate: null,
						onChange: () => {
							this.updateScheduleLabel();
							this.clearError();
						}
					}
				]
			},
			{
				xtype: 'box',
				isDraftLabel: true,
				autoEl: {
					cls: 'label draft',
					cn: [
						{cls: 'nti-radio', cn: [
							{
								tag: 'input',
								type: 'radio',
								cls: 'draft',
								name: group,
								'id': 'draft-state-radio-' + this.id
							},
							{tag: 'label', 'for': 'draft-state-radio-' + this.id, html: 'Draft'}
						]}
					]
				}
			},
			{
				xtype: 'container',
				layout: 'none',
				isDraftContainer: true,
				cls: 'draft-container container hidden',
				items: [
					{xtype: 'box', autoEl: {cls: 'draft-label', html: 'Currently not visible to any students'}}
				]
			},
		]);

	},


	afterRender () {
		this.callParent(arguments);

		const query = (selector) => this.el.dom.querySelector(selector);

		this.publishContainer = query('.publish-container');
		this.scheduleContainer = query('.schedule-container');
		this.draftContainer = query('.draft-container');

		this.publishLabel = query('.publish-label');
		this.scheduleLabel = query('.schedule-label');
		this.draftLabel = query('.draft-label');

		this.publishRadioLabel = query('.label.publish');
		this.scheduleRadioLabel = query('.label.schedule');
		this.draftRadioLabel = query('.label.draft');

		this.publishRadio = query('input.publish-now');
		this.scheduleRadio = query('input.schedule');
		this.draftRadio = query('input.draft');

		this.publishRadio.addEventListener('change', this.onPublishCheckChanged);
		this.scheduleRadio.addEventListener('change', this.onScheduleCheckChanged);
		this.draftRadio.addEventListener('change', this.onDraftCheckChanged);

		this.on('destroy', () => {
			if (this.publishRadio && this.publishRadio.removeEventListener) {
				this.publishRadio.removeEventListener('change', this.onPublishCheckChanged);
			}

			if (this.scheduleRadio && this.scheduleRadio.removeEventListener) {
				this.scheduleRadio.removeEventListener('change', this.onScheduleCheckChanged);
			}

			if (this.draftRadio && this.draftRadio.removeEventListener) {
				this.draftRadio.removeEventListener('change', this.onDraftCheckChanged);
			}
		});

		this.setAssignment(this.assignment);
	},


	getScheduleEditor () {
		return this.down('[isAvailableEditor]');
	},

	showContainer (show) {
		const containers = [
			this.publishContainer,
			this.scheduleContainer,
			this.draftContainer
		];


		for (let container of containers) {
			if (container === show) {
				container.classList.remove('hidden');
			} else {
				container.classList.add('hidden');
			}
		}
	},


	checkOption (check) {
		const options = [
			this.publishRadio,
			this.scheduleRadio,
			this.draftRadio
		];

		for (let option of options) {
			option.checked = check === option;
		}

		this.onPublishCheckChanged();
		this.onScheduleCheckChanged();
		this.onDraftCheckChanged();
	},

	hasPublishingLinks () {
		return this.assignment.hasLink('publish') || this.assignment.hasLink('unpublish');
	},


	setAssignment (assignment) {
		this.assignment = assignment;

		if (!this.rendered) { return; }

		// Determine weather or not to show the publish controls
		const isPublishable = !this.assignment.hasLink('Reset') && (assignment.hasLink('publish') && assignment.hasLink('unpublish') && assignment.hasLink('date-edit'));

		if(isPublishable) {
			this.show();
		} else {
			this.hide();
		}
		const available = assignment.get('availableBeginning');
		const value = Publish.evaluatePublishStateFor({
			isPublished: () => assignment && (!!assignment.get('PublicationState') && !available || available < Date.now()),
			getPublishDate: () => assignment && available
		});

		const state = getPublishState(value);

		// Determine the publish state
		if (state === PUBLISH_STATES.PUBLISH) {
			this.setPublishAssignment(assignment);
		} else if (state === PUBLISH_STATES.SCHEDULE) {
			this.setScheduleAssignment(assignment);
		} else if (state === PUBLISH_STATES.DRAFT) {
			this.setDraftAssignment(assignment);
		}

		if(this.assignment.hasLink('date-edit') && (!this.assignment.hasLink('publish') || !this.assignment.hasLink('unpublish'))) {
			this.disableRadio(this.draftRadio);
			this.disableRadioLabel(this.draftRadioLabel);
		}

		this.updateScheduleLabel();
	},


	setPublishAssignment (assignment) {
		const editor = this.getScheduleEditor();

		if (assignment.canUnpublish()) {
			this.enableRadioLabel(this.draftRadioLabel);
			this.enableRadio(this.draftRadio);
		} else {
			this.disableRadioLabel(this.draftRadioLabel);
			this.disableRadio(this.draftRadio);
		}

		this.enableRadioLabel(this.publishRadioLabel);
		this.enableRadioLabel(this.scheduleRadioLabel);

		editor.selectDate(null);
		this.checkOption(this.publishRadio);
	},



	setScheduleAssignment (assignment) {
		const editor = this.getScheduleEditor();
		editor.selectDate(assignment.get('availableBeginning'));
		this.checkOption(this.scheduleRadio);
	},


	setDraftAssignment (assignment) {
		if (assignment.canPublish) {
			this.enableRadioLabel(this.publishRadioLabel);
			this.enableRadioLabel(this.scheduleRadioLabel);
		} else {
			this.disableRadioLabel(this.publishRadioLabel);
			this.disableRadioLabel(this.scheduleRadioLabel);
		}

		this.enableRadioLabel(this.draftRadioLabel);
		this.checkOption(this.draftRadio);
	},


	updateScheduleLabel () {
		const label = this.scheduleLabel;
		const editor = this.getScheduleEditor();
		const date = editor.getSelectedDate();

		if (!label) { return; }

		if (!date) {
			label.innerText = 'When do you want students to have access to the assignment?';
		} else {
			label.innerText = 'Assignment will be available to students on ' + Ext.Date.format(date, 'F j \\a\\t g:i A\\.');
		}
	},


	onPublishCheckChanged () {
		const checked = this.publishRadio.checked;

		if (checked) {
			this.showContainer(this.publishContainer);
		} else {
			this.publishContainer.classList.add('hidden');
		}
	},


	onScheduleCheckChanged () {
		const checked = this.scheduleRadio.checked;

		if (checked) {
			this.showContainer(this.scheduleContainer);
		} else {
			this.scheduleContainer.classList.add('hidden');
		}
	},


	onDraftCheckChanged () {
		const checked = this.draftRadio.checked;

		if (checked) {
			this.showContainer(this.draftContainer);
		} else {
			this.draftContainer.classList.add('hidden');
		}
	},


	validate () {
		const scheduleChecked = this.scheduleRadio.checked;
		const editor = this.getScheduleEditor();
		const date = editor.getSelectedDate();
		let valid = true;

		if (scheduleChecked && !date) {
			editor.showDateError('Please enter a date.');
			valid = false;
		}

		return valid;
	},


	getValues () {
		const publishChecked = this.publishRadio.checked;
		const scheduleChecked = this.scheduleRadio.checked;

		const editor = this.getScheduleEditor();
		const date = editor.getSelectedDate();

		let values = {
			published: false,
			available: null
		};

		if (publishChecked) {
			values.published = true;
		} else if (scheduleChecked) {
			values.published = true;
			values.available = date;
		}

		return values;
	},


	enableRadioLabel (label) {
		label.classList.remove('disabled');
		label.removeAttribute('data-qtip');
	},


	disableRadioLabel (label, reason) {
		label.classList.add('disabled');

		if (reason) {
			label.addAttribute('data-qtip', reason);
		}
	},


	disableRadio (radio) {
		radio.disabled = true;
		radio.classList.add('disabled');
	},


	enableRadio (radio) {
		radio.disabled = false;
		radio.classList.remove('disabled');
	}
});
