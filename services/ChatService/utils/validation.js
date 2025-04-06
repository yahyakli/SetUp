import Joi from 'joi';

// Validate Chat Room data
export const validateChatRoom = (data) => {
  const schema = Joi.object({
    type: Joi.string().valid('project', 'direct').required(),
    name: Joi.when('type', {
      is: 'direct',
      then: Joi.optional(),
      otherwise: Joi.string().required()
    }),
    projectId: Joi.when('type', {
      is: 'project',
      then: Joi.number().required(),
      otherwise: Joi.optional()
    }),
    participants: Joi.array().items(Joi.string()).min(1).required(),
    user_id: Joi.string().required()
  });
  
  return schema.validate(data);
};

// Validate Message data
export const validateMessage = (data) => {
  const schema = Joi.object({
    chatRoomId: Joi.string().required(),
    content: Joi.when('contentType', {
      is: 'text',
      then: Joi.string().required().min(1),
      otherwise: Joi.optional()
    }),
    contentType: Joi.string().valid('text', 'file').required(),
    user_id: Joi.string().required(),
    attachment: Joi.object({
      originalName: Joi.string(),
      fileName: Joi.string(),
      path: Joi.string(),
      mimeType: Joi.string(),
      size: Joi.number()
    }).optional()
  });
  
  return schema.validate(data);
};

// Validate query parameters for message retrieval
export const validateMessageQuery = (data) => {
  const schema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    page: Joi.number().integer().min(1).default(1),
    before: Joi.date().iso(),
    after: Joi.date().iso()
  });
  
  return schema.validate(data);
};