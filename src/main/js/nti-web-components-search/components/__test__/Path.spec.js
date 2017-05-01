import React from 'react';
import { shallow } from 'enzyme';

import Path from '../Path';

const fakePathObject = 	[{label: 'Human Physiology', ntiid: 'tag:nextthought.com,2011-10:system-OID-0x4a73:5573657273:kj79vfPDVYE'},{label:'1.1 How to Study for This Course', ntiid:'tag:nextthought.com,2011-10:NTI-NTICourseOutlineNode-Fall2016_BIOL_2124.1.0'},{label:'Concept Mapping Software', ntiid:'tag:nextthought.com,2011-10:OU-HTML-OU_BIOL2124_F_2016_Human_Physiology.reading:concept_mapping_software'}];


describe('<Path />', () => {

	it('should render a `.hit-path`', () => {
		const wrapper = shallow(<Path pathObject={fakePathObject}/>);
		expect(wrapper.find('.hit-path').length).toBe(1);
	});

	it('should render at least one span tag', () => {
		const wrapper = shallow(<Path pathObject={fakePathObject}/>);
		const hitPath = wrapper.find('.hit-path');
		expect(hitPath.contains(<span key="0">Human Physiology</span>)).toBe(true);
	});
});
