import Joi from 'joi';

// Task validation schemas
export const createTaskSchema = Joi.object({
  title: Joi.string().max(255).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title cannot exceed 255 characters'
  }),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'completed').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('low'),
  project_id: Joi.number().integer().required().messages({
    'number.base': 'Project ID must be a number',
    'any.required': 'Project ID is required'
  }),
  assignee_id: Joi.string().required().messages({
    'string.empty': 'Assignee ID is required'
  }),
  due_date: Joi.date().iso().allow(null),
  estimated_hours: Joi.number().integer().min(0).allow(null),
  actual_hours: Joi.number().integer().min(0).allow(null),
  label: Joi.string().max(255).allow('', null),
  creator_id: Joi.string().required().messages({
    'string.empty': 'Creator ID is required'
  })
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().max(255).messages({
    'string.max': 'Title cannot exceed 255 characters'
  }),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'completed'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  project_id: Joi.number().integer().messages({
    'number.base': 'Project ID must be a number'
  }),
  assignee_id: Joi.string().required().messages({
    'string.empty': 'Assignee ID is required'
  }),
  due_date: Joi.date().iso().allow(null),
  estimated_hours: Joi.number().integer().min(0).allow(null),
  actual_hours: Joi.number().integer().min(0).allow(null),
  label: Joi.string().max(255).allow('', null)
});

// Comment validation schemas
export const createCommentSchema = Joi.object({
  task_id: Joi.string().required().messages({
    'string.empty': 'Task ID is required'
  }),
  comment: Joi.string().required().messages({
    'string.empty': 'Comment is required'
  }),
  project_id: Joi.number().integer().required().messages({
    'number.base': 'Project ID must be a number',
    'any.required': 'Project ID is required'
  }),
  creator_id: Joi.string().required().messages({
    'string.empty': 'Creator ID is required'
  }),
});

export const updateCommentSchema = Joi.object({
  comment: Joi.string().required().messages({
    'string.empty': 'Comment is required'
  })
});

// Attachment validation schemas - modified to handle file uploads
export const createAttachmentSchema = Joi.object({
  task_id: Joi.string().required().messages({
    'string.empty': 'Task ID is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active')
  // File will be validated separately in the middleware
});

export const updateAttachmentSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive')
  // File will be validated separately in the middleware
});