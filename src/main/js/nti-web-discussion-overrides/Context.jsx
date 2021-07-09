import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Layouts } from '@nti/web-commons';
import BaseModel from 'internal/legacy/model/Base';
import ContainerContext from 'internal/legacy/app/context/ContainerContext';
import WindowStore from 'internal/legacy/app/windows/StateStore';

import Styles from './Context.css';

const cx = classnames.bind(Styles);

WebappDiscussion.propTypes = {
	item: PropTypes.object,
};
export default function WebappDiscussion({ item }) {
	const [hasContent, setHasContent] = useState(); // used to hide the container element unless/until there's something to show
	const contextRef = React.useRef(null);

	const onMount = async renderTo => {
		const record = BaseModel.interfaceToModel(item);
		const context = ContainerContext.create({
			container: record.get('ContainerId'),
			range: record.get('applicableRange'),
			contextRecord: record,
			doNavigate: object =>
				WindowStore.getInstance().navigateToObject(object),
		});

		const cmp = await context.load();

		if (cmp) {
			cmp.render(renderTo);
			contextRef.current = cmp;
			setHasContent(true);
		}
	};

	const onUnmount = () => {
		contextRef.current?.destroy?.();
	};

	return (
		<div
			className={cx('note-window', 'discussion-context-override', {
				'no-content': !hasContent,
			})}
		>
			<div className="note main-view">
				<div className="context">
					<Layouts.Uncontrolled
						as="span"
						className="text"
						onMount={onMount}
						onUnmount={onUnmount}
					/>
				</div>
			</div>
		</div>
	);
}
