import classNames from "classnames";
import {atom, useAtomValue} from "jotai";
import {ActionsRequiredBuyDrawer} from "../home/modals/actions-required/ActionsRequiredBuyDrawer";
import {BuyKeysDrawer} from "../keys/modals/buy-keys/BuyKeysDrawer";
import {ViewKeysDrawer} from "../home/modals/view-keys/ViewKeysDrawer";
import {ActionsRequiredNotAccruingDrawer} from "../home/modals/actions-required/ActionsRequiredNotAccruingDrawer";
import {ExportSentryDrawer} from "../home/modals/ExportSentryDrawer";
import {ImportSentryDrawer} from "../home/modals/ImportSentryDrawer";

export enum DrawerView {
	ActionsRequiredBuy,
	ActionsRequiredNotAccruing,
	BuyKeys,
	ViewKeys,
	ImportSentry,
	ExportSentry,
}

export const drawerStateAtom = atom<DrawerView | null>(null);

export function DrawerManager() {
	const drawerState = useAtomValue(drawerStateAtom);

	return (
		<div
			className={classNames("sticky w-[28rem] min-w-[28rem] h-screen relative z-10 bg-white border border-gray-200 overflow-y-scroll", {
				"hidden": drawerState === null,
			})}
		>
			{drawerState === DrawerView.ActionsRequiredBuy && (
				<ActionsRequiredBuyDrawer/>
			)}

			{drawerState === DrawerView.ActionsRequiredNotAccruing && (
				<ActionsRequiredNotAccruingDrawer/>
			)}

			{drawerState === DrawerView.BuyKeys && (
				<BuyKeysDrawer/>
			)}

			{drawerState === DrawerView.ViewKeys && (
				<ViewKeysDrawer/>
			)}

			{drawerState === DrawerView.ImportSentry && (
				<ImportSentryDrawer/>
			)}

			{drawerState === DrawerView.ExportSentry && (
				<ExportSentryDrawer/>
			)}
		</div>
	);
}
