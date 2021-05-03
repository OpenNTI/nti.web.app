/* eslint-env jest */
import React from 'react';
import { render, waitFor } from '@testing-library/react';

import {
	setupTestClient,
	tearDownTestClient,
} from '@nti/web-client/test-utils';

import SearchResults from '../Results';

const fakeHits = [
	{
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
	},
	{
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
	},
	{
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
	},
	{
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
	},
	{
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
	},
	{
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
	},
	{
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
	},
	{
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
	},
	{
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
	},
	{
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
	},
];

const onBefore = () => {
	setupTestClient({
		getObject: async o => o,
	});
};

const onAfter = () => {
	tearDownTestClient();
};

describe('<SearchResults />', () => {
	beforeAll(onBefore);
	afterAll(onAfter);

	test('should render ten <Hit /> components', async () => {
		const { container } = render(<SearchResults hits={fakeHits} />);
		await waitFor(() => {
			expect(
				container.querySelectorAll('.search-result-react').length
			).toBe(10);
		});
	});

	test('should render one <Pager /> component', async () => {
		const { container } = render(
			<SearchResults hits={fakeHits} numPages={2} />
		);
		await waitFor(() => {
			expect(
				container.querySelectorAll('.pagination-container').length
			).toBe(1);
		});
	});

	test('should render a `.search-results`', async () => {
		const { container } = render(<SearchResults hits={fakeHits} />);
		await waitFor(() => {
			expect(container.querySelectorAll('.search-results').length).toBe(
				1
			);
		});
	});
});
