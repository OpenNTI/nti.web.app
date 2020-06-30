import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Layouts} from '@nti/web-commons';

import BaseModel from 'legacy/model/Base';
import ContainerContext from 'legacy/app/context/ContainerContext';
import WindowStore from 'legacy/app/windows/StateStore';

import Styles from './Context.css';

const cx = classnames.bind(Styles);

WebappDiscussion.propTypes = {
	item: PropTypes.object
};
export default function WebappDiscussion ({item}) {
	const contextRef = React.useRef(null);

	const onMount = async (renderTo) => {
		const record = BaseModel.interfaceToModel(item);
		const context = ContainerContext.create({
			container: record.get('ContainerId'),
			range: record.get('applicableRange'),
			contextRecord: record,
			doNavigate: (object) => WindowStore.getInstance().navigateToObject(object)
		});

		const cmp = await context.load();

		if (cmp) {
			cmp.render(renderTo);
			contextRef.current = cmp;
		}
	};

	const onUnmount = () => {
		contextRef.current?.destroy?.();
	};

	return (
		<div className={cx('note-window', 'discussion-context-override')}>
			<div className="note main-view">
				<Layouts.Uncontrolled className="context" onMount={onMount} onUnmount={onUnmount} />
			</div>
		</div>
	);
}