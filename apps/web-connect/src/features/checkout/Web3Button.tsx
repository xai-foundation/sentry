import {useAccount, useConnect, useDisconnect,} from 'wagmi'

export function Web3Button() {
	const {address, connector, isConnected} = useAccount()
	const {connect, connectors, error} = useConnect()
	const {disconnect} = useDisconnect()

	return (
		<div className="flex flex-col items-end">
			{isConnected ? (
				<>
					<button
						onClick={() => disconnect()}
						className="w-auto h-auto bg-[#F30919] text-white p-4 font-semibold"
					>
						Disconnect Wallet
					</button>

					<div>
						<p>{connector?.name}: {address}</p>
					</div>
				</>

			) : (
				<div>
					{connectors.map((connector) => (
						<button
							disabled={!connector.ready}
							key={connector.id}
							onClick={() => connect({connector})}
							className="w-auto h-auto bg-[#F30919] text-white p-4 font-semibold"
						>
							Connect Wallet
						</button>
					))}

					{error && <div>{error.message}</div>}
				</div>
			)}
		</div>
	)
}
