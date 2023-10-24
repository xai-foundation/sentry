export function Checkout() {
	const queryString = window.location.search;
	const queryParams = new URLSearchParams(queryString);
	const amount = queryParams.get("amount");

	return (
		<div className="h-screen flex flex-col justify-center items-center">
			{amount && (
				<div>
					<p>Amount from app: {amount}</p>
				</div>
			)}

			<div className="absolute top-0 right-0 flex gap-4">
				<w3m-button/>
			</div>
		</div>
	);
}
