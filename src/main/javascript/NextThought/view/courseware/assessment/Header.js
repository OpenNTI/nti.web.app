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
						{ tag: 'span', cls: 'currentPage', html: '{page}'}, ' of ', {tag: 'span', cls: 'total', html: '{total}'}
					] },
					{ cls: 'up {noPrev:boolStr("disabled")}' },
					{ cls: 'down {noNext:boolStr("disabled")}' }
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
		totalEl: '.toolbar .page .total',
		currentPageEl: '.toolbar .page .currentPage',
		pageEl: '.toolbar .page',
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


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			path: this.path || [],
			page: this.pageSource.getPageNumber(),
			total: this.pageSource.getTotal(),
			noNext: !this.pageSource.hasNext(),
			noPrev: !this.pageSource.hasPrevious()
		});

		this.onPagerUpdate();

		this.mon(this.pageSource, 'update', 'onPagerUpdate');

		this.on({
			pathEl: {
				click: 'onPathClicked',
				mouseover: 'onPathHover'
			},
			previousEl: { click: 'firePreviousEvent' },
			nextEl: { click: 'fireNextEvent' }
		});
	},


	showToast: function(msgOrConfig) {
		if (!this.rendered) {
			this.on('afterrender', this.showToast.bind(this, arguments));
			return;
		}

		var me = this, toast,
			config = Ext.isString(msgOrConfig) ? { text: msgOrConfig} : msgOrConfig,
			content = config.content || {html: config.text};

		config.cls = config.cls ? 'header-toast ' + config.cls : 'header-toast';

		toast = Ext.widget('box', {
			cls: config.cls,
			autoEl: content,
			renderTo: this.pathEl
		});

		if (config.minTime) {
			toast.waitToClose = wait(config.minTime);
		}

		me.pathEl.addCls('show-toast');

		return {
			el: toast,
			//fulfills after the minimum time the toast has to be open passes
			openLongEnough: toast.waitToClose,
			close: function(time) {
				this.closing = true;
				wait(time || 0)
					.then(function() {
						me.pathEl.removeCls('show-toast');
						wait(500).then(toast.destroy.bind(toast));
					});
			}
		};
	},


	onPagerUpdate: function() {
		if (!this.rendered) {
			this.on({afterrender: 'onPagerUpdate', single: true});
			return;
		}

		var current = this.pageSource.getPageNumber();

		if (this.pageSource.hasNext()) {
			this.nextEl.removeCls('disabled');
		}

		if (this.pageSource.hasPrevious()) {
			this.previousEl.removeCls('disabled');
		}

		if (current) {
			this.pageEl.show();
			this.currentPageEl.update(current);
			this.totalEl.update(this.pageSource.getTotal());
		} else {
			this.pageEl.hide();
		}
	},


	onPathClicked: function(e) {
		var goHome = !!e.getTarget('.root'),
			goNowhere = !!e.getTarget('.current'),
			goUp = !goHome && !goNowhere && !!e.getTarget('.part'),
			pV = this.parentView;

		Ext.suspendLayouts();
		try {
			if (goUp) {
				this.fireGoUp();
			} else if (goHome) {

				if (pV && pV.fireGoUp) {
					pV.fireGoUp();
				} else if (pV) { console.log(pV.id + 'does not implement fireGoUp'); }

				this.fireGoUp();
			}
		} finally {
			Ext.resumeLayouts();
		}
	},


	onPathHover: function(e) {
		var part = e.getTarget('.path');

		if (!part) { return; }

		return this.onPartHover(e, part);
	},


	onPartHover: function(e, part) {
		return true;
	},


	fireGoUp: function() {
		this.fireEvent('goup', this);
	},


	firePreviousEvent: function(e) {
		if (e.getTarget('.disabled')) {
			e.stopEvent();
			return;
		}
		this.goTo(this.pageSource.getPrevious());
	},


	fireNextEvent: function(e) {
		if (e.getTarget('.disabled')) {
			e.stopEvent();
			return;
		}
		this.goTo(this.pageSource.getNext());
	},


	goTo: function(rec) {
		this.fireEvent('goto', rec);
	}
});
