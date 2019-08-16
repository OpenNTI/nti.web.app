import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Layouts} from '@nti/web-commons';

import TopicWindow from 'legacy/app/forums/components/topic/Window';
import BaseModel from 'legacy/model/Base';

import Registry from '../Registry';

import Styles from './View.css';

const cx = classnames.bind(Styles);

const handles = (obj) => obj.isTopic;
const {Uncontrolled} = Layouts;

export default
@Registry.register(handles)
class NTIWebCommunityTopic extends React.Component {
	static propTypes = {
		topic: PropTypes.object
	}

	setupTopic = (renderTo) => {
		const {topic} = this.props;
		const topicModel = BaseModel.interfaceToModel(topic);

		this.topicCmp = TopicWindow.create({
			renderTo,
			record: topicModel,
			precache: {},
			onClose: () => {},
			doNavigate: () => {}
		});
	}

	tearDownTopic = () => {

	}


	render () {
		return (
			<Uncontrolled className={cx('topic')} onMount={this.setupTopic} onUnmount={this.tearDownTopic} />
		);
	}
}