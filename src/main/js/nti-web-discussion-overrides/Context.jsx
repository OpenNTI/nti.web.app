import React from 'react';
import PropTypes from 'prop-types';
import {Layouts} from '@nti/web-commons';

import BaseModel from 'legacy/model/Base';
import ContainerContext from 'legacy/app/context/ContainerContext';

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
			doNavigtate: () => {}
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
		<div className="note-window">
			<Layouts.Uncontrolled className="note main-view" onMount={onMount} onUnmount={onUnmount} />
		</div>
	);
}