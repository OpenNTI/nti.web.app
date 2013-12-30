Ext.define('NextThought.view.courseware.assessment.admin.reader.Header', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-admin-reader-header',
	ui: 'course-assessment',
	cls: 'course-assessment-admin assignment-item reader-header',

	renderTpl: Ext.DomHelper.markup([
		//toolbar
		{
			cls: 'toolbar',
			cn: [
				{ cls: 'right controls', cn: [
					{ cls: 'page', cn: [
						{ tag: 'span', html: '{page}'}, ' of ', {tag: 'span', html: '{total}'}
					] },
					{ cls: 'up' },
					{ cls: 'down' }
				] },
				//path (bread crumb)
				{
					cls: 'path-items',
					cn: [
						{ tag: 'span', cls: 'path part root', html: '{pathRoot}'},
						{ tag: 'span', cls: 'path part', html: '{pathBranch}'},
						{ tag: 'span', cls: 'path part current', html: '{pathLeaf}'}
					]
				}
			]
		},
		//header
		{
			cls: 'header',
			cn: [
				{ cls: 'grade', cn: [
					{ cls: 'label', html: 'Assignment Grade'},
					{ cls: 'late', html: '{late}'},
					{ cls: 'gradebox', cn: [
						{ tag: 'input', size: 3, type: 'text', value: '{grade}'},
						{ cls: 'dropdown letter grade', html: '{letter}'}
					]}
				]},
				{ cls: 'user', cn: [
					{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'}},
					{ cls: 'wrap', cn: [
						{ cls: 'title name {presence}', cn: {html: '{displayName}' }},
						{ cls: 'subtitle actions', cn: [
							{ tag: 'span', cls: 'profile link', html: 'Profile'},
							{ tag: 'span', cls: 'email link', html: 'Email'},
							{ tag: 'span', cls: 'chat link', html: 'Chat'}
						]}
					]}
				]}
			]
		}
	]),


	renderSelectors: {
		pathEl: '.toolbar .path-items',
		previousEl: '.toolbar .controls .up',
		nextEl: '.toolbar .controls .down'
	},


	beforeRender: function() {
		this.callParent();
		this.renderData = Ext.apply(this.renderData || {}, {
			displayName: this.student.toString(),
			pathRoot: this.path[0] || '',
			pathBranch: this.path[1] || '',
			pathLeaf: this.path[2] || '',
			avatarURL: this.student.get('avatarURL'),
			presence: this.student.getPresence().getName(),
			grade: '100',
			letter: 'A',
			page: this.page,
			total: this.total
		});
	}
});
