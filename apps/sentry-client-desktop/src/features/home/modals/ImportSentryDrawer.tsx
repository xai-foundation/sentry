import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../drawer/DrawerManager.js";
import {useOperator} from "../../operator";
import {ChangeEvent} from "react";
import {BiLoaderAlt} from "react-icons/bi";
import {ImportSentryAlertModal} from "@/features/home/modals/ImportSentryAlertModal";
import {verifyPrivateKey} from "@sentry/core";
import {WarningIcon} from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";

import React, { useState } from "react";
import { CiSearch } from "react-icons/ci";
import BaseCallout from "@sentry/ui/dist/src/rebrand/callout/BaseCallout";
import {PrimaryButton} from "@sentry/ui";
import {AiOutlineClose} from "react-icons/ai";

export enum InputSizes {
	md = "md",
	lg = "lg"
}

//todo remove temporary item and change it to Input from UI folder
// when we stabilize the colors and synchronize all components between projects

interface TemporaryInput {
	placeholder: string,
	placeholderColor?: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
	value: string,
	label?: string,
	labelText?: string,
	name?: string,
	type?: "text" | "number" | "url",
	size?: InputSizes;
	withIcon?: boolean,
	disabled?: boolean,
	endContent?: React.ReactNode
	isInvalid?: boolean,
	widthProperties?: {
		//for now, we need this because we want to do calculations because of specific border implementation,
		// maybe we can improve this approach in future
		inputWrapper?: number;
	},
	inputMaxWidth?: string,
	onClick?: () => void,
}

const TemporaryInput = ({
							name,
							placeholder,
							placeholderColor = "placeholder-americanSilver",
							onChange,
							value,
							label,
							labelText,
							size = InputSizes.md,
							type = "text",
							withIcon,
							disabled,
							endContent,
							isInvalid = false,
							widthProperties,
							inputMaxWidth,
							onClick,
						}: TemporaryInput) => {
	const inputHeight = size === InputSizes.md ? "h-[40px]" : "h-[48px]";
	const borderHeight = size === InputSizes.md ? "h-[38px]" : "h-[46px]";
	const [isFocused, setIsFocused] = useState(false);
	return (
		<div className={`flex flex-col max-w-[${widthProperties?.inputWrapper}px] w-full`}>
			{label && <span className="text-lg text-americanSilver font-bold mb-[8px]">{label}</span>}
			{labelText && <span className="text-lg text-americanSilver font-medium mb-[8px]">{labelText}</span>}
			<div
				className={`flex w-full group ${inputHeight} px-[12px] justify-center items-center relative cursor-text max-w-[${widthProperties?.inputWrapper}px]`}>
				<span
					className={`global-input-clip-path w-full max-w-[calc(100%-2px)] bg-nulnOil ${borderHeight} absolute z-10 ${isFocused && "bg-nulnOil"}`}></span>
				<span
					className={`global-input-clip-path max-w-[${widthProperties?.inputWrapper}px] bg-foggyLondon ${isInvalid && "!bg-bananaBoat"} ${isFocused && !isInvalid && "bg-pelati"} ${!disabled && "group-hover:bg-pelati"} ${disabled && "!bg-chromaphobicBlack"} w-full ${inputHeight} absolute z-[5]`}>
      </span>
				{withIcon &&
					<button className="z-20" onClick={onClick}><CiSearch className="mr-2 text-dugong size-[20px]" /></button>}
				<input
					type={type}
					name={name}
					placeholder={placeholder}
					onFocus={() => setIsFocused(prev => !prev)}
					onBlur={() => setIsFocused(prev => !prev)}
					onChange={onChange}
					value={value}
					disabled={disabled}
					className={`${inputHeight} w-full bg-transparent group z-20 ${disabled ? "text-darkRoom" : "text-americanSilver"} ${disabled ? "placeholder-darkRoom" : `${placeholderColor}`} focus:outline-0 ${inputMaxWidth && `${inputMaxWidth}`} base-input`} />
				{endContent && endContent}
			</div>
		</div>
	);
};


export function ImportSentryDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {isLoading, importPrivateKey} = useOperator();
	const [inputValue, setInputValue] = useState('');
	const [showModal, setShowModal] = useState<boolean>(false);
	const [privateKeyError, setPrivateKeyError] = useState({
		message: "",
		error: false,
	});

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);

		if (inputValue === "") {
			setPrivateKeyError({
				message: "",
				error: false,
			});
		}
	};

	const handleButton = () => {
		const validPrivateKey = verifyPrivateKey(inputValue);

		if (!validPrivateKey) {
			setInputValue("");
			setPrivateKeyError({
				message: "Private key not valid",
				error: true,
			});
		}

		if (inputValue !== "" && validPrivateKey) {
			setShowModal(true);
		}
	}

	const handleSetData = () => {
		importPrivateKey(inputValue).then(() => {
			window.location.reload();
		});
	};

	return (
		<div>
			{showModal && (
				<ImportSentryAlertModal
					setShowModal={setShowModal}
					onSuccess={handleSetData}
				/>
			)}
			<div className="h-full flex flex-col justify-start items-center text-white">
				<div
					className="w-full flex flex-row justify-between items-center border-b border-chromaphobicBlack text-2xl font-bold px-8 py-[24px]">

					<div className="flex flex-row gap-2 items-center">
						<span>Import Sentry Wallet</span>
					</div>
					<span
						onClick={() => {
							setDrawerState(null)
						}}
						className="cursor-pointer"
					>
							<AiOutlineClose size={20} color="white" className="hover:!text-hornetSting duration-300 ease-in" />
						</span>
				</div>

				{isLoading ? (
					<div
						className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
						<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
						<span className="text-lg">Importing Sentry Wallet...</span>
					</div>

				) : (
					<div className="w-full flex flex-col gap-8">
						<div className="flex flex-col gap-2 px-6 pt-6">
							<p className="text-lg font-medium text-americanSilver">
								By importing a Sentry Wallet, you can continue running your node without the need to
								leave your local machine on.
							</p>

							<p className="text-lg font-medium text-americanSilver mt-4">
								Enter the the private key of the Sentry Wallet you would like to import
							</p>

							<div className="w-full h-full flex flex-col justify-center items-center">
								<TemporaryInput
									type="text"
									value={inputValue}
									onChange={handleInputChange}
									widthProperties={{inputWrapper: 373}}
									size={InputSizes.lg}
									placeholder="Enter private key"
								/>

								<div className="mt-[12px] w-full">
									{privateKeyError.error && (
										<BaseCallout extraClasses={{calloutWrapper: "h-[50px] w-full text-bananaBoat"}} isWarning>
											<WarningIcon /> <span className="text-lg text-medium ml-[10px]">{privateKeyError.message}</span>
										</BaseCallout>
									)}
								</div>

								<PrimaryButton
									onClick={handleButton}
									className="w-full flex justify-center items-center gap-1 !text-xl font-semibold mt-[13px] px-6 py-3 !uppercase"
									btnText={"Confirm import"}/>

							</div>

							<p className="text-lg font-medium text-americanSilver mt-[28px]">
								Want to run a cloud instance?
								<a
									onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup/step-2-download-and-run-the-xai-sentry-node")}
									className="text-[#F30919] ml-1 cursor-pointer font-bold hover:text-white duration-300 ease-in-out"
								>
									Learn more
								</a>
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
