/* eslint-env jest */
import { render, fireEvent } from '@testing-library/react';

import { wait } from '@nti/lib-commons';
import {
	setupTestClient,
	tearDownTestClient,
} from '@nti/web-client/test-utils';

import Hit from '../Hit';

const fakeHit = {
	Class: 'Hit',
	ContainerID:
		'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
	Containers: [
		'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
	],
	CreatedTime: '2017-03-31T22:59:00Z',
	Creator: 'landon.sherwood',
	Fragments: [
		{
			Class: 'SearchFragment',
			Field: 'keywords',
			Matches: ['<hit>test</hit>'],
			MimeType: 'application/vnd.nextthought.search.searchfragment',
		},
		{
			Class: 'SearchFragment',
			Field: 'content',
			Matches: ['<hit>test</hit>'],
			MimeType: 'application/vnd.nextthought.search.searchfragment',
		},
		{
			Class: 'SearchFragment',
			Field: 'title',
			Matches: ['<hit>Testing</hit>'],
			MimeType: 'application/vnd.nextthought.search.searchfragment',
		},
	],
	'Last Modified': '2017-03-31T22:59:00Z',
	MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
	NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
	Score: 36.81021,
	TargetMimeType: 'application/vnd.nextthought.note',
};
const fakeFragments = [
	{ fragIndex: 1, text: '<hit>test</hit>' },
	{ fragIndex: 2, text: '<hit>Testing</hit>' },
];
const navigateToSearchHit = jest.fn();

const mockService = () => ({
	getObject: o => Promise.resolve(o),
});

const onBefore = () => {
	setupTestClient(mockService());
};

const onAfter = () => {
	tearDownTestClient();
};

const fakePath = [
	{
		label: 'Human Physiology',
		ntiid: 'tag:nextthought.com,2011-10:system-OID-0x4a73:5573657273:kj79vfPDVYE',
	},
	{
		label: 'Human Physiology',
		ntiid: 'tag:nextthought.com,2011-10:system-OID-0x4a73:5573657273:kj79vfPDVYE',
	},
	{
		label: 'Human Physiology',
		ntiid: 'tag:nextthought.com,2011-10:system-OID-0x4a73:5573657273:kj79vfPDVYE',
	},
];

describe('<Hit />', () => {
	beforeEach(onBefore);
	afterEach(onAfter);

	test('should render at least one <Fragments /> components', () => {
		const { container } = render(
			<Hit
				fragments={fakeFragments}
				hit={fakeHit}
				navigateToSearchHit={navigateToSearchHit}
				path={fakePath}
				title="Testing"
			/>
		);
		expect(container.querySelectorAll('.hit-fragments').length).toBe(1);
	});

	test('should render one <Path /> component', () => {
		const { container } = render(
			<Hit
				fragments={fakeFragments}
				hit={fakeHit}
				navigateToSearchHit={navigateToSearchHit}
				path={fakePath}
				title="Testing"
			/>
		);
		expect(container.querySelectorAll('.hit-path').length).toBe(1);
	});

	test('should render a `.search-result-react`', () => {
		const { container } = render(
			<Hit
				fragments={fakeFragments}
				hit={fakeHit}
				navigateToSearchHit={navigateToSearchHit}
				path={fakePath}
				title="Testing"
			/>
		);
		expect(container.querySelectorAll('.search-result-react').length).toBe(
			1
		);
	});

	test('should render a `.hit-title`', () => {
		const { container } = render(
			<Hit
				fragments={fakeFragments}
				hit={fakeHit}
				navigateToSearchHit={navigateToSearchHit}
				path={fakePath}
				title="Testing"
			/>
		);
		expect(container.querySelectorAll('.hit-title').length).toBe(1);
	});

	test('simulates clicks on title', async () => {
		const { container } = render(
			<Hit
				fragments={fakeFragments}
				hit={fakeHit}
				navigateToSearchHit={navigateToSearchHit}
				path={fakePath}
				title="Testing"
			/>
		);

		fireEvent.click(container.querySelector('.hit-title'));

		await wait();
		expect(navigateToSearchHit).toHaveBeenCalled();
	});
});
