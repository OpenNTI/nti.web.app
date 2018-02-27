const Ext = require('extjs');
const {ProgressWindow} = require('nti-web-course');

require('legacy/common/window/Window');
require('legacy/app/account/Header');
require('legacy/overrides/ReactHarness');


module.exports = exports = Ext.define('NextThought.app.course.info.components.ProgressWindow', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.progress-window',
	cls: 'progress-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	modal: true,
	closable: true,
	resizable: false,
	dialog: true,
	closeAction: 'destroy',
	width: 764,

	items: [],

	constructor: function ({record, openEmailWindow, initialPage, totalPages, prevLink, nextLink}) {
		this.callParent(arguments);

		let onEmail;

		if(openEmailWindow) {
			onEmail = (user) => {
				const userTarget = {
					getTarget: function () {
						return {
							getAttribute: function () {
								return user;
							}
						};
					}
				};

				this.close();

				openEmailWindow && openEmailWindow(userTarget);
			};
		}

		this.add({
			xtype: 'react',
			component: ProgressWindow,
			user: record.get('id'),
			initialPage,
			totalPages,
			nextLink,
			prevLink,
			onClose: () => {
				this.close();
			},
			onEmail
		});
	},

	afterRender: function () {
		this.callParent(arguments);
	}
});
