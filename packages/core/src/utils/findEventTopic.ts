import {ethers} from "ethers";

export function findEventTopic(abi: any, eventName: string): string {
	const event = abi.find((abiItem: any) => abiItem.name === eventName && abiItem.type === "event");

	// Construct the function signature
	let functionSignature = `${event.name}(`;

	function composeType(input: any): string {
		if (input.type !== "tuple") {
			return input.type;
		}

		const componentRes = input.components.map(composeType);
		return `(${componentRes.join(",")})`;
	}

	// Iterate through the input parameters
	const f: string[] = event.inputs.map(composeType);
	functionSignature += f.join(",");
	functionSignature += ')';

	return ethers.id(functionSignature);
}