/* eslint-env jest */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { wait } from '@nti/lib-commons';

import Fragments from '../Fragments';

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
	NTIID:
		'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
	Score: 36.81021,
	TargetMimeType: 'application/vnd.nextthought.note',
};
const fakeFragments = [
	{ fragIndex: 1, text: '<hit>test</hit>' },
	{ fragIndex: 2, text: '<hit>Testing</hit>' },
];

const mockService = () => ({
	getObject: o => Promise.resolve(o),
});

const onBefore = () => {
	global.$AppConfig = {
		...(global.$AppConfig || {}),
		nodeService: mockService(),
		nodeInterface: {
			getServiceDocument: () =>
				Promise.resolve(global.$AppConfig.nodeService),
		},
	};
};

const onAfter = () => {
	//unmock getService()
	const { $AppConfig } = global;
	delete $AppConfig.nodeInterface;
	delete $AppConfig.nodeService;
};

describe('<Fragments />', () => {
	beforeEach(onBefore);
	afterEach(onAfter);

	test('should render a `.hit-fragments`', async () => {
		const { container, findAllByRole } = render(
			<Fragments
				fragments={fakeFragments}
				hit={fakeHit}
				navigateToSearchHit={jest.fn()}
			/>
		);
		expect((await findAllByRole('mark')).length).toBe(2);
		expect(container.querySelectorAll('.hit-fragments').length).toBe(1);
	});

	test('should render at least one `.hit-fragment`', async () => {
		const { container } = render(
			<Fragments
				fragments={fakeFragments}
				hit={fakeHit}
				navigateToSearchHit={jest.fn()}
			/>
		);
		expect(container.querySelectorAll('.hit-fragment').length).toBe(2);
	});

	test('simulates click events on fragments', async () => {
		const navigateToSearchHit = jest.fn();
		const { container } = render(
			<Fragments
				fragments={fakeFragments}
				hit={fakeHit}
				navigateToSearchHit={navigateToSearchHit}
			/>
		);
		// Clicks fragment with key value of 1
		fireEvent.click(container.querySelector('.hit-fragment'));
		await wait();
		expect(navigateToSearchHit).toHaveBeenCalled();
	});
});
