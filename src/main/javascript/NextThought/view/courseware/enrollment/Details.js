Ext.define('NextThought.view.courseware.enrollment.Details', {
	extend: 'Ext.Component',
	alias: 'widget.course-enrollment-details',

	requires: [
		'NextThought.view.courseware.info.Panel'
	],

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
		{cls: 'gift-card {base.giftClass}', cn: [
			{cls: 'give {base.giveClass}', cn: [
				{cls: 'title', html: '{{{NextThought.view.courseware.enrollment.Details.CourseGift}}}'},
				{cls: 'sub', html: '{base.giveTitle}'}
			]},
			{cls: 'redeem {base.redeemClass}', cn: [
				{cls: 'title', html: '{{{NextThought.view.courseware.enrollment.Details.RedeemGift}}}'}
			]}
		]}
	])),


	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'sub', html: '{number}'},
			{cls: 'title', html: '{title}'}
		]},
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


	initComponent: function() {
		this.callParent(arguments);

		this.enableBubble(['enrolled-action', 'show-msg']);

		AnalyticsUtil.getResourceTimer(this.course.getId(), {
			type: 'course-catalog-viewed',
			course: this.course.getId()
		});

		this.on('beforedeactivate', 'onBeforeDeactivate');

		window.EnrollInOption = this.enrollInOption.bind(this);
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			number: this.course.get('ProviderUniqueID'),
			title: this.course.get('Title')
		});
	},


	stopClose: function() {
		return this.changingEnrollment ? Promise.reject() : Promise.resolve();
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.details = Ext.widget('course-info-panel', {
			videoWidth: 642,
			videoHeight: 360,
			renderTo: this.detailsEl
		});

		me.details.setContent(me.course);

		me.on('destroy', 'destroy', me.details);

		me.updateEnrollmentCard();

		me.mon(me.cardsEl, 'click', 'handleEnrollmentClick', me);

		me.el.setStyle({
			backgroundImage: 'url(' + me.course.get('background') + ')'
		});
	},

	/**
	 * Restore to an enrollment option
	 * @param  {String} type   name of the enrollment option
	 * @param  {Array} config  array of configs for the option to parse
	 */
	restoreEnrollmentOption: function(type, config) {
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
			option = this.enrollmentOptions.StoreEnrollment;

			if (option && option.Redeemable) {
				option.doEnrollment(this, 'redeem', config);
			}
		} else if (type === 'forcredit') {
			option = this.enrollmentOptions.FiveminuteEnrollment;

			if (option) {
				checkbox = this.el.down('.addon.checkbox[data-name=FiveminuteEnrollment');

				if (checkbox) {
					this.updateSelectedEnrollment(checkbox);
				}
			}
		}

		delete this.__stateToRestore;
	},


	onDestroy: function() {
		this.callParent(arguments);

		AnalyticsUtil.stopResourceTimer(this.course.getId(), 'course-catalog-viewed');
	},


	onBeforeDeactivate: function() {
		return !this.changingEnrollment;
	},


	addMask: function() {
		try {
			var maskEl = this.el && this.el.up('.body-container');
			if (maskEl) {
				maskEl.mask('Loading...');
			}
		} catch (e) {
			console.warn('Error masking. %o', e);
		}
	},


	removeMask: function() {
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


	__getOptionText: function(details, option) {
		return option.Wording;
	},


	__addBaseOption: function(details, option) {
		if (this.state.base) {
			console.error('More than one base', details, option);
			return;
		}

		this.state.base = this.__getOptionText(details, option);
	},


	__addAddOnOption: function(details, option) {
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
	 * Given enrollment details, fetch all the data for the option given
	 * @param  {Promise} option    promise to load the option details
	 * @param  {Object} details the enrollment details
	 * @return {Promise}         resolved if the option is available, reject if not;
	 */
	__addEnrollmentOption: function(option, details) {
		var me = this, loading;

		if (option) {
			loading = option.then(function(data) {
				me.enrollmentOptions[data.Name] = data;

				if (data.BaseOption) {
					me.__addBaseOption(details, data);
				} else {
					me.__addAddOnOption(details, data);
				}
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
	 * @return {Promise}         fulfills when its done, a rejection is not expected
	 */
	__onDetailsLoaded: function(details) {
		var loading = Promise.reject(),
			me = this;

		//iterate through the all the possible options and load their data
		//if the option is configured to wait, do not unmask the card before its is loaded
		//if the option isn't ocnfigured to wait, do not block showing the card
		CourseWareUtils.Enrollment.forEachOption(function(option) {
			var optionDetails = details.Options[option.name];

			//if we are enrolled in the option always wait for it to finish
			if (optionDetails.IsEnrolled) {
				loading = loading
							.always(me.__addEnrollmentOption.bind(me, optionDetails.loaded, details));
			} else if (option.wait) {
				//if we aren't enrolled only wait if we should for this option
				loading = loading
							.fail(me.__addEnrollmentOption.bind(me, optionDetails.loaded, details));
			} else {
				//add a placeholder for the add on to show that there is another option coming
				me.state.addOns[option.name] = {
					name: option.name,
					loading: true
				};

				//if the option is not available it will be a rejected promise immediately
				//so on fail remove it from the addons
				me.__addEnrollmentOption(optionDetails.loaded, details)
					.fail(function() {
						delete me.state.addOns[option.name];
					});
			}
		});

		return loading;
	},


	__maybeUpdateCard: function(state) {
		var me = this,
			card = me.cardsContainerEl,
			addOns = Object.keys(state.addOns || {});


		//if the card is still loading there's no need to update
		if (card.hasCls('loading')) { return; }

		addOns.forEach(function(key) {
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


	__buildCard: function(state) {
		var data = {
				base: state.base,
				addOns: [],
				buttonName: state.base.name,
				buttonCls: this.getButtonCls(state.base),
				buttonText: state.base.buttonText || '',
				drop: state.base.drop
			},
			me = this,
			addOns = Ext.Object.getValues(state.addOns);

		addOns.forEach(function(addOn) {
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


	__showError: function() {

	},

	/**
	 * Updates the enrollment card to match the options available
	 * to the user for this course
	 *
	 * @param {Boolean} updateFromStore update the course from the available courses store
	 */
	updateEnrollmentCard: function(updateFromStore) {
		if (this.isDestroyed) {
			return;
		}

		var me = this, c,
			store = Ext.getStore('courseware.AvailableCourses'),
			loading;

		if (updateFromStore) {
			c = store.getById(me.course.getId());

			if (c) {
				me.course = c;
			}
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

		CourseWareUtils.Enrollment.getEnrollmentDetails(me.course)
			.then(me.__onDetailsLoaded.bind(me))
			.then(function() {
				return me.state;
			})
			.fail(function(reason) {
				console.error('Failed to load enrollment details,', reason);
				me.__showError();
				return Promise.reject();//keep the failure going
			})
			.then(me.__buildCard.bind(me))
			.then(function() {
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
	 * @return {String}       what we should show the user
	 */
	getPriceString: function(base, addOn) {
		var price;

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


	getButtonCls: function(option) {
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

	showMessage: function(msg, isError, cursor) {
		var me = this,
			win = me.up('[showMsg]'),
			guid = guidGenerator();

		if (!win) {return;}//user closed window before we got here.

		win.showMsg(msg, isError, false, guid, cursor);

		Ext.destroy(me.__showMessageClickMonitor);
		me.__showMessageClickMonitor = me.mon(win, {
			destroyable: true,
			single: true,
			'message-clicked': function(msgId) {
				if (msgId === guid) {
					Ext.callback(me.msgClickHandler);
				}
			}});
	},

	/**
	 * Handles a click on the enrollment card and calls the appropriate handler
	 * @param  {Event} e the click event
	 * @return {Boolean}   if the event was stopped
	 */
	handleEnrollmentClick: function(e) {
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
	 * @param  {Event} e        the click event
	 */
	updateSelectedEnrollment: function(checkbox, e) {
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

		function fillInOption(option) {
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
	 * @param  {Event} e    the click event
	 * @return {Boolean}      whether or not the event should be stopped
	 */
	linkClicked: function(link, e) {
		var href = link.getAttribute('href'), r = true,
			win = this.up('window');

		if (href === 'welcome') {
			e.stopEvent();
			this.fireEvent('show-permanent-welcome-guide', {
				link: $AppConfig.userObject.getLink('content.permanent_welcome_page')
			});

			r = false;
		} else if (href === 'profile') {
			e.stopEvent();
			this.fireEvent('show-profile', $AppConfig.userObject, ['about']);

			if (win) {
				win.close();
			}

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
	 * @param  {Event} e      the click event
	 */
	enrollmentClicked: function(button, e) {
		var me = this, title,
			video = me.details.getVideo(),
			name = button.getAttribute('data-name'),
			option = me.enrollmentOptions[name], action;

		if (!option) {
			console.error('No enrollment option with that name', button);
			return;
		}

		title = me.course.get('Title');
		course = me.course.get('Title');

		if (title.length >= 50) {
			title = title.substr(0, 47) + '...';
		} else {
			title = title + '.';
		}

		function done(success, changed) {
			delete me.changingEnrollment;

			var store = Ext.getStore('courseware.AvailableCourses'),
				c = store.getById(me.course.getId());

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
				msg: getFormattedString('NextThought.view.courseware.enrollment.Details.DropDetails', {course: course}),
				title: getString('NextThought.view.courseware.enrollment.Details.AreSure'),
				icon: 'warning-red',
				buttons: {
					primary: {
						text: getString('NextThought.view.courseware.enrollment.Details.DropCourse'),
						cls: 'caution',
						handler: function() {
							me.addMask();
							option.undoEnrollment(me)
								.then(function(changed) {
									me.fireEvent('enrolled-action', false);
									me.showMessage(getFormattedString('NextThought.view.courseware.enrollment.Details.dropped', {
										course: course
									}));
									done(true, changed);
								})
								.fail(function(reason) {
									console.error('failed to drop course', reason);
									me.showMessage(getString('NextThought.view.courseware.enrollment.Details.AlreadyDropped'), true);
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
					.then(function(changed) {
						me.fireEvent('enrolled-action', true);

						me.msgClickHandler = function() {
							CourseWareUtils.findCourseBy(me.course.findByMyCourseInstance())
								.then(function(course) {
									var instance = course.get('CourseInstance');
									instance.fireNavigationEvent(me);

									if (win) {
										win.close();
									}
								})
								.fail(function(reason) {
									alert('Unable to find course.');
									console.error('Unable to find course.', reason);
								});
						};

						done(true, changed);
					})
					.fail(function(reason) {
						console.error('failed to enroll in course', reason);

						me.showMessage(getString('NextThought.view.courseware.enrollment.Details.AlreadyEnrolled'), true);

						done(false);
					});
			}
		}

	},


	giftClicked: function(el, e) {
		var give = e.getTarget('.give'),
			redeem = e.getTarget('.redeem'),
			option = this.enrollmentOptions.StoreEnrollment;

		if (give) {
			option.doEnrollment(this, 'gift');
		} else if (redeem) {
			option.doEnrollment(this, 'redeem');
		}
	},


	enrollInOption: function(name) {
		var option = this.enrollmentOptions[name];

		if (option) {
			option.doEnrollment(this);
		}
	}
});
