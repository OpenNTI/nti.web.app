const Ext = require('extjs');
const {wait} = require('nti-commons');
const {Presentation} = require('nti-web-commons');

const User = require('legacy/model/User');
const {getString, getFormattedString} = require('legacy/util/Localization');
const AnalyticsUtil = require('legacy/util/Analytics');
const {guidGenerator, isFeature} = require('legacy/util/Globals');
const NavigationActions = require('legacy/app/navigation/Actions');
const AccountActions = require('legacy/app/account/Actions');
const CoursesStateStore = require('legacy/app/library/courses/StateStore');

const EnrollmentStateStore = require('./StateStore');
const EnrollmentActions = require('./Actions');

require('../info/components/Panel');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.Details', {
	extend: 'Ext.Component',
	alias: 'widget.course-enrollment-details',
	cls: 'course-details',

	enrollmentCardTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'enroll-card', cn: [
			{cls: 'enroll-option base {base.cls}', 'data-name': '{base.name}', cn: [
				{cls: 'enrolled', html: '{{{NextThought.view.courseware.enrollment.Details.Enrolled}}}'},
				{cls: 'title', html: '{base.title}'},
				{cls: 'price', html: '{base.priceString}'},
				{cls: 'info', html: '{base.information}'},
				{cls: 'seats', html: '{base.seats}'},
				{cls: 'warning', html: '{base.warning}'},
				{cls: 'refund', html: '{base.refund}'},
				{tag: 'tpl', 'for': 'base.links', cn: [
					{tag: 'a', cls: 'link', href: '{href}', target: '_blank', html: '{text}'}
				]}
			]},
			{tag: 'tpl', 'for': 'addOns', cn: [
				{cls: 'enroll-option addon {cls}', 'data-name': '{name}', cn: [
					{cls: 'title', cn: [
						'{title}',
						{tag: 'span', html: '({difference})'}
					]},
					{cls: 'info', html: '{information}'},
					{cls: 'seats', html: '{seats}'},
					{cls: 'warning', html: '{warning}'},
					{tag: 'tpl', 'for': 'links', cn: [
						{tag: 'a', cls: 'link', href: '{href}', target: '_blank', html: '{text}'}
					]}
				]}
			]},
			{cls: 'button {buttonCls}', 'data-name': '{buttonName}', html: '{buttonText}'},
			{tag: 'tpl', 'if': 'drop', cn: [
				{cls: 'drop', cn: [
					{cls: 'title', html: '{{{NextThought.view.courseware.enrollment.Details.HowtoDrop}}}'},
					{cls: 'info', html: '{drop}'}
				]}
			]}
		]},
		{cls: 'gift-card {gifts.giftClass}', cn: [
			{cls: 'give {gifts.giveClass}', cn: [
				{cls: 'title', html: '{{{NextThought.view.courseware.enrollment.Details.CourseGift}}}'},
				{cls: 'sub', html: '{gifts.giveTitle}'}
			]},
			{cls: 'redeem {gifts.redeemClass}', cn: [
				{cls: 'title', html: '{{{NextThought.view.courseware.enrollment.Details.RedeemGift}}}'}
			]}
		]}
	])),

	enrollmentConfirmationTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'complete-enrollment-layer', cn: [
			{cls: 'congrats-container', cn: [
				{cls: 'congrats', cn: [
					{cls: 'title', html: '{{{NextThought.view.courseware.enrollment.Details.Congrats}}}, {firstName}!'},
					{cls: 'sub', html: '{{{NextThought.view.courseware.enrollment.Details.CongratsSubtitle}}}'},
					{cls: 'actions', cn: [
						{tag: 'tpl', 'if': 'isFirstLogin', cn: [
							{tag: 'a', cls: 'account-created completed', html: '{{{NextThought.view.courseware.enrollment.Details.CongratsAccountCreated}}}'},
							{tag: 'a', cls: 'enroll completed', html: '{{{NextThought.view.courseware.enrollment.Details.CongratsCourseCreated}}}'},
							{tag: 'a', cls: 'createProfile', html: '{{{NextThought.view.courseware.enrollment.Details.CreateProfile}}}'},
							{tag: 'a', cls: 'suggestContacts', html: '{{{NextThought.view.courseware.enrollment.Details.ConnectWithPeers}}}'}
						]},
						{tag: 'tpl', 'if': '!isFirstLogin', cn: [
							{tag: 'a', cls: 'enroll completed', html: '{{{NextThought.view.courseware.enrollment.Details.CongratsCourseCreated}}}'},
							{tag: 'a', cls: 'suggestContacts', html: '{{{NextThought.view.courseware.enrollment.Details.ConnectWithPeers}}}'}
						]}
					]}
				]},
				{cls: 'add-selection', cn: [
					{tag: 'span', html: '{{{NextThought.view.courseware.enrollment.Details.NeedToAddCourses}}}'},
					{tag: 'span', cn: [
						{tag: 'a', cls: 'button add-course', html: '{{{NextThought.view.courseware.enrollment.Details.AddSelectionButton}}}'}
					]}
				]}
			]}
		]}
	])),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'left'},
		{cls: 'right enrollment', cn: [
			{cls: 'enrollment-container'}
		]}
	]),

	renderSelectors: {
		detailsEl: '.left',
		cardsEl: '.enrollment',
		cardsContainerEl: '.enrollment-container'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.enableBubble(['enrolled-action', 'show-msg', 'go-back']);

		AnalyticsUtil.startEvent(this.course.getId(), {
			type: 'CourseCatalogView',
			RootContextID: this.course.getId()
		});

		this.on('beforedeactivate', 'onBeforeDeactivate');
		this.CourseEnrollmentStore = EnrollmentStateStore.getInstance();
		this.CourseEnrollmentActions = EnrollmentActions.create();
		this.CourseStore = CoursesStateStore.getInstance();
		this.AccountActions = AccountActions.create();

		window.EnrollInOption = this.enrollInOption.bind(this);
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			number: this.course.get('ProviderUniqueID'),
			title: this.course.get('Title')
		});
	},

	stopClose: function () {
		return this.changingEnrollment ? Promise.reject() : Promise.resolve();
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this;

		me.details = Ext.widget('course-info-panel', {
			videoWidth: 642,
			videoHeight: 360,
			viewOnly: true,
			renderTo: this.detailsEl
		});

		me.details.setContent(me.course);

		me.on('destroy', 'destroy', me.details);

		me.updateEnrollmentCard();

		me.mon(me.cardsEl, 'click', 'handleEnrollmentClick', me);

		me.course.getBackgroundImage()
			.then(function (img) {
				const resolved = img ? img : Presentation.Asset.getDefaultURLForType('background');

				me.el.setStyle({
					backgroundImage: 'url(' + resolved + ')'
				});
			});
	},

	/**
	 * Restore to an enrollment option
	 * @param  {String} type   name of the enrollment option
	 * @param  {Array} config  array of configs for the option to parse
	 * @returns {void}
	 */
	restoreEnrollmentOption: function (type, config) {
		if (!this.rendered) {
			this.on('afterrender', this.restoreEnrollmentOption.bind(this, type, config));
			return;
		}

		if (!this.enrollmentOptions || Ext.Object.isEmpty(this.enrollmentOptions)) {
			this.__stateToRestore = this.restoreEnrollmentOption.bind(this, type, config);
			return;
		}

		var option, checkbox;

		if (type === 'redeem') {
			option = this.enrollmentOptions.GiftOption;

			if (option && option.Redeemable) {
				option.doEnrollment(this, 'redeem', config);
				delete this.__stateToRestore;
			}
		} else if (type === 'forcredit') {
			option = this.enrollmentOptions.FiveminuteEnrollment;

			if (option) {
				checkbox = this.el.down('.addon.checkbox[data-name=FiveminuteEnrollment');

				if (checkbox) {
					this.updateSelectedEnrollment(checkbox);
					delete this.__stateToRestore;
				}

			}
		} else if (type === 'purchase') {
			option = this.enrollmentOptions.StoreEnrollment;

			if (option) {
				checkbox = this.el.down('.addon.checkbox[data-name=StoreEnrollment]');

				if (checkbox) {
					this.updateSelectedEnrollment(checkbox);
					delete this.__stateToRestore;
				}
			}
		}
	},

	onDestroy: function () {
		this.callParent(arguments);

		AnalyticsUtil.stopEvent(this.course.getId(), 'CourseCatalogView');
	},

	onBeforeDeactivate: function () {
		return !this.changingEnrollment;
	},

	addMask: function () {
		try {
			var maskEl = this.el && this.el.up('.body-container');
			if (maskEl) {
				maskEl.mask('Loading...');
			}
		} catch (e) {
			console.warn('Error masking. %o', e);
		}
	},

	removeMask: function () {
		var maskEl = this.el.up('.body-container'),
			mask = maskEl && maskEl.down('.x-mask'),
			maskMsg = maskEl && maskEl.down('.x-mask-msg');

		if (mask) {
			mask.addCls('removing');
		}

		if (maskMsg) {
			maskMsg.addCls('removing');
		}

		if (maskEl) {
			wait(1000).then(maskEl.unmask.bind(maskEl));
		}
	},

	__getOptionText: function (details, option) {
		return option.Wording;
	},

	__addBaseOption: function (details, option) {
		if (this.state.base) {
			console.error('More than one base', details, option);
			return;
		}

		this.state.base = this.__getOptionText(details, option);
	},

	__addAddOnOption: function (details, option) {
		var data = this.__getOptionText(details, option);

		if (option.Enrolled) {
			this.state.base = data;

			delete this.state.addOns[data.name];
		} else {
			this.state.addOns[data.name] = data;
		}

		//since add ons do not block showing the card
		//we may need to update what is there
		this.__maybeUpdateCard(this.state);
	},

	/**
	 * Given a base enrollment option, fetch all the data
	 * @param  {Object} option option to load
	 * @return {Promise}	   fulfills when its loaded
	 */
	__addEnrollmentBase: function (option) {
		var me = this, loading;

		if (option) {
			loading = option.loaded
				.then(function (data) {
					me.enrollmentOptions[data.Name] = data;

					me.__addBaseOption(option, data);
				});
		} else {
			loading = Promise.reject();
		}

		return loading;
	},

	/**
	 * Given an enrollment option, fetch all the data for the option given
	 * @param  {Object} option the enrollment details
	 * @return {Promise}		 resolved if the option is available, reject if not;
	 */
	__addEnrollmentOption: function (option) {
		var me = this, loading;

		if (option) {
			loading = option.loaded.then(function (data) {
				me.enrollmentOptions[data.Name] = data;

				me.__addAddOnOption(option, data);
			});
		} else {
			loading = Promise.reject();
		}

		return loading;
	},

	/**
	 * Takes the enrollment details for the course and build the
	 * data necessary to make the enrollment card
	 * @param  {Object} details enrollment details
	 * @return {Promise}		 fulfills when its done, a rejection is not expected
	 */
	__onDetailsLoaded: function (details) {
		var loading,
			base, addOns = [],
			priority = this.CourseEnrollmentStore.getBasePriority(),
			me = this;

		function addBase (option, details2) {
			details2.name = details2.name || option.name;

			//if we are enrolled in an option it is the base
			//and any other base is would be an add on
			if (details2.IsEnrolled) {
				addOns.push(base);
				base = details2;
			//if we don't already have a base option, it is by default
			} else if (!base) {
				base = details2;
			//if we are enrolled in current base, we are an addon
			} else if (base.IsEnrolled) {
				addOns.push(details2);
			//if the current base is a higher priority, we are an addon
			} else if (priority[base.name] > priority[details2.name]) {
				addOns.push(details2);
			//otherwise the current base is an add on and we are the base
			} else {
				addOns.push(base);
				base = details2;
			}
		}

		//iterate through all the options and figure out which one
		//should be the base and what the add ons should be
		this.CourseEnrollmentStore.forEachOption(function (option) {
			var optionDetails = details.Options[option.name];

			//if we're not available stop here
			if (!optionDetails.IsAvailable) { return; }

			if (option.base || optionDetails.IsEnrolled) {
				addBase(option, optionDetails);
			} else {
				addOns.push(option);
			}
		});

		if (!base) {
			return Promise.reject('No base enrollment found');
		}

		loading = me.__addEnrollmentBase(base);

		addOns = addOns.map(function (addOn) {
			if (!addOn) { return; }

			me.state.addOns[addOn.name] = {
				name: addOn.name,
				loading: true
			};

			return me.__addEnrollmentOption(addOn);
		});

		Promise.all(addOns)
			.then(function () {
				if (me.__stateToRestore) {
					me.__stateToRestore.call();
				}
			});

		return loading;
	},

	__maybeUpdateCard: function (state) {
		var me = this,
			card = me.cardsContainerEl,
			addOns = Object.keys(state.addOns || {});


		//if the card is still loading there's no need to update
		if (card.hasCls('loading')) { return; }

		addOns.forEach(function (key) {
			var el = card.down('.loading[data-name="' + key + '"]'),
				obj = state.addOns[key] || {},
				title = obj.title,
				titleEl = el && el.down('.title'),
				price = obj.price,
				info = obj.information,
				infoEl = el && el.down('.info'),
				seats = obj.seats,
				seatsEl = el && el.down('.seats'),
				warning = obj.warning,
				warningEl = el && el.down('.warning');

			if (!el) { return; }

			el.removeCls('loading');

			if (obj.cls) {
				el.addCls(obj.cls);
			}

			price = me.getPriceString(state.base.price, price);

			if (title && titleEl) {
				if (price) {
					titleEl.update(title + '<span>(' + price + ')</span>');
				} else {
					titleEl.update(title);
				}
			}

			if (info && infoEl) {
				infoEl.update(info);
			}

			if (seats && seatsEl) {
				seatsEl.update(seats);
			}

			if (warning && warningEl) {
				warningEl.update(warning);
			}
		});
	},

	__buildCard: function (state) {
		var data = {
				base: state.base,
				addOns: [],
				buttonName: state.base.name,
				buttonCls: this.getButtonCls(state.base),
				buttonText: state.base.buttonText || '',
				drop: state.base.drop,
				gifts: state.gifts
			},
			me = this,
			addOns = Ext.Object.getValues(state.addOns);

		addOns.forEach(function (addOn) {
			addOn.difference = me.getPriceString(state.base.price, addOn.price);

			if (addOn.loading) {
				addOn.cls = addOn.cls ? addOn.cls + ' loading' : 'loading';
			}
			data.addOns.push(addOn);
		});

		data.base.priceString = this.getPriceString(data.base.price);

		me.enrollmentCardTpl.append(me.cardsContainerEl, data);
		me.cardsContainerEl.removeCls('loading');

	},

	__buildCongratsCard: function () {
		var isFirstTimer = $AppConfig.userObject.hasLink('first_time_logon'),
			data = {
				firstName: Ext.String.capitalize($AppConfig.userObject.get('FirstName') || $AppConfig.userObject.getName()),
				isFirstLogin: isFirstTimer
			},
			me = this;

		me.el.setScrollTop(0);
		me.el.addCls('has-overlay');
		me.congratsLayerEl = Ext.get(me.enrollmentConfirmationTpl.append(me.el, data));
		me.mon(me.congratsLayerEl, 'click', 'congratsLayerClicked', me);

		me.requiredActions = isFirstTimer ? ['createProfile', 'suggestContacts'] : ['suggestContacts'];
		me.updateWindowButtons(me.requiredActions.first());
	},

	__showError: function () {

	},

	/**
	 * Updates the enrollment card to match the options available
	 * to the user for this course
	 *
	 * @param {Boolean} updateFromStore update the course from the available courses store
	 * @returns {void}
	 */
	updateEnrollmentCard: function (updateFromStore) {
		if (this.isDestroyed) {
			return;
		}

		var me = this, c;

		c = this.CourseStore.findCourseForNtiid(me.course.getId());
		if (c) {
			me.course = c;
		}


		me.cardsContainerEl.addCls('loading');
		me.cardsContainerEl.dom.innerHTML = '';

		//empty out the previous options
		me.enrollmentOptions = {};

		//start with an empty state
		me.state = {
			base: null,
			addOns: {},
			gifts: null
		};

		Promise.all([
			me.CourseEnrollmentStore.getEnrollmentDetails(me.course),
			me.CourseEnrollmentStore.getGiftDetails(me.course)
		])
			.then(function (results) {
				var enrollment = results[0],
					gift = results[1];

				me.enrollmentOptions.GiftOption = gift;
				me.state.gifts = gift.Wording;

				return me.__onDetailsLoaded(enrollment);
			})
			.then(function () {
				return me.state;
			})
			.catch(function (reason) {
				console.error('Failed to load enrollment details', reason);
				me.__showError();
				return Promise.reject();//keep the failure going
			})
			.then(me.__buildCard.bind(me))
			.then(function () {
				if (me.__stateToRestore) {
					me.__stateToRestore.call();
				}
			});
	},

	/**
	 * takes the prices and returns the string we should show to the user
	 *
	 * @param  {Number} base  the price of the base option
	 * @param  {Number} addOn the price of the addon
	 * @return {String}		  what we should show the user
	 */
	getPriceString: function (base, addOn) {
		var price;

		if (!addOn && base === null) {
			return '';
		}

		base = base === 'Free' ? 0 : base;
		addOn = addOn === 'Free' ? 0 : addOn;

		//if no add on was passed
		//get the string for the base
		if (addOn === undefined) {
			if (!base) {
				price = getString('NextThought.view.courseware.enrollment.Details.PriceFree');
			} else {
				price = getString('NextThought.view.courseware.enrollment.Details.DollarSign') + base;
			}
		//if is no base or its free (0)
		} else if (!base) {
			if (!addOn) {
				price = getString('NextThought.view.courseware.enrollment.Details.PriceFree');
			} else {
				price = getString('NextThought.view.courseware.enrollment.Details.DollarSign') + addOn;
			}
		} else {
			if (!addOn) {
				price = getString('NextThought.view.courseware.enrollment.Details.PriceFree');
			} else {
				price = getString('NextThought.view.courseware.enrollment.Details.AddDollarSign') + Math.abs(addOn - base);
			}
		}

		return price;
	},

	getButtonCls: function (option) {
		var cls = 'free';

		if (option.cls === 'enrolled') {
			cls = 'drop';
		} else if (option.price) {
			cls = 'paid';
		} else {
			cls = 'free';
		}

		return cls;
	},

	showMessage: function (msg, isError, cursor) {
		var me = this,
			win = me.up('[showMsg]'),
			guid = guidGenerator();

		if (!win) {return;}//user closed window before we got here.

		win.showMsg(msg, isError, false, guid, cursor);

		Ext.destroy(me.__showMessageClickMonitor);
		me.__showMessageClickMonitor = me.mon(win, {
			destroyable: true,
			single: true,
			'message-clicked': function (msgId) {
				if (msgId === guid) {
					Ext.callback(me.msgClickHandler);
				}
			}
		});
	},

	clearMessage: function () {
		var win = this.up('[closeMsg]');

		if (win) {
			win.closeMsg();
			Ext.destroy(this.__showMessageClickMonitor);
		}
	},

	/**
	 * Handles a click on the enrollment card and calls the appropriate handler
	 * @param  {Event} e the click event
	 * @return {Boolean}   if the event was stopped
	 */
	handleEnrollmentClick: function (e) {
		var checkbox = e.getTarget('.addon.checkbox'),
			button = e.getTarget('.button'),
			gift = e.getTarget('.gift-card'),
			anchor = e.getTarget('a'), r;

		if (checkbox) {
			r = this.updateSelectedEnrollment(Ext.get(checkbox), e);
		} else if (button) {
			r = this.enrollmentClicked(Ext.get(button), e);
		} else if (anchor) {
			r = this.linkClicked(Ext.get(anchor), e);
		} else if (gift) {
			r = this.giftClicked(Ext.get(gift), e);
		}

		return r;
	},

	/**
	 * Updates the cards and button toggling a addon
	 * @param  {Ext.element} checkbox the addon element
	 * @param  {Event} e		the click event
	 * @returns {void}
	 */
	updateSelectedEnrollment: function (checkbox, e) {
		//if the checkbox is full don't do anything
		if (checkbox.hasCls('full')) { return; }

		var me = this,
			name = checkbox.getAttribute('data-name'),
			baseEl = me.cardsContainerEl.down('.enroll-option.base:not(.enrolled)'),
			button = me.cardsContainerEl.down('.button'),
			titleEl = baseEl && baseEl.down('.title'),
			priceEl = baseEl && baseEl.down('.price'),
			refundEl = baseEl && baseEl.down('.refund'),
			title, price, refund;

		function fillInOption (option) {
			title = option.title;
			refund = option.refund;
			price = me.getPriceString(option.price);

			button.removeCls(['paid', 'free', 'drop']);
			button.addCls(me.getButtonCls(option));
			button.dom.setAttribute('data-name', option.name);
			button.update(option.buttonText);

			if (titleEl) {
				titleEl.update(title);
			}

			if (priceEl) {
				priceEl.update(price);
			}

			if (refundEl) {
				refundEl.update(refund);
			}
		}

		//if the checkbox already has a class of checked
		//set it back to the base
		if (checkbox.hasCls('checked')) {
			fillInOption(me.state.base);

			checkbox.removeCls('checked');
		} else {
			fillInOption(me.state.addOns[name]);

			checkbox.addCls('checked');
		}
	},

	/**
	 * Handles anchors with hrefs that we are looking for
	 * @param  {Ext.element} link the anchor that was clicked
	 * @param  {Event} e	the click event
	 * @return {Boolean}	  whether or not the event should be stopped
	 */
	linkClicked: function (link, e) {
		var href = link.getAttribute('href'), r = true,
			u = $AppConfig.userObject;

		if (href === 'welcome') {
			e.stopEvent();
			this.AccountActions.showWelcomePage(u.getLink('content.permanent_welcome_page'));

			r = false;
		} else if (href === 'profile') {
			if (e) {
				e.stopEvent();
			}

			NavigationActions.pushRootRoute(u.getName(), u.getProfileUrl('about'), {
				user: u
			});

			r = false;
		} else if (href === 'resubmit') {
			e.stopEvent();
			this.enrollInOption('FiveminuteEnrollment');

			r = false;
		}

		return r;
	},

	/**
	 * Handles the button being clicked for enrolling/dropping
	 * @param  {Ext.element} button the button element
	 * @param  {Event} e	  the click event
	 * @returns {void}
	 */
	enrollmentClicked: function (button, e) {
		var me = this,
			video = me.details.getVideo(),
			name = button.getAttribute('data-name'),
			win = this.up('window'),
			option = me.enrollmentOptions[name],
			action;

		if (!option) {
			console.error('No enrollment option with that name', button);
			return;
		}

		const courseTitle = me.course.get('Title');

		// const displayTitle = (courseTitle.length >= 50)
		// 	? courseTitle.substr(0, 47) + '...'
		// 	: courseTitle + '.';

		function done (success, changed) {
			delete me.changingEnrollment;

			var c = me.CourseStore.findCourseForNtiid(me.course.getId());
			if (success && changed) {
				if (c) {
					me.course = c;
				}

				me.updateEnrollmentCard();
			}

			me.removeMask();
		}

		if (video) {
			video.stopPlayback();
		}

		if (option.Enrolled && option.undoEnrollment) {
			me.changingEnrollment = true;
			Ext.Msg.show({
				msg: getFormattedString('NextThought.view.courseware.enrollment.Details.DropDetails', {course: courseTitle}),
				title: getString('NextThought.view.courseware.enrollment.Details.AreSure'),
				icon: 'warning-red',
				buttons: {
					primary: {
						text: getString('NextThought.view.courseware.enrollment.Details.DropCourse'),
						cls: 'caution',
						handler: function () {
							me.addMask();
							option.undoEnrollment(me)
								.then(function (changed) {
									me.fireEvent('enrolled-action', false);
									me.showMessage(getFormattedString('NextThought.view.courseware.enrollment.Details.dropped', {
										course: courseTitle
									}));
									if (me.onDrop) {
										done(true, changed);
										me.onDrop();
									} else {
										done(true, changed);
									}
								})
								.catch(function (reason) {
									var msg;

									if (reason === 404) {
										msg = getString('NextThought.view.courseware.enrollment.Details.AlreadyDropped');
									} else {
										msg = getString('NextThought.view.courseware.enrollment.Details.ProblemDropping');
									}

									console.error('failed to drop course', reason);
									//already dropped?? -- double check the string to make sure it's correct
									me.showMessage(msg, true);
									done(false);
								});
						}
					},
					secondary: {
						text: getString('NextThought.view.courseware.enrollment.Details.DropCancel'),
						handler: done.bind(me, false)
					}
				}
			});
		} else if (option.doEnrollment) {
			if (option.lock) {
				me.changingEnrollment = true;
			}

			action = option.doEnrollment(me);

			if (action) {
				me.addMask();
				action
					.then(function (changed) {
						// TODO: We're not ready to show this yet.
						if (isFeature('suggest-contacts')) {
							me.__buildCongratsCard();
						}
						return changed;
					})
					.then(function (changed) {
						me.fireEvent('enrolled-action', true);
						me.msgClickHandler = function () {
							var c = me.CourseStore.findCourseBy(me.course.findByMyCourseInstance());
							Promise.resolve(c)
								.then(course => {
									var instance = course.get('CourseInstance');
									instance.fireNavigationEvent(me);

									if (win) {
										win.close();
									}
								})
								.catch(function (reason) {
									alert('Unable to find course.');
									console.error('Unable to find course.', reason);
								});
						};

						if (!isFeature('suggest-contacts')) {
							me.showMessage(getFormattedString('NextThought.view.courseware.enrollment.Details.enrollmentSuccess', {
								course: courseTitle
							}));
						} else {
							me.clearMessage();
						}

						if (me.onEnroll) {
							done(true, changed);
							me.onEnroll();
						} else {
							done(true, changed);
						}
					})
					.catch(function (reason) {
						if (reason === 409) {
							console.error('failed to enroll in course', reason);
							me.showMessage(getString('NextThought.view.courseware.enrollment.Details.AlreadyEnrolled'), true);
						}
						else {
							done(false);
						}
					});
			}
		}

	},

	giftClicked: function (el, e) {
		var give = e.getTarget('.give'),
			redeem = e.getTarget('.redeem'),
			option = this.enrollmentOptions.GiftOption;

		if (give) {
			option.doEnrollment(this, 'gift');
		} else if (redeem) {
			option.doEnrollment(this, 'redeem');
		}
	},

	enrollInOption: function (name) {
		var option = this.enrollmentOptions[name];

		if (option) {
			option.doEnrollment(this);
		}
	},

	congratsLayerClicked: function (el) {
		var nextSelectionEl = el.getTarget('.add-course');

		if (nextSelectionEl) {
			this.fireEvent('go-back');
		}
	},

	suggestContacts: function (onComplete) {
		var me = this, peersStore, c;

		c = this.CourseStore.findCourseBy(me.course.findByMyCourseInstance());
		Promise.resolve(c)
			.then(function (course) {
				var instance = course.get('CourseInstance');

				if (instance && instance.getSuggestContacts) {
					instance.getSuggestContacts()
						.then(function (items) {
							if (Ext.isEmpty(items)) { return Promise.reject(); }

							var a = Ext.getStore('all-contacts-store');
							peersStore = new Ext.data.Store({
								model: User,
								proxy: 'memory',
								data: items,
								filters: [
									function (item) {
										return !(a && a.contains(item.get('Username')));
									}
								]
							});
							me.suggestContactsWin = Ext.widget('suggest-contacts-window', {store: peersStore});
							me.suggestContactsWin.show();
							me.mon(me.suggestContactsWin, 'destroy', onComplete);
							me.mon(me.suggestContactsWin, 'destroy', 'refresh');
						})
						.catch(function () {
							me.mon(Ext.widget('oobe-contact-window'), 'destroy', onComplete);
						});
				}
			});
	},

	showCreateProfile: function (onComplete) {
		var me = this;
		me.createProfileWin = Ext.widget('profile-create-window');
		me.createProfileWin.show();
		me.mon(me.createProfileWin, 'destroy', onComplete);
	},

	onActionComplete: function (actionName) {
		var me = this,
			el = me.congratsLayerEl && me.congratsLayerEl.down('.' + actionName), nextAction;

		// Mark action as done
		if (el) { el.addCls('completed'); }
		Ext.Array.remove(me.requiredActions, actionName);

		// Prepare for next action
		nextAction = me.requiredActions.first();
		if (nextAction) {
			me.updateWindowButtons(nextAction);
		} else {
			me.updateWindowButtons('close', getString('NextThought.view.library.available.CourseWindow.Finished'));
		}
	},

	updateWindowButtons: function (action, name) {
		if (!action) { return; }

		var me = this;
		me.getButtonCfg = function () {
			return {
				name: name || getString('NextThought.view.library.available.CourseWindow.Continue'),
				action: action
			};
		};

		if (me.ownerCt && me.ownerCt.updateButtons) {
			me.ownerCt.updateButtons();
		}
	},

	buttonClick: function (action) {
		if (action === 'suggestContacts') {
			this.suggestContacts(this.onActionComplete.bind(this, action));
		}
		else if (action === 'createProfile') {
			this.showCreateProfile(this.onActionComplete.bind(this, action));
		}
		else {
			console.error('Action: ', action, ' is NOT supported');
		}
	}
});
