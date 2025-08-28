const express = require("express");
const app = express();
const PORT = 3000;
const casosRouter = require("./routes/casosRoutes");
const agentesRouter = require("./routes/agentesRoutes");
const authRoutes = require("./routes/authRoutes")
const swaggerUi = require("swagger-ui-express");
const authMiddleware = require("./middlewares/authMiddleware");
const swaggerDocument = require("./docs/swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use('/agentes', authMiddleware, agentesRouter);
app.use('/casos', authMiddleware, casosRouter);

app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(
    `Servidor do Departamento de Polícia rodando em localhost:${PORT}`
  );
});
