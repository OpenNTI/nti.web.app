import { useCallback } from 'react';

import { scoped } from '@nti/lib-locale';
import { Input, Prompt } from '@nti/web-commons';
import { Button, Icons } from '@nti/web-core';

import { SegmentStore } from '../Store';

const t = scoped('nti-web-site-admin.components.users.segment.editor.Header', {
	save: 'Save',
	discard: 'Cancel',
	delete: 'Delete',
	confirmDelete: {
		title: 'Are you sure?',
		message: 'Segment will not be recoverable.',
	},
});

const Container = styled.div`
	padding: 20px 30px 30px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
`;

const Controls = styled.div`
	display: inline-flex;
	flex-direction: row;
	align-items: center;
	gap: 0.5rem;
`;

const Title = styled(Input.Text)`
	&:global(.nti-text-input) {
		display: block;
		height: auto;
		padding: 0 0.625rem;
		border: none;
		font-size: 2rem;
		box-shadow: 0 1px 0 0 var(--border-grey-light);
	}
`;

export function Header() {
	const { title, setTitle, save, discard, destroy, hasChanges } =
		SegmentStore.useProperties();

	const doDestroy = useCallback(async () => {
		try {
			await Prompt.areYouSure(
				t('confirmDelete.message'),
				t('confirmDelete.title')
			);

			destroy();
		} catch (e) {
			//swallow
		}
	}, [destroy]);

	return (
		<Container>
			<Title value={title} onChange={setTitle} />
			<Controls>
				{hasChanges ? (
					<Button rounded transparent secondary onClick={discard}>
						{t('discard')}
					</Button>
				) : (
					<Button rounded destructive inverted onClick={doDestroy}>
						<Icons.TrashCan fill />
						<span>{t('delete')}</span>
					</Button>
				)}
				<Button rounded onClick={save} busy={save.running}>
					{t('save')}
				</Button>
			</Controls>
		</Container>
	);
}
