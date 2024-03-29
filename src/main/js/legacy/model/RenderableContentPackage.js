const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');

require('./ContentPackage');

const POLL_INTERVAL = 3000;

const SUCCESS = 'Success';
const PENDING = 'Pending';
const FAILED = 'Failed';

function monitorRenderJob(renderJob, onFinish) {
	let stop = false;
	let timeout;

	function onInterval(job) {
		if (stop) {
			return;
		}

		if (job.State === SUCCESS || job.State === FAILED) {
			onFinish(job.State, job);
			return;
		}

		timeout = setTimeout(() => {
			Service.request(Service.getLinkFrom(job.Links, 'QueryRenderJob'))
				.then(newJob => {
					onInterval(JSON.parse(newJob));
				})
				.catch(() => {
					onFinish(FAILED);
				});
		}, POLL_INTERVAL);
	}

	onInterval(renderJob);

	return function () {
		clearTimeout(timeout);
		stop = true;
	};
}

module.exports = exports = Ext.define(
	'NextThought.model.RenderableContentPackage',
	{
		extend: 'NextThought.model.ContentPackage',

		mimeType: 'application/vnd.nextthought.renderablecontentpackage',

		isRenderableContentPackage: true,

		fields: [
			{ name: 'isPublished', type: 'bool' },
			{ name: 'isRendered', type: 'bool' },
			{ name: 'LatestRenderJob', type: 'auto' },
		],

		constructor() {
			this.callParent(arguments);

			wait().then(() => this.startMonitor());
		},

		onSync(record) {
			record.stopMonitor();
			this.startMonitor();
		},

		shouldAllowTocLoad() {
			return this.isRendered();
		},

		stopMonitor() {
			if (this.__stopMonitor) {
				this.__stopMonitor();
			}
		},

		startMonitor() {
			const renderJob = this.get('LatestRenderJob');

			if (renderJob && renderJob.State === PENDING) {
				this.__stopMonitor = monitorRenderJob(
					this.get('LatestRenderJob'),
					(status, job) => {
						this.set('index', job.index);
						this.set('index_jsonp', job.index_jsonp);

						this.LatestRenderJobStatus = status;
						this.fireEvent('update');

						if (this.__onRenderFinish) {
							this.__onRenderFinish();
						}
					}
				);
			}
		},

		isRendered() {
			return (
				this.get('isRendered') || this.LatestRenderJobStatus === SUCCESS
			);
		},

		__setImage() {},
	}
);
