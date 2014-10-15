Ext.define('NextThought.view.courseware.enrollment.Process', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-process',

	layout: 'card',
	cls: 'enrollment-credit',

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],

	btnTpl: new Ext.XTemplate(Ext.DomHelper.markup({cls: 'number {enabled} {active}', 'data-number': '{index}', html: '{text}'})),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'enabled', html: 'Course Details'},
			{cls: 'number enabled active admission', 'data-number': '1', html: 'Admissions'},
			{cls: 'number enrollment', 'data-number': '2', html: 'Enrollment'},
			{cls: 'number purchase', 'data-number': '3', html: 'Purchase'},
			{cls: 'number confirmation', 'data-number': '4', html: 'Confirmation'}
		]},
		{ id: '{id}-body', cls: 'body-container credit-container', cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	renderSelectors: {
		headerEl: '.header'
	},

	tabsToAdd: [],
	numberOfSteps: 0,

	initComponent: function() {
		this.callParent(arguments);
		this.enableBubble('update-buttons');

		(this.steps || []).forEach(this.addStep.bind(this));
	},


	afterRender: function() {
		this.callParent(arguments);

		this.addTabs(this.tabsToAdd);

		this.activateStep(this.activeStep);
	},


	addTabs: function(cfgs) {
		if (!this.rendered) {
			this.tabsToAdd.push(cfg);
		}

		var me = this;

		cfgs = Ext.isArray(cfgs) ? cfgs : [cfgs];

		cfgs.forEach(function(cfg) {
			btnTpl.append(this.headerEl, cfgs);
		});
	},


	addStep: function(step, i) {
		var cmp,
			tabCfg = {
				text: step.name,
				completed: step.completed ? 'enabled' : '',
				active: step.isActive ? 'active' : '',
				index: i + 1
			};

		this.addTabs(tabCfg);

		step.index = i;

		if (step.isActive) {
			if (this.activeStep) { console.error('Given more than one active step...'); }
			this.activeStep = i;
		}

		cmp = this.add(step);
		this.numberOfSteps += 1;

		this.mon(cmp, {
			completed: this.stepCompleted.bind(this, cmp),
			error: this.stepError.bind(this, cmp)
		});
	},


	activateStep: function(index) {
		var item = this.down('[index="' + index + '"]') || this.down('[name="' + index + '"]'),
			i, btn;

		if (!item) {
			console.error('No step for the index:', index);
			return;
		}

		this.getLayout().setActiveItem(item);

		for (i = 1; i <= this.numberOfSteps; i += 1) {
			btn = this.headerEl.down('[data-index="' + i + '"]');

			if (btn) {
				if (i < item.index) {
					btn.addCls('enabled');
					btn.removeCls('active');
				} else if (i === item.index) {
					btn.addCls(['enabled', 'active']);
				} else {
					btn.removeCls(['enabled', 'active']);
				}
			}
		}

		this.fireEvent('update-buttons');
	}
});
