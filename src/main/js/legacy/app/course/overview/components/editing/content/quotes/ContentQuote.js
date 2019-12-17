const Ext = require('@nti/extjs');

const QUOTE_COMPLETED = 'inapp-quote-done';
const HUBSPOT_QUOTE_PAGE = 'https://www.nextthought.com/content-quote';

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.quotes.ContentEditor',
	{
		extend:
			'NextThought.app.course.overview.components.editing.content.Editor',
		alias: 'widget.overview-editing-content-development',

		statics: {
			getHandledMimeTypes () {
				return [];
			},

			getTypes () {
				return [
					{
						title: 'Content Development',
						category: 'content-development',
						iconCls: 'ad-content',
						description: '',
						editor: this,
						hideFooter: true,
						isAvailable: () => true
					}
				];
			}
		},

		cls: '',

		initComponent () {
			this.callParent(arguments);

			let onPostMessage = this.onPostMessage.bind(this);

			window.addEventListener('message', onPostMessage);

			this.on('destroy', () => {
				window.removeEventListener('message', onPostMessage);
			});
		},

		onPostMessage (event) {
			if (event.data === QUOTE_COMPLETED) {
				this.doBack();
			}
		},

		showEditor () {
			this.showItemEditor();
		},

		showItemEditor () {
			if (this.itemEditorCmp) {
				this.itemEditorCmp.destroy();
				delete this.itemEditorCmp;
			}
			let u = $AppConfig.userObject;
			let firstName = u.get('FirstName') || u.get('FullName') || u.get('realname') || '';
			let email = u.get('email');
			let clientSite = $AppConfig.siteName;

			this.itemEditorCmp = this.add({
				xtype: 'box',
				cls: 'quote-iframe',
				autoEl: {
					tag: 'iframe',
					src: `${HUBSPOT_QUOTE_PAGE}?firstname=${firstName}${email ? `&email=${email}` : ''}&client_site_name=${clientSite}`
				}
			});
		},
	}
);
