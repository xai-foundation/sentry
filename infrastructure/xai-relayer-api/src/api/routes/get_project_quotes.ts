import { app } from "@/app";
import { Quota } from "@/models/types/Quota";
import { getProjectQuota } from "@/services/quota/getProjectQuota";
import { Request, Response } from "express";

/**
 * @swagger
 * /quota/{projectId}:
 *   get:
 *     description: Get the current quota for a project
 *     operationId: getProjectQuota
 *     tags:
 *       - Quota
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
 *               $ref: '#/components/schemas/Quota'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */

//TODO swagger docs return types !

app.get('/quota/:projectId', async (req: Request, res: Response<Quota>) => {
    const projectId = req.params.projectId;

    if (!projectId || !projectId.length) {
        throw new Error("Invalid projectId")
    }

    const quota = await getProjectQuota(projectId);
    return res.status(200).send(quota);
});