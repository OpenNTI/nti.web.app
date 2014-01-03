Ext.define('NextThought.view.courseware.assessment.Header', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-header',
	ui: 'course-assessment',

	cls: 'course-assessment-header assignment-item',

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
						{ tag: 'tpl', 'for': 'path', cn: [
							{tag: 'span', cls: "path part {[ xindex === xcount? 'current' : xindex === 1? 'root' : '']}", html: '{.}'}
						]}
					]
				}
			]
		},
		//header
		{
			cls: 'header',
			html: '{headerContents}'
		}
	]),

	renderSelectors: {
		pathEl: '.toolbar .path-items',
		previousEl: '.toolbar .controls .up',
		nextEl: '.toolbar .controls .down'
	},

	headerTpl: '',

	onClassExtended: function(cls, data) {
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {},cls.superclass.renderSelectors);
		data.headerTpl = data.headerTpl || cls.superclass.headerTpl || false;

		var tpl = cls.superclass.renderTpl;

		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}

		if (!data.renderTpl) {
			data.renderTpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}

		//merge in subclass's templates
		data.renderTpl = data.renderTpl.replace('{headerContents}', data.headerTpl || '');
	},


	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			path: this.path || [],
			page: this.page,
			total: this.total
		});

		this.on({
			pathEl: {click: 'onPathClicked'},
			previousEl: { click: 'firePreviousEvent' },
			nextEl: { click: 'fireNextEvent' }
		});
	},


	onPathClicked: function(e) {
		var goHome = !!e.getTarget('.root'),
			goNowhere = !!e.getTarget('.current'),
			goUp = !goHome && !goNowhere && !!e.getTarget('.part');

		if (goUp) {
			this.fireGoUp();
		} else if (goHome) {
			this.fireGoUp();
			this.parentView && this.parentView.fireGoUp();
		}
	},


	fireGoUp: function() {
		this.fireEvent('goup', this);
	},


	firePreviousEvent: function() {
		//page is 1 based, and we want to go to the previous index
		var index = this.page - 2;
		if (index < 0) {
			index = this.total - 1;
		}

		this.goTo(index);
	},


	fireNextEvent: function() {
		//page is 1 based, and we want to go to the next index (so, next 0-based index = current page in 1-based)
		var index = this.page;

		if (index > (this.total - 1)) {
			index = 0;
		}

		this.goTo(index);
	},


	goTo: function(index) {
		this.fireEvent('goto', index)
	}
});