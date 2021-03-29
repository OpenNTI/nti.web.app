const Ext = require('@nti/extjs');
const {Color} = require('@nti/lib-commons');

const styles = stylesheet`
	.dark:global(.overview-group-title) {
		color: var(--primary-grey) !important;
	}
`;

const White = Color.fromHex('#fff');
const settings = {level:'AA',size:'large'};


module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.overviewgroup.Preview',
	{
		extend: 'Ext.Component',
		alias: 'widget.overview-editing-overviewgroup-preview',

		statics: {
			isDark (group) {
				return !White.a11y.isReadable(`#${group.get('accentColor')}`, settings);
			}
		},

		cls: 'overview-group-title',

		renderTpl: '{title:htmlEncode}',

		beforeRender: function () {
			this.callParent(arguments);

			if (!White.a11y.isReadable(`#${this.group.get('accentColor')}`, settings)) {
				this.addCls(styles.dark);
			}

			this.renderData = Ext.apply(this.renderData || {}, {
				title: this.group.get('title'),
				color: this.group.get('accentColor'),
			});
		}
	}
);
