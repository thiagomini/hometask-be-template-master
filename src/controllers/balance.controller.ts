import { type Express, type RequestHandler } from 'express';

import { conflict, httpError, notFound } from '../errors.js';
import { validateParamId } from '../middleware/validators.js';
export function registerBalanceRoutes(app: Express) {
  app.post('/balances/deposit/:id', validateParamId('Client'), (async (
    req,
    res,
  ) => {
    const { Profile, Job, Contract } = req.app.get('models');
    const { id } = req.params;

    const user = await Profile.findByPk(id);

    if (!user)
      return res.status(404).json(
        notFound({
          detail: `Client with id ${id} not found`,
        }),
      );

    if (user.type !== 'client') {
      return res.status(400).json(
        httpError({
          status: 400,
          title: 'Bad Request',
          detail: 'Only clients can deposit funds',
        }),
      );
    }

    const totalAmountToPay = await Job.sum('price', {
      where: {
        paid: false,
        '$Contract.clientId$': user.id,
        '$Contract.status$': 'in_progress',
      },
      include: {
        model: Contract,
        as: 'Contract',
      },
    });

    const depositAmount = req.body.amount;

    if (depositAmount > totalAmountToPay * 1.25) {
      return res.status(409).json(
        conflict({
          detail:
            'Deposit amount exceeds more than 25% of the client total of jobs to pay',
        }),
      );
    }

    const newBalance = user.balance + depositAmount;

    await user.update({
      balance: newBalance,
    });

    return res.status(200).json({
      newBalance,
    });
  }) as RequestHandler);
}
