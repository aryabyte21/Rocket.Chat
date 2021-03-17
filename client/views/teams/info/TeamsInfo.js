import React, { useMemo } from 'react';
import { Box, Button, Callout, Option, Menu } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';

import { useTranslation } from '../../../contexts/TranslationContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import VerticalBar from '../../../components/VerticalBar';
import InfoPanel, { RetentionPolicyCallout } from '../../InfoPanel';
import RoomAvatar from '../../../components/avatar/RoomAvatar';
import { useActionSpread } from '../../hooks/useActionSpread';
import { useRoute } from '../../../contexts/RouterContext';
// import { useUserRoom } from '../../../contexts/UserContext';
// import { useMethod } from '../../../contexts/ServerContext';
// import DeleteChannelWarning from '../../../components/DeleteChannelWarning';
import { useSetModal } from '../../../contexts/ModalContext';
import { useSetting } from '../../../contexts/SettingsContext';
// import { useRoute } from '../../../contexts/RouterContext';
// import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
// import { roomTypes, UiTextContext } from '../../../../app/utils';
// import { RoomManager } from '../../../../app/ui-utils/client/lib/RoomManager';
import { usePermission } from '../../../contexts/AuthorizationContext';
// import WarningModal from '../../admin/apps/WarningModal';
import MarkdownText from '../../../components/MarkdownText';
import { useTabBarClose } from '../../room/providers/ToolboxProvider';
// import { useEndpointActionExperimental } from '../../../hooks/useEndpointAction';
import DeleteTeamModal from './Delete';

const retentionPolicyMaxAge = {
	c: 'RetentionPolicy_MaxAge_Channels',
	p: 'RetentionPolicy_MaxAge_Groups',
	d: 'RetentionPolicy_MaxAge_DMs',
};

const retentionPolicyAppliesTo = {
	c: 'RetentionPolicy_AppliesToChannels',
	p: 'RetentionPolicy_AppliesToGroups',
	d: 'RetentionPolicy_AppliesToDMs',
};

export const TeamsInfo = ({
	name,
	fname,
	description,
	archived,
	broadcast,
	announcement,
	topic,
	type,
	rid,
	icon,
	retentionPolicy = {},
	onClickHide,
	onClickClose,
	onClickLeave,
	onClickEdit,
	onClickDelete,
}) => {
	const t = useTranslation();

	console.log('TeamsInfo visual', {
		name,
		fname,
		description,
		archived,
		broadcast,
		announcement,
		topic,
		type,
		rid,
		icon,
	});

	const {
		retentionPolicyEnabled,
		filesOnlyDefault,
		excludePinnedDefault,
		maxAgeDefault,
	} = retentionPolicy;

	const memoizedActions = useMemo(() => ({
		...onClickEdit && { edit: {
			label: t('Edit'),
			icon: 'edit',
			action: onClickEdit,
		} },
		...onClickDelete && { delete: {
			label: t('Delete'),
			icon: 'trash',
			action: onClickDelete,
		} },
		...onClickHide && { hide: {
			label: t('Hide'),
			action: onClickHide,
			icon: 'eye-off',
		} },
		...onClickLeave && { leave: {
			label: t('Leave'),
			action: onClickLeave,
			icon: 'sign-out',
		} },
	}), [t, onClickHide, onClickLeave, onClickEdit, onClickDelete]);

	const { actions: actionsDefinition, menu: menuOptions } = useActionSpread(memoizedActions);

	const menu = useMemo(() => {
		if (!menuOptions) {
			return null;
		}

		return <Menu
			small={false}
			flexShrink={0}
			mi='x2'
			key='menu'
			ghost={false}
			renderItem={({ label: { label, icon }, ...props }) => <Option {...props} label={label} icon={icon} />}
			options={menuOptions}
		/>;
	}, [menuOptions]);

	const actions = useMemo(() => {
		const mapAction = ([key, { label, icon, action }]) =>
			<InfoPanel.Action key={key} label={label} onClick={action} icon={icon}/>;

		return [...actionsDefinition.map(mapAction), menu].filter(Boolean);
	}, [actionsDefinition, menu]);

	return (
		<>
			<VerticalBar.Header>
				<VerticalBar.Icon name='info-circled'/>
				<VerticalBar.Text>{t('Teams_Info')}</VerticalBar.Text>
				{ onClickClose && <VerticalBar.Close onClick={onClickClose} /> }
			</VerticalBar.Header>

			<VerticalBar.ScrollableContent p='x24'>
				<InfoPanel flexGrow={1}>

					<InfoPanel.Avatar>
						<RoomAvatar size={'x332'} room={{ _id: rid, type, t: type } } />
					</InfoPanel.Avatar>

					<InfoPanel.ActionGroup>
						{actions}
					</InfoPanel.ActionGroup>

					<InfoPanel.Section>
						{ archived && <Box mb='x16'>
							<Callout type='warning'>
								{t('Room_archived')}
							</Callout>
						</Box>}
					</InfoPanel.Section>

					<InfoPanel.Section>
						<InfoPanel.Title title={fname || name} icon={icon} />
					</InfoPanel.Section>

					<InfoPanel.Section>
						{broadcast && broadcast !== '' && <InfoPanel.Field>
							<InfoPanel.Label><b>{t('Broadcast_channel')}</b> {t('Broadcast_channel_Description')}</InfoPanel.Label>
						</InfoPanel.Field>}

						{description && description !== '' && <InfoPanel.Field>
							<InfoPanel.Label>{t('Description')}</InfoPanel.Label>
							<InfoPanel.Text withTruncatedText={false}>{description}</InfoPanel.Text>
						</InfoPanel.Field>}

						{announcement && announcement !== '' && <InfoPanel.Field>
							<InfoPanel.Label>{t('Announcement')}</InfoPanel.Label>
							<InfoPanel.Text withTruncatedText={false}>{announcement}</InfoPanel.Text>
						</InfoPanel.Field>}

						{topic && topic !== '' && <InfoPanel.Field>
							<InfoPanel.Label>{t('Topic')}</InfoPanel.Label>
							<InfoPanel.Text withTruncatedText={false}>{topic}</InfoPanel.Text>
						</InfoPanel.Field>}

						<InfoPanel.Field>
							<InfoPanel.Label>{t('Teams_channels')}</InfoPanel.Label>
							<InfoPanel.Text>
								<Button small>{t('View_channels')}</Button>
							</InfoPanel.Text>
						</InfoPanel.Field>

						{retentionPolicyEnabled && (
							<RetentionPolicyCallout filesOnlyDefault={filesOnlyDefault} excludePinnedDefault={excludePinnedDefault} maxAgeDefault={maxAgeDefault} />
						)}
					</InfoPanel.Section>

				</InfoPanel>
			</VerticalBar.ScrollableContent>
		</>
	);
};

export default ({
	room,
	openEditing,
}) => {
	const onClickClose = useTabBarClose();
	// const t = useTranslation();

	// const room = useUserRoom(rid);
	console.log('teams info default', room);
	room.type = room.t;
	room.rid = room._id;
	const { /* type, fname, */ broadcast, archived /* , joined = true */ } = room; // TODO implement joined

	const retentionPolicyEnabled = useSetting('RetentionPolicy_Enabled');
	const retentionPolicy = {
		retentionPolicyEnabled,
		maxAgeDefault: useSetting(retentionPolicyMaxAge[room.t]) || 30,
		retentionEnabledDefault: useSetting(retentionPolicyAppliesTo[room.t]),
		excludePinnedDefault: useSetting('RetentionPolicy_DoNotPrunePinned'),
		filesOnlyDefault: useSetting('RetentionPolicy_FilesOnly'),
	};

	const dispatchToastMessage = useToastMessageDispatch();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	// const canDeleteTeam = useEndpointActionExperimental('POST', 'teams.delete');
	// const leaveTeam = useEndpointActionExperimental('POST', 'teams.leave');
	// const hideTeam = useMethod('hideRoom');

	const router = useRoute('home');

	const canDelete = usePermission('delete-team', room._id);
	const canEdit = usePermission('edit-team', room._id);

	// const canLeave = usePermission('leave-team') && room.cl !== false && joined;

	// mutalble callback open modal
	const onClickDelete = useMutableCallback(() => {
		const onConfirm = async () => {
			try {
				// await deleteRoom(rid);
				router.push({});
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
			}
			closeModal();
		};

		setModal(<DeleteTeamModal onConfirm={onConfirm} onCancel={closeModal} />);
	});

	// const handleLeave = useMutableCallback(() => {
	// 	const leave = async () => {
	// 		try {
	// 			await leaveRoom(rid);
	// 			router.push({});
	// 			RoomManager.close(rid);
	// 		} catch (error) {
	// 			dispatchToastMessage({ type: 'error', message: error });
	// 		}
	// 		closeModal();
	// 	};

	// 	const warnText = roomTypes.getConfig(type).getUiText(UiTextContext.LEAVE_WARNING);

	// 	setModal(<WarningModal
	// 		text={t(warnText, fname)}
	// 		confirmText={t('Leave_room')}
	// 		close={closeModal}
	// 		cancel={closeModal}
	// 		cancelText={t('Cancel')}
	// 		confirm={leave}
	// 	/>);
	// });

	// const handleHide = useMutableCallback(async () => {
	// 	const hide = async () => {
	// 		try {
	// 			await hideRoom(rid);
	// 			router.push({});
	// 		} catch (error) {
	// 			dispatchToastMessage({ type: 'error', message: error });
	// 		}
	// 		closeModal();
	// 	};

	// 	const warnText = roomTypes.getConfig(type).getUiText(UiTextContext.HIDE_WARNING);

	// 	setModal(<WarningModal
	// 		text={t(warnText, fname)}
	// 		confirmText={t('Yes_hide_it')}
	// 		close={closeModal}
	// 		cancel={closeModal}
	// 		cancelText={t('Cancel')}
	// 		confirm={hide}
	// 	/>);
	// });

	return (
		<TeamsInfo
			archived={archived}
			broadcast={broadcast}
			icon={'team'}
			retentionPolicy={retentionPolicyEnabled && retentionPolicy}
			onClickEdit={canEdit && openEditing}
			onClickClose={onClickClose}
			onClickDelete={canDelete && onClickDelete}
			// onClickLeave={canLeave && handleLeave}
			// onClickHide={joined && handleHide}
			{...room}
			announcement={room.announcement && <MarkdownText content={room.announcement}/>}
			description={room.description && <MarkdownText content={room.description}/>}
			topic={room.topic && <MarkdownText content={room.topic}/>}
		/>
	);
};
