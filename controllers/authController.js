const usuariosRepository = require("../repositories/usuariosRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function validarSenha(senha) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(senha);
}
async function register(req, res) {
  try {
    const { nome, email, senha, ...extras } = req.body;

    if (Object.keys(extras).length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Campos extras não permitidos",
      });
    }

    if (!nome || typeof nome !== "string" || nome.trim() === "") {
      return res.status(400).json({
        status: 400,
        message: "O campo 'nome' é obrigatório e não pode ser vazio",
      });
    }
    if (!email || typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        status: 400,
        message: "O campo 'email' é obrigatório e não pode ser vazio",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 400,
        message: "Formato de email inválido",
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

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed = await bcrypt.hash(senha, salt);

    const usuario = {
      nome: nome.trim(),
      email: email.trim(),
      senha: hashed,
    };

    const [novoUsuario] = await usuariosRepository.newUsuario(usuario);

    return res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
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
        status: 400,
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
      { id: user.id, nome: user.nome, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
     access_token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor.",
    });
  }
}

async function del(req, res) {
  try {
    const { id } = req.params;

    const userDelete = await usuariosRepository.deleteUsuario(id);

    if (!userDelete) {
      return res.status(400).json({
        status: 400,
        message: "Usuario não existe!",
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro interno do servidor.",
    });
  }
}

function logout(req, res) {
  return res.status(200).json({ message: "Logout realizado com sucesso." });
}


module.exports = {
  register,
  login,
  del,
  logout
};
