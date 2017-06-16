/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import Fragments from '../Fragments';

const fakeHit = {
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
};
const fakeFragments = [{fragIndex: 1, text: '<hit>test</hit>'},{fragIndex: 2, text: '<hit>Testing</hit>'}];
const navigateToSearchHit = jest.fn();

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

describe('<Fragments />', () => {

	beforeEach(onBefore);
	afterEach(onAfter);

	test ('should render a `.hit-fragments`', () => {
		const wrapper = shallow(<Fragments fragments={fakeFragments} hit={fakeHit} navigateToSearchHit={navigateToSearchHit} />);
		expect(wrapper.find('.hit-fragments').length).toBe(1);
	});

	test ('should render at least one `.hit-fragment`', () => {
		const wrapper = shallow(<Fragments fragments={fakeFragments} hit={fakeHit} navigateToSearchHit={navigateToSearchHit} />);
		expect(wrapper.find('.hit-fragment').length).toBe(2);
	});

	test ('simulates click events on fragments', () => {
		const wrapper = shallow(<Fragments fragments={fakeFragments} hit={fakeHit} navigateToSearchHit={navigateToSearchHit} />);
		// Clicks fragment with key value of 1
		wrapper.find('.hit-fragment').at(1).simulate('click');

		setTimeout(function () {
			expect(navigateToSearchHit).toHaveBeenCalled();
		},500);
	});
});
