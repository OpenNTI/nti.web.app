import React from 'react';
import { shallow } from 'enzyme';

import SearchResults from '../Results';
import Hit from '../Hit';
import Pager from '../Pager';

const fakeHits = [
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	},
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	},
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	},
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	},
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	},
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	},
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	},
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	},
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	},
	{
		Class: 'Hit',
		ContainerID: 'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software',
		Containers: ['tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'],
		CreatedTime: '2017-03-31T22:59:00Z',
		Creator: 'landon.sherwood',
		Fragments: [{Class: 'SearchFragment', Field: 'keywords', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}, {Class: 'SearchFragment', Field: 'content', Matches: ['<hit>test</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'},{Class: 'SearchFragment', Field: 'title', Matches: ['<hit>Testing</hit>'], MimeType: 'application/vnd.nextthought.search.searchfragment'}],
		'Last Modified': '2017-03-31T22:59:00Z',
		MimeType: 'application/vnd.nextthought.search.ugdsearchhit',
		NTIID: 'tag:nextthought.com,2011-10:landon.sherwood-OID-0x020bd6:5573657273:azApdWJY3PP',
		Score: 36.81021,
		TargetMimeType: 'application/vnd.nextthought.note'
	}
];

const mockService = () => ({
	getObject: (o) => Promise.resolve(o)
});

const onBefore = () => {
	global.$AppConfig = {
		...(global.$AppConfig || {}),
		nodeService: mockService(),
		nodeInterface: {
			getServiceDocument: () => Promise.resolve(global.$AppConfig.nodeService)
		}
	};
};

const onAfter = () => {
	//unmock getService()
	const {$AppConfig} = global;
	delete $AppConfig.nodeInterface;
	delete $AppConfig.nodeService;
};

describe('<SearchResults />', () => {

	beforeEach(onBefore);
	afterEach(onAfter);

	it('should render ten <Hit /> components', () => {
		const wrapper = shallow(<SearchResults hits={fakeHits} />);

		setTimeout(function () {
			expect(wrapper.find(Hit).length).toBe(10);
		},500);
	});

	it('should render one <Pager /> component', () => {
		const wrapper = shallow(<SearchResults hits={fakeHits} />);
		setTimeout(function () {
			expect(wrapper.find(Pager).length).toBe(1);
		},500);
	});

	it('should render a `.search-results`', () => {
		const wrapper = shallow(<SearchResults hits={fakeHits} />);
		expect(wrapper.find('.search-results').length).toBe(1);
	});

});
