const agentesRepository = require("../repositories/agentesRepository");

async function getAllAgentes(req, res) {
  try {
    const { cargo, sort } = req.query;
    let agentes = await agentesRepository.findAll();

    if (cargo) {
      agentes = agentes.filter((agente) => agente.cargo === cargo);

      if (agentes.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Parâmetros inválidos",
          errors: {
            cargo: `Não existe um agente no cargo de ${cargo}`,
          },
        });
      }
    }

    if (sort === "dataDeIncorporacao") {
       agentes = agentes.sort(
        (a, b) =>
          new Date(a.dataDeIncorporacao) - new Date(b.dataDeIncorporacao)
      );
    } else if (sort === "-dataDeIncorporacao") {
      agentes = agentes.sort(
        (a, b) =>
          new Date(b.dataDeIncorporacao) - new Date(a.dataDeIncorporacao)
      );
    }

    res.status(200).json(agentes);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

async function getAgenteId(req, res) {
  try {
    const { id } = req.params;


    const agenteId = await agentesRepository.findId(id);

    if (!agenteId) {
      return res.status(404).json({
        status: 404,
        message: "Agente não encontrado",
      });
    }

    res.status(200).json(agenteId);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

async function postAgente(req, res) {
  try {
    const { nome, dataDeIncorporacao, cargo } = req.body;
    const errors = {};

    if (!nome) errors.nome = "O campo 'nome' é obrigatório";
    if (!dataDeIncorporacao) {
      errors.dataDeIncorporacao = "O campo 'dataDeIncorporacao' é obrigatório";
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dataDeIncorporacao)) {
        errors.dataDeIncorporacao =
          "Campo dataDeIncorporacao deve seguir a formatação 'YYYY-MM-DD'";
      } else {
        // Validar que não é data futura
        const data = new Date(dataDeIncorporacao);
        const hoje = new Date();
        if (data > hoje) {
          errors.dataDeIncorporacao = "A data de incorporação não pode ser no futuro";
        }
      }
    }
    if (!cargo) errors.cargo = "O campo 'cargo' é obrigatório";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Parâmetros inválidos",
        errors,
      });
    }

    const novoAgente = await agentesRepository.createAgente({
      nome,
      dataDeIncorporacao,
      cargo,
    });

    res.status(201).json(novoAgente);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

async function putAgente(req, res) {
  try {
    const { id } = req.params;
    const { nome, dataDeIncorporacao, cargo } = req.body;
    const errors = {};

    if (!nome) errors.nome = "O campo 'nome' é obrigatório";
    if (!dataDeIncorporacao) {
      errors.dataDeIncorporacao = "O campo 'dataDeIncorporacao' é obrigatório";
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dataDeIncorporacao)) {
        errors.dataDeIncorporacao =
          "Campo dataDeIncorporacao deve seguir a formatação 'YYYY-MM-DD'";
      } else {
        // Validar que não é data futura
        const data = new Date(dataDeIncorporacao);
        const hoje = new Date();
        if (data > hoje) {
          errors.dataDeIncorporacao = "A data de incorporação não pode ser no futuro";
        }
      }
    }
    if (!cargo) errors.cargo = "O campo 'cargo' é obrigatório";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Parâmetros inválidos",
        errors,
      });
    }

    const agente = {
      nome,
      dataDeIncorporacao,
      cargo,
    };

    const updateAgente = await agentesRepository.attAgente(id, agente);

    if (!updateAgente) {
      return res.status(404).json({
        status: 404,
        message: "Agente não encontrado",
      });
    }

    res.status(200).json(updateAgente);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

 async function patchAgente(req, res) {
  try {
    const { id } = req.params;
    const { nome, dataDeIncorporacao, cargo } = req.body;
    const errors = {};

    const agente = {};

    if (nome) {
      agente.nome = nome;
    }
    if (dataDeIncorporacao) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dataDeIncorporacao)) {
        errors.dataDeIncorporacao =
          "Campo dataDeIncorporacao deve seguir a formatação 'YYYY-MM-DD'";
      } else {
        // Validar que não é data futura
        const data = new Date(dataDeIncorporacao);
        const hoje = new Date();
        if (data > hoje) {
          errors.dataDeIncorporacao = "A data de incorporação não pode ser no futuro";
        } else {
          agente.dataDeIncorporacao = dataDeIncorporacao;
        }
      }
    }
    if (cargo) {
      agente.cargo = cargo;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Parâmetros inválidos",
        errors,
      });
    }

    if (!nome && !dataDeIncorporacao && !cargo) {
      return res.status(400).json({
        status: 400,
        message: "Pelo menos um campo deve ser fornecido para atualização",
      });
    }

    const attAgente = await agentesRepository.partialAgente(id, agente);

    if (!attAgente) {
      return res.status(404).json({
        status: 404,
        message: "Agente não encontrado",
      });
    }

    res.status(200).json(attAgente);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

async function deleteAgente(req, res) {
  try {
    const { id } = req.params;

    const agente = await agentesRepository.removeAgente(id);
    if (!agente) {
      return res.status(404).json({
        status: 404,
        message: "Agente não encontrado",
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

module.exports = {
  getAllAgentes,
  getAgenteId,
  postAgente,
  putAgente,
  patchAgente,
  deleteAgente,
};
