import React from 'react';
import { shallow } from 'enzyme';

import Path from '../Path';

describe('<Path />', () => {

	it('should render a `.hit-path`', () => {
		const wrapper = shallow(<Path />);
		expect(wrapper.find('.hit-path')).to.have.length(1);
	});

	it('should render at least one span tag', () => {
		const wrapper = shallow(<Path />);
		expect(wrapper.contains(<span />)).to.equal(true);
	});
});
