const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');
const { getService } = require('@nti/web-client');
const {
	getString,
	getFormattedString,
} = require('internal/legacy/util/Localization');
const AccountActions = require('internal/legacy/app/account/Actions');
const CoursesStateStore = require('internal/legacy/app/library/courses/StateStore');
require('internal/legacy/mixins/ProfileLinks');

const t = scoped('course.enrollment.confirmation', {
	'contact-support':
		'Please contact <a>support</a> if you have any questions.',
});

module.exports = exports = Ext.define(
	'NextThought.app.course.enrollment.components.Confirmation',
	{
		extend: 'Ext.Component',
		alias: 'widget.enrollment-confirmation',

		mixins: {
			ProfileLinks: 'NextThought.mixins.ProfileLinks',
		},

		cls: 'enrollment-credit-purchase',

		renderTpl: Ext.DomHelper.markup([
			{ cls: 'title', html: '{heading}' },
			{
				cls: 'things-to-do',
				cn: [
					{ cls: 'prompt', html: '{prompt}' },
					{
						tag: 'tpl',
						for: 'todo',
						cn: [{ tag: 'a', href: '{href}', html: '{text}' }],
					},
				],
			},
			{
				cls: 'transaction',
				cn: [
					{
						tag: 'span',
						cls: 'label',
						html:
							'{{{NextThought.view.courseware.enrollment.Confirmation.TransID}}}',
					},
					{ cls: 'transaction-id' },
				],
			},
			{
				cls: 'support',
				cn: [
					{
						cls: 'support-text',
						html: t('contact-support'),
					},
					{
						tag: 'tpl',
						if: 'phone',
						cn: [{ cls: 'help-link phone', html: '{phone}' }],
					},
				],
			},
			{ cls: 'iframe-container' },
		]),

		renderSelectors: {
			transactionContainerEl: '.transaction',
			transactionEl: '.transaction .transaction-id',
			iframeEl: '.iframe-container',
			contactSupportTextEl: '.support-text',
		},

		initComponent() {
			this.callParent(arguments);

			this.AccountActions = AccountActions.create();
			this.CourseStore = CoursesStateStore.getInstance();
		},

		beforeRender() {
			this.callParent(arguments);

			var c = this.course,
				start = c.get('StartDate'),
				confirmationText = getString('EnrollmentConfirmation') || {},
				prompt =
					confirmationText.subtitle &&
					getFormattedString(confirmationText.subtitle, {
						course: c.get('Title'),
					});

			if (!prompt) {
				if (start) {
					prompt = getFormattedString(
						'NextThought.view.courseware.enrollment.Confirmation.ClassStartInfo',
						{
							date: Ext.Date.format(start, 'F j, Y'),
							course: c.get('Title'),
						}
					);
				} else {
					prompt = getFormattedString('{course} is available now!', {
						course: c.get('Title'),
					});
				}
			}

			this.renderData = Ext.apply(this.renderData || {}, {
				heading: this.heading,
				prompt: prompt,
				todo: [
					{
						href: 'welcome',
						text: getString('enrollment.previewplatform', '', true),
					},
					{
						href: 'profile',
						text: getString(
							'NextThought.view.courseware.enrollment.Confirmation.CompleteProfile'
						),
					},
				],
				phone: getString(
					'course-info.course-support.phone',
					null,
					true
				),
			});
		},

		afterRender() {
			this.callParent(arguments);

			this.mon(this.el, 'click', e => {
				var a = e.getTarget('a'),
					href = a && a.getAttribute('href');

				if (!href) {
					return;
				}

				if (href === 'profile') {
					e.stopEvent();
					this.up('library-available-courses-window').close();
					this.navigateToProfile($AppConfig.userObject);
					return false;
				}

				if (href === 'welcome') {
					e.stopEvent();
					this.AccountActions.showWelcomePage(
						$AppConfig.getLink('content.permanent_welcome_page')
					);
					return false;
				}
			});

			this.transactionContainerEl.setVisibilityMode(
				Ext.dom.Element.DISPLAY
			);

			this.transactionInput = Ext.widget('simpletext', {
				inputType: 'text',
				readOnly: true,
				placeholder: getString(
					'NextThought.view.courseware.enrollment.Confirmation.TransID'
				),
				renderTo: this.transactionEl,
			});

			(async () => {
				const service = await getService();
				const { contactSupport } = service.getSupportLinks();
				this.contactSupportTextEl
					.down('a')
					?.set({ href: contactSupport });
			})();

			this.on('destroy', 'destroy', this.transactionInput);
		},

		stopClose() {
			return Promise.resolve();
		},

		beforeShow() {
			var purchaseAttempt = this.enrollmentOption.purchaseAttempt,
				transactionId =
					purchaseAttempt && purchaseAttempt.get('TransactionID'),
				family = this.course.getCatalogFamily(),
				enrollment =
					this.CourseStore.findEnrollmentForCourse(this.course) ||
					this.CourseStore.findForCatalogFamily(family),
				thankYou;

			if (Array.isArray(enrollment)) {
				enrollment = enrollment[0];
			}

			thankYou = enrollment && enrollment.get('VendorThankYouPage');

			if (transactionId) {
				this.transactionInput.update(transactionId);
			} else {
				this.transactionContainerEl.hide();
			}

			if (thankYou && thankYou.thankYouURL) {
				this.addThankYouPage(thankYou.thankYouURL);
			}
		},

		addThankYouPage(url) {
			var container = this.iframeEl.dom,
				existing = container.querySelector('iframe'),
				iframe;

			//Don't add the same frame twice
			if (existing && existing.src === url) {
				return;
			}

			container.innerHTML = '';

			iframe = document.createElement('iframe');
			iframe.src = url;

			container.appendChild(iframe);
		},
	}
);
