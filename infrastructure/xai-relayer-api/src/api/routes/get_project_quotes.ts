import { app } from "@/app";
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
 *               $ref: '#/components/schemas/TokenSaleInfo'
 *       '500':
 *         $ref: '#/components/responses/APIError'
 */

//TODO swagger docs return types !

app.get('/quota/:projectId', (req: Request, res: Response) => {
    return res.status(200).send({
        message: "Not Implemented",
        projectId: req.params.projectId
    });
});