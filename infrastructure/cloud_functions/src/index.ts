
import { Request, Response } from 'express';

export const health = (_: Request, res: Response) => {
    res.sendStatus(200);
}