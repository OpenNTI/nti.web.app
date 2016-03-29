var Ext = require('extjs');
var ComponentsConfirmation = require('./Confirmation');
var ComponentsEnroll = require('./Enroll');
var ComponentsAdmission = require('./Admission');
var ComponentsPaymentConfirmation = require('./PaymentConfirmation');
var ComponentsGift = require('./Gift');
var ComponentsRedeem = require('./Redeem');
var ComponentsGiftConfirmation = require('./GiftConfirmation');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.Process', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-process',
	layout: 'card',
	cls: 'enrollment-credit',

	getTargetEl: function () {
		return this.body;
	},

	childEls: ['body'],
	btnTpl: new Ext.XTemplate(Ext.DomHelper.markup({cls: 'number {enabled} {active}', 'data-number': '{index}', html: '{text}'})),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'enabled', html: 'Course Details'}
			// {cls: 'number enabled active admission', 'data-number': '1', html: 'Admissions'},
			// {cls: 'number enrollment', 'data-number': '2', html: 'Enrollment'},
			// {cls: 'number purchase', 'data-number': '3', html: 'Purchase'},
			// {cls: 'number confirmation', 'data-number': '4', html: 'Confirmation'}
		]},
		{ id: '{id}-body', cls: 'body-container enrollment-container', cn: ['{%this.renderContainer(out,values)%}'] }
	]),

	renderSelectors: {
		headerEl: '.header'
	},

	tabsToAdd: [],
	numberOfSteps: 0,

	initComponent: function () {
		this.callParent(arguments);
		this.tabsToAdd = [];
		this.enableBubble([
			'update-buttons',
			'create-enroll-purchase',
			'create-gift-purchase',
			'submit-gift-purchase',
			'submit-enroll-purchase',
			'enrollment-enrolled-complete',
			'redeem-gift'
		]);

		(this.steps || []).forEach(this.addStep.bind(this));

		this.on('beforedeactivate', 'beforeDeactivate', this);
	},

	afterRender: function () {
		this.callParent(arguments);

		this.addTabs(this.tabsToAdd);

		this.activateStep(0);
	},

	beforeDeactivate: function () {
		if (this.pricingInfo) {
			this.pricingInfo.removePricingInfo();
		}

		this.clearStorage();
	},

	clearStorage: function (all) {
		this.items.each(function (item) {
			if (item.clearStorage) {
				item.clearStorage();
			}
		});
	},

	showPricingInfo: function (course, enrollmentOption, hidePrice) {
		if (!this.rendered) { return; }

		var container = this.el.down('.enrollment-container');

		if (this.pricingInfo) {
			this.pricingInfo.destroy();
		}

		this.pricingInfo = Ext.widget('enrollment-pricing', {
			course: course,
			enrollmentOption: enrollmentOption,
			hidePrice: hidePrice,
			renderTo: container,
			ownerCt: this,
			scrollTarget: container,
			lockProcess: this.lockProcess.bind(this),
			unlockProcess: this.unlockProcess.bind(this)
		});

		this.on('destroy', 'destroy', this.pricingInfo);
	},

	hidePricingInfo: function (course, enrollmentOption) {
		if (this.pricingInfo) {
			this.pricingInfo.hide();
		}
	},

	getCoupon: function () {
		return this.pricingInfo && this.pricingInfo.getCoupon();
	},

	lockProcess: function () {
		var item = this.getLayout().getActiveItem();

		if (item.lock && !item.locked) {
			item.locked = true;
			item.lock();
		}
	},

	unlockProcess: function () {
		var item = this.getLayout().getActiveItem();

		if (item && item.unlock) {
			delete item.locked;
			item.unlock();
		}
	},

	getButtonCfg: function () {
		var active = this.getLayout().getActiveItem(),
			btnCfg = active && active.getButtonCfg && active.getButtonCfg();

		return btnCfg;
	},

	buttonClick: function (action) {
		var active = this.getLayout().getActiveItem();

		active.buttonClick(action);
	},

	stopClose: function () {
		var active = this.getLayout().getActiveItem(),
			stop;

		if (active && active.stopClose) {
			stop = active.stopClose();
		} else {
			stop = Promise.resolve();
		}


		if (this.pricingInfo) {
			stop.then(this.pricingInfo.removePricingInfo.bind(this.pricingInfo));
		}

		return stop;
	},

	addMask: function (msg, cls) {
		if (!this.el) { return; }

		var isMasked = this.el.isMasked(),
			maskMsg = this.el.down('.x-mask-msg');

		if (isMasked && msg && maskMsg) {
			maskMsg.update(msg);
		} else if (!isMasked) {
			this.el.mask(msg || 'Loading...', cls);
		}
	},

	removeMask: function () {
		if (!this.el) { return; }
		var mask = this.el.down('.x-mask'),
			maskMsg = this.el.down('.x-mask-msg');

		if (mask) { mask.addCls('removing'); }

		if (maskMsg) { maskMsg.addCls('removing'); }

		wait(1000).then(this.el.unmask.bind(this.el));
	},

	hasMask: function () {
		return this.el.isMasked();
	},

	addTabs: function (cfgs) {
		if (!this.rendered) {
			this.tabsToAdd.push(cfgs);
			return;
		}

		var me = this;

		cfgs = Ext.isArray(cfgs) ? cfgs : [cfgs];

		cfgs.forEach(function (cfg) {
			me.btnTpl.append(me.headerEl, cfg);
		});

		this.tabsToAdd = [];
	},

	addStep: function (step, i) {
		var cmp, me = this,
			tabCfg = {
				text: step.name,
				completed: step.completed ? 'enabled' : '',
				active: step.isActive ? 'active' : '',
				index: i + 1
			};

		this.addTabs(tabCfg);

		step.course = this.course;
		step.addMask = this.addMask.bind(this);
		step.removeMask = this.removeMask.bind(this);
		step.hasMask = this.hasMask.bind(this);
		step.hidePricingInfo = this.hidePricingInfo.bind(this);
		step.getCoupon = this.getCoupon.bind(this);
		step.clearProcessStorage = this.clearStorage.bind(this);
		step.index = i;

		if (step.xtype) {
			cmp = this.add(step);

			this.mon(cmp, {
				'step-completed': this.stepCompleted.bind(this, cmp),
				'step-error': this.stepError.bind(this, cmp)
			});
		}

		this.numberOfSteps += 1;
	},

	/**
	 * Set the bread crumb to show the active item note that data-index is 1 based
	 * @param {Number} index the item to activate
	 */
	setActiveTab: function (index) {
		var i, btn;

		index = index + 1;

		for (i = 1; i <= this.numberOfSteps; i += 1) {
			btn = this.headerEl.down('[data-number="' + i + '"]');

			if (btn) {
				if (i < index) {
					btn.addCls('enabled');
					btn.removeCls('active');
				} else if (i === index) {
					btn.addCls('active');
				} else {
					btn.removeCls(['enabled', 'active']);
				}
			}
		}
	},

	/**
	 * Starting at index step through the steps and activate the first one that is not completed
	 * or stop on the last one
	 * @param  {Number} index the step to start looking from
	 * @param {Boolean} recursive if we are called again to activate the next step
	 */
	activateStep: function (index, recursive) {
		var me = this,
			item = me.down('[index="' + index + '"]') || me.down('[name="' + index + '"]'),
			total = me.numberOfSteps,
			maskCmp = me.el;
		step = me.steps[index];

		if (index < 0) {
			step = me.steps[0];
		} else if (index > total) {
			step = me.steps[total];
		} else {
			step = me.steps[index];
		}

		if (!step) {
			console.error('No step for the index:', index);
			return;
		}

		if (!recursive) {
			maskCmp.mask('Loading...');
		}

		function setItem () {
			if (item.beforeShow) {
				item.beforeShow();
			}

			if (item.hasPricingCard) {
				me.showPricingInfo(item.course, item.enrollmentOption, item.hidePrice);
			} else {
				me.hidePricingInfo();
			}

			if (me.pricingInfo) {
				if (item.lockCoupon) {
					me.pricingInfo.lockCoupon();
				} else {
					me.pricingInfo.unlockCoupon();
				}
			}

			me.getLayout().setActiveItem(item);
			me.setActiveTab(index);
			me.fireEvent('update-buttons');
			maskCmp.unmask();
		}

		step.isComplete()
			.then(function () {//if we are completed
				//if we aren't the last one check the next one
				if (index < total - 1) {
					me.activateStep(index + 1, true);
				} else if (item) {
					//if we are the last item make us active
					setItem();
				} else {
					console.error('Last step must have a component to go with it');
				}
			})
			.fail(function () {//if we aren't compeleted
				//if we have an cmp for this step
				if (item) {
					setItem();
				} else {
					//if we don't have cmp for a step it should never not be completed;
					console.error('If a step has no item it can not be uncompleted');
				}
			});
	},

	stepCompleted: function (cmp) {
		var index = cmp.index;

		this.activateStep(index + 1);
	},

	stepError: function (cmp) {
		var index = cmp.index + 1,
			btn = this.headerEl.down('[data-number="' + index + '"]');

		if (cmp.goBackOnError) {
			this.activateStep(cmp.index - 1);
			return;
		}

		if (btn) { btn.addCls('failed'); }
	}
});
