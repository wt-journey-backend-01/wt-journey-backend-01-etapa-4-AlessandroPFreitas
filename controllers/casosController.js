const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");


async function getAllCasos(req, res) {
  try {
    const { agente_id, status, q } = req.query;
    let casos = await casosRepository.findAll();
    if (agente_id) {
      const agente = await agentesRepository.findId(agente_id);
      if (!agente) {
        return res.status(404).json({
          status: 404,
          message: "Parametros inválidos",
          errors: {
            agente_id: "O agente não existe!",
          },
        });
      }
      casos = casos.filter((caso) => String(caso.agente_id) === String(agente_id));
    }

    if (status) {
      if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json({
          status: 400,
          message: "Parâmetros inválidos",
          errors: {
            status: "O campo 'status' deve ser 'aberto' ou 'solucionado'",
          },
        });
      }
      casos = casos.filter((caso) => caso.status === status);
      if (casos.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Nenhum caso encontrado",
          errors: {
            status: `Nenhum caso encontrado com status '${status}'`,
          },
        });
      }
    }

    if (q) {
      const termo = q.trim().toLowerCase();

      if (termo.length < 2) {
        return res.status(400).json({
          status: 400,
          message: "Parâmetros inválidos",
          errors: {
            q: "O termo de busca deve ter pelo menos 2 caracteres!"
          },
        });
      }

      casos = casos.filter(
        (caso) =>
          caso.titulo.toLowerCase().includes(termo) ||
          caso.descricao.toLowerCase().includes(termo)
      );
    }

    res.status(200).json(casos);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

async function getCasoId(req, res) {
  try {
    const id = req.params.id;
    const caso = await casosRepository.findById(id);
    if (!caso) {
      return res.status(404).json({
        status: 404,
        message: "Caso não encontrado",
      });
    }

  res.status(200).json(caso);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

async function postCaso(req, res) {
  try {
    const { titulo, descricao, status, agente_id } = req.body;
    const errors = {};

    if (!titulo) errors.titulo = "O campo 'titulo' é obrigatório";
    if (!descricao) errors.descricao = "O campo 'descricao' é obrigatório";
    if (!status) {
      errors.status = "O campo 'status' é obrigatório";
    } else if (status !== "aberto" && status !== "solucionado") {
      errors.status =
        "O campo 'status' pode ser somente 'aberto' ou 'solucionado'";
    }
    if (!agente_id) {
      errors.agente_id = "O campo 'agente_id' é obrigatório";
    } 

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Parâmetros inválidos",
        errors,
      });
    }

    const agente = await agentesRepository.findId(agente_id);
    if (!agente) {
      return res.status(404).json({
        status: 404,
        message: "Agente não encontrado",
      });
    }

    const casoCriado = await casosRepository.newCaso({
      titulo,
      descricao,
      status,
      agente_id,
    });

    res.status(201).json(casoCriado);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

async function putCaso(req, res) {
  try {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;
    const errors = {};

    if (!titulo) errors.titulo = "O campo 'titulo' é obrigatório";
    if (!descricao) errors.descricao = "O campo 'descricao' é obrigatório";
    if (!status) {
      errors.status = "O campo 'status' é obrigatório";
    } else if (status !== "aberto" && status !== "solucionado") {
      errors.status =
        "O campo 'status' pode ser somente 'aberto' ou 'solucionado'";
    }
    if (!agente_id) {
      errors.agente_id = "O campo 'agente_id' é obrigatório";
    } 

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Parâmetros inválidos",
        errors,
      });
    }

    const agente = await agentesRepository.findId(agente_id);
    if (!agente) {
      return res.status(404).json({
        status: 404,
        message: "Agente não encontrado",
      });
    }

    const newCaso = {
      titulo,
      descricao,
      status,
      agente_id,
    };

    const casoAtt = await casosRepository.attCaso(id, newCaso);

    if (!casoAtt) {
      return res.status(404).json({
        status: 404,
        message: "Caso não encontrado",
      });
    }

    res.status(200).json(casoAtt);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}
 
async function patchCaso(req, res) {
  try {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;
    const errors = {};

    if (status && status !== "aberto" && status !== "solucionado") {
      errors.status =
        "O campo 'status' pode ser somente 'aberto' ou 'solucionado'";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Parâmetros inválidos",
        errors,
      });
    }

    if (agente_id) {
      const agente = await agentesRepository.findId(agente_id);
      if (!agente) {
        return res.status(404).json({
          status: 404,
          message: "Agente não encontrado",
        });
      }
    }

    const dadosParaAtualizar = {};

    if (titulo) dadosParaAtualizar.titulo = titulo;
    if (descricao) dadosParaAtualizar.descricao = descricao;
    if (status) dadosParaAtualizar.status = status;
    if (agente_id) dadosParaAtualizar.agente_id = agente_id;

    if (!titulo && !descricao && !status && !agente_id) {
      return res.status(400).json({
        status: 400,
        message: "Pelo menos um campo deve ser fornecido para atualização",
      });
    }

    const casoAtualizado = await casosRepository.partialCaso(id, dadosParaAtualizar);

    if (!casoAtualizado) {
      return res.status(404).json({
        status: 404,
        message: "Caso não encontrado",
      });
    }

    res.status(200).json(casoAtualizado);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor",
    });
  }
}

async function deleteCaso(req, res) {
  try {
    const { id } = req.params;

    const casoDeletado = await casosRepository.removeCaso(id);
    if (!casoDeletado) {
      return res.status(404).json({
        status: 404,
        message: "Caso não encontrado",
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
  getAllCasos,
  getCasoId,
  postCaso,
  putCaso,
  patchCaso,
  deleteCaso,
};
