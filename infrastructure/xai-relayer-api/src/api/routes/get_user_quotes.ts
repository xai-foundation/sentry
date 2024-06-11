import {app} from "@/app";
import {loadMongoose} from "@/loaders/mongoose";
import {Quota} from "@/models/types/Quota";
import {getUserQuota} from "@/services/quota/getUserQuota";
import {Request, Response} from "express";

/**
 * @swagger
 * /quota/{projectId}/{userWallet}:
 *   get:
 *     description: Get the current quota for a user within a project
 *     operationId: getUserQuota
 *     tags:
 *       - Quota
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userWallet
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quota'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */

app.get("/quota/:projectId/:userWallet", async (req: Request, res: Response<Quota>) => {
	const projectId = req.params.projectId;
	const userWallet = req.params.userWallet;

	if (!projectId || !projectId.length) {
		throw new Error("Invalid projectId");
	}
	if (!userWallet || !userWallet.length) {
		throw new Error("Invalid userWallet");
	}
	
    await loadMongoose();

	const {quota} = await getUserQuota(projectId, userWallet);
	return res.status(200).send(quota);
});
