export const corsConfig = {
  origin: ['http://localhost:3000', 'http://localhost:5050'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
