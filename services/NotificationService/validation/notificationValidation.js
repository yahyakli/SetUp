import Joi from 'joi';

const createNotificationSchema = Joi.object({
  title: Joi.string().required().trim(),
  userId: Joi.string().required().trim(),
  type: Joi.string().valid('task_assigned', 'comment_added', 'message_received', 'deadline_approaching', 'system_alert').required(),
  content: Joi.string().required(),
  read: Joi.boolean().default(false)
});

const updateNotificationSchema = Joi.object({
  title: Joi.string().trim(),
  read: Joi.boolean()
});

export {
  createNotificationSchema,
  updateNotificationSchema
};