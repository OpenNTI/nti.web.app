const Ext = require('@nti/extjs');

const styles = require('./Quote.css');
const QUOTE_COMPLETED = 'inapp-quote-done';

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.quotes.BaseQuote',
	{
		extend:
			'NextThought.app.course.overview.components.editing.content.Editor',
		alias: 'widget.overview-editing-base-quote',

		cls: '',

		initComponent() {
			this.callParent(arguments);

			let onPostMessage = this.onPostMessage.bind(this);

			window.addEventListener('message', onPostMessage);

			this.on('destroy', () => {
				window.removeEventListener('message', onPostMessage);
			});
		},

		onPostMessage(event) {
			if (event.data === QUOTE_COMPLETED) {
				this.doBack();
			}
		},

		showEditor() {
			this.showItemEditor();
		},

		showItemEditor() {
			if (this.itemEditorCmp) {
				this.itemEditorCmp.destroy();
				delete this.itemEditorCmp;
			}
			let u = $AppConfig.userObject;
			let firstName =
				u.get('FirstName') ||
				u.get('FullName') ||
				u.get('realname') ||
				'';
			let email = u.get('email');
			let clientSite = $AppConfig.siteName;

			this.itemEditorCmp = this.add({
				xtype: 'box',
				cls: styles['quote-iframe'],
				autoEl: {
					tag: 'iframe',
					src: `${this.hubspotPageUrl}?firstname=${firstName}${
						email ? `&email=${email}` : ''
					}&client_site_name=${clientSite}`,
				},
			});
		},
	}
);
