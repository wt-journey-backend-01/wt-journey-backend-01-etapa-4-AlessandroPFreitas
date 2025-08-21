const usuariosRepository = require("../repositories/usuariosRepository");
function validarSenha(senha) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(senha);
}

async function register(req, res) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email) {
      return res.status(400).json({
        status: 400,
        message: "Parâmetros inválidos",
      });
    }
    const emailExistente = usuariosRepository.buscarPorEmail(email);

    if (emailExistente) {
      return res.status(400).json({
        status: 400,
        message: "O email está em uso!",
      });
    }

    if (!senha || !validarSenha(senha)) {
      return res.status(400).json({
        status: 400,
        message:
          "A senha não atende aos requisitos de segurança. Ela deve ter pelo menos 8 caracteres, incluindo uma letra minúscula, uma maiúscula, um número e um caractere especial.",
      });
    }


    const usuario = {
        nome,
        email,
        senha
    }

    const novoUsuario = usuariosRepository.newUsuario(usuario);

    return res.status(200).json({
        status: 200,
        message: "Usuario criado com sucesso",
        novoUsuario
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor.",
    });
  }
}

module.exports = {};
