import Joi from 'joi';

const createInvitationSchema = Joi.object({
  teamId: Joi.number().required(),
  teamName: Joi.string().required(),
  userId: Joi.string().required(),
  role: Joi.string().required(),
});

const updateInvitationSchema = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'declined').required(),
});

export { createInvitationSchema, updateInvitationSchema };
