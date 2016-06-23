require('legacy/app/course/overview/components/editing/controls/Synclock');

describe('NextThought.app.course.overview.components.editing.controls.Synclock', () => {

	let previousService;
	let synclock;

	let links;
	let data;
	let contents;

	beforeAll(() => {
		previousService = global.Service;
	});

	afterAll(() => {
		global.Service = previousService;
	});

	beforeEach(() => {
		global.Service = {};
		synclock = NextThought.app.course.overview.components.editing.controls.Synclock.create({});

		links = { hasLink: (link) => { return !!links[link]; } };
		data = { Links: links };
		contents = { data: data };

		synclock.contents = contents;
		Service.canDoAdvancedEditing = () => { return true; };
	});

	it('should not appear for users without advanced editing abilities.', () => {
		Service.canDoAdvancedEditing = () => { return false; };
		synclock.beforeRender();

		expect(!!synclock.hidden).toBe(true);
	});

	it('should not appear for items that are not sync locked.', () => {
		synclock.beforeRender();

		expect(!!synclock.hidden).toBe(true);
	});

	it('should only appear for advanced editors on sync locked content.', () => {
		synclock.contents.data.Links.SyncUnlock = true;
		synclock.beforeRender();

		expect(!!synclock.hidden).toBe(false);
	});
});
