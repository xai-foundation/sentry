import {app} from "@/app";
import {ForwardRequest} from "@/models/types/ForwardRequest";
import {forwardMetaTransaction} from "@/services/forwardMetatransaction";
import {getMinimumRequiredBalance} from "@/services/getMinimumRequiredBalance";
import {getUserQuota} from "@/services/quota/getUserQuota";
import {updateUserQuota} from "@/services/quota/updateUserQuota";
import {validateForwardRequest} from "@/services/validateForwardRequest";
import {NextFunction, Request, Response} from "express";

//TODO make the type work as the request interface
export interface MetaTransactionRequest {
	params: {
		projectId: string;
	};

	body: {
		request: ForwardRequest;
	};
}

/**
 * @swagger
 * /forward/{projectId}:
 *   post:
 *     description: Forward a Transaction to a Relayer
 *     operationId: forwardMetaTransaction
 *     tags:
 *       - ForwardTransaction
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenSaleInfo'
 *       '500':
 *         $ref: '#/components/responses/Error'
 */

app.post("/forward/:projectId", async (req: Request, res: Response<{txHash: string}>) => {
	const projectId = req.params.projectId;
	if (!projectId || !projectId.length) {
		throw new Error("Invalid projectId");
	}

	const forwardRequest: ForwardRequest = req.body;

	if (!forwardRequest) {
		throw new Error("Invalid forward request");
	}

	const validationError = validateForwardRequest(forwardRequest);
	if (validationError !== "") {
		throw new Error(`Invalid request: ${validationError}`);
	}

	const {quota, projectInfo} = await getUserQuota(projectId, forwardRequest.from);

	if (BigInt(quota.balanceWei) < getMinimumRequiredBalance()) {
		throw new Error(`Insufficient balance`);
	}

	const {txHash, txFee} = await forwardMetaTransaction(
		forwardRequest,
		projectInfo.relayerId
	);

	quota.balanceWei = (BigInt(quota.balanceWei) - BigInt(txFee)).toString();

	await updateUserQuota(projectInfo.userProjectId, projectId, forwardRequest.from, quota);

	return res.status(200).send({txHash});
});
