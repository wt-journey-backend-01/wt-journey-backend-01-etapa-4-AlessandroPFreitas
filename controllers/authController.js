const usuariosRepository = require("../repositories/usuariosRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    const emailExistente = await usuariosRepository.buscarPorEmail(email);

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
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
    const hashed = await bcrypt.hash(senha, salt);

    const usuario = {
      nome,
      email,
      senha: hashed,
    };

    usuariosRepository.newUsuario(usuario);

    return res.status(200).json({
      status: 200,
      message: "Usuario criado com sucesso",
      usuario,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor.",
    });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    const user = await usuariosRepository.buscarPorEmail(email);
    if (!user) {
      return res.status(400).json({
        status: 200,
        message: "Credenciais inválidas.",
      });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return res.status(400).json({
        status: 400,
        message: "Credenciais inválidas.",
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Login realizado com sucesso!",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor.",
    });
  }
}

module.exports = {
  register,
  login,
};
