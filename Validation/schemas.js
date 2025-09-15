import Joi from "joi";


export const customerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string(),
  total_spend: Joi.number().min(0),  
  last_visit_date: Joi.date()        
});


export const orderSchema = Joi.object({
  customer_id: Joi.string().hex().length(24).required(),
  amount: Joi.number().positive().required(),
  status: Joi.string().valid("completed", "cancelled").default("completed"),
});
