import { useCallback } from 'react';

import { Input } from '@nti/web-commons';

export function MessageField({ value, onChange, onSubmit }) {
	const onKeyDown = useCallback(
		e => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				onSubmit();
			}
		},
		[onSubmit]
	);

	return (
		<div className="invite-people-message-field">
			<Input.TextArea
				value={value}
				onChange={onChange}
				placeholder="Write a personal message..."
				onKeyDown={onKeyDown}
				css={css`
					border: none;
					box-shadow: none;
					padding: 0.75rem;
					background-color: white;
					height: 20rem;

					textarea {
						height: 100%;
					}
				`}
			/>
		</div>
	);
}
