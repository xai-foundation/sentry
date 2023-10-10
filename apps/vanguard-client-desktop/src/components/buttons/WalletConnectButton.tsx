import {useWeb3Modal} from '@web3modal/react'

interface WalletConnectButtonProps {
	className?: string;
}

export function WalletConnectButton({className}: WalletConnectButtonProps) {
	const {open} = useWeb3Modal()

	return (
		<button
			className={`w-full bg-[#F30919] text-white p-3 uppercase font-semibold mt-2 ${className}`}
			onClick={() => open()}
		>
			Connect Wallet
		</button>
	)
}
