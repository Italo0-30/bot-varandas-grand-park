
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do servidor
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Armazenamento temporário das conversas
const conversas = new Map();

// Menu principal
const assuntos = {
  "1": "Reservas de espaços",
  "2": "Financeiro e boletos",
  "3": "Reclamações e ocorrências",
  "4": "Manutenção e agendamento de vistoria",
  "5": "Problemas com interfone",
  "6": "Outros assuntos"
};

function menu() {
  return (
    "📋 *MENU DE ATENDIMENTO*\n\n" +
    "Selecione a opção desejada:\n\n" +
    Object.entries(assuntos)
      .map(([numero, assunto]) => `${numero} - ${assunto}`)
      .join("\n")
  );
}

// Processamento das mensagens
function responder(id, mensagem) {
  let conversa = conversas.get(id);

  mensagem = String(mensagem ?? "").trim();

  // Primeiro contato
  if (!conversa) {
    conversas.set(id, { etapa: "nome" });

    return (
      "🏢 *CONDOMÍNIO VARANDAS GRAND PARK*\n\n" +
      "Olá! Seja bem-vindo(a) ao nosso canal de atendimento.\n\n" +
      "Para melhor atendê-lo(a), solicitamos " +
      "algumas informações.\n\n" +
      "Por gentileza, informe seu *nome completo*."
    );
  }

  // Atendimento humano ou finalizado
  if (
    conversa.etapa === "humano" ||
    conversa.etapa === "finalizado"
  ) {
    return null;
  }

  // Nome completo
  if (conversa.etapa === "nome") {
    if (mensagem.split(/\s+/).length < 2) {
      return "Por gentileza, informe seu nome completo.";
    }

    conversa.nome = mensagem;
    conversa.etapa = "torre";

    return (
      `Obrigado(a), ${mensagem}!\n\n` +
      "Agora, informe o nome da sua *torre*."
    );
  }

  // Torre
  if (conversa.etapa === "torre") {
    if (!mensagem) {
      return "Por gentileza, informe sua torre.";
    }

    conversa.torre = mensagem;
    conversa.etapa = "apartamento";

    return "Informe o número do seu *apartamento*.";
  }

  // Apartamento
  if (conversa.etapa === "apartamento") {
    if (!/^\d{1,5}$/.test(mensagem)) {
      return "Informe um número de apartamento válido.";
    }

    conversa.apartamento = mensagem;
    conversa.etapa = "assunto";

    return menu();
  }

  // Menu principal
  if (conversa.etapa === "assunto") {
    if (!assuntos[mensagem]) {
      return "Opção inválida.\n\n" + menu();
    }

    conversa.assunto = assuntos[mensagem];

    console.log("Atendimento identificado:", conversa);

    switch (mensagem) {

      // 1 - Reservas
      case "1":
        conversa.etapa = "reservas";

        return (
          "📅 *RESERVAS DE ESPAÇOS*\n\n" +
          "Prezado(a) morador(a),\n\n" +
          "Informamos que o agendamento de reservas " +
          "dos espaços comuns deve ser realizado " +
          "pelo aplicativo oficial *BR Condomínio*.\n\n" +
          "Você possui acesso ao aplicativo?\n\n" +
          "1 - Sim, possuo acesso\n" +
          "2 - Não possuo acesso"
        );

      // 2 - Financeiro
      case "2":
        conversa.etapa = "humano";

        return (
          "💳 *FINANCEIRO E BOLETOS*\n\n" +
          "Sua solicitação será encaminhada " +
          "ao setor administrativo.\n\n" +
          "Por gentileza, aguarde. Um atendente " +
          "dará continuidade ao seu atendimento."
        );

      // 3 - Reclamações
      case "3":
        conversa.etapa = "finalizado";

        return (
          "📢 *RECLAMAÇÕES E OCORRÊNCIAS*\n\n" +
          "Prezado(a) morador(a),\n\n" +
          "Informamos que reclamações e registros " +
          "de ocorrências devem ser realizados " +
          "diretamente pelo aplicativo oficial " +
          "*BR Condomínio*.\n\n" +
          "Esse procedimento permite o registro " +
          "e acompanhamento adequado das solicitações.\n\n" +
          "Agradecemos a compreensão."
        );

      // 4 - Manutenção e vistorias
      case "4":
        conversa.etapa = "finalizado";

        return (
          "🔧 *MANUTENÇÃO E VISTORIAS*\n\n" +
          "Prezado(a) morador(a),\n\n" +
          "Para solicitações de manutenção ou " +
          "agendamento de vistoria em sua unidade, " +
          "orientamos que entre em contato diretamente " +
          "com a *gerência do condomínio*.\n\n" +
          "Agradecemos o contato."
        );

      // 5 - Interfone
      case "5":
        conversa.etapa = "finalizado";

        return (
          "📞 *MANUTENÇÃO DE INTERFONE*\n\n" +
          "Prezado(a) morador(a),\n\n" +
          "Informamos que o atendimento para manutenção " +
          "de interfones ocorre às *terças e quintas-feiras*, " +
          "no período da *manhã*.\n\n" +
          "Para mais informações, entre em contato " +
          "com a administração.\n\n" +
          "Agradecemos a compreensão."
        );

      // 6 - Outros assuntos
      case "6":
        conversa.etapa = "humano";

        return (
          "👨‍💼 *ATENDIMENTO ADMINISTRATIVO*\n\n" +
          "Sua solicitação será direcionada " +
          "à administração do condomínio.\n\n" +
          "Por gentileza, aguarde o atendimento " +
          "de um funcionário."
        );
    }
  }

  // Submenu de reservas
  if (conversa.etapa === "reservas") {
    if (mensagem === "1") {
      conversa.etapa = "finalizado";

      return (
        "✅ *RESERVAS DE ESPAÇOS*\n\n" +
        "Perfeito! Realize sua solicitação de reserva " +
        "diretamente pelo aplicativo oficial " +
        "*BR Condomínio*.\n\n" +
        "Agradecemos o contato!"
      );
    }

    if (mensagem === "2") {
      conversa.etapa = "acesso_app";

      return (
        "📲 *COMO ACESSAR O BR CONDOMÍNIO*\n\n" +
        "Para acessar o aplicativo, siga as orientações:\n\n" +
        "1. Baixe o aplicativo *BR Condomínio* " +
        "no seu celular.\n\n" +
        "2. Abra o aplicativo e inicie o processo " +
        "de acesso.\n\n" +
        "3. Utilize o *mesmo endereço de e-mail " +
        "informado à administração no preenchimento " +
        "da sua ficha cadastral*.\n\n" +
        "4. Siga as instruções apresentadas pelo " +
        "aplicativo para concluir o acesso.\n\n" +
        "Você conseguiu acessar o aplicativo?\n\n" +
        "1 - Sim, consegui acessar\n" +
        "2 - Não, preciso de ajuda"
      );
    }

    return (
      "Opção inválida.\n\n" +
      "1 - Sim, possuo acesso\n" +
      "2 - Não possuo acesso"
    );
  }

  // Ajuda para acessar o aplicativo
  if (conversa.etapa === "acesso_app") {
    if (mensagem === "1") {
      conversa.etapa = "finalizado";

      return (
        "✅ *ACESSO REALIZADO*\n\n" +
        "Ótimo! Agora você pode realizar o agendamento " +
        "de reservas diretamente pelo aplicativo " +
        "*BR Condomínio*.\n\n" +
        "Agradecemos o contato!"
      );
    }

    if (mensagem === "2") {
      conversa.etapa = "humano";

      console.log("Suporte de acesso solicitado:", {
        nome: conversa.nome,
        torre: conversa.torre,
        apartamento: conversa.apartamento,
        assunto: conversa.assunto
      });

      return (
        "👨‍💼 *ATENDIMENTO ADMINISTRATIVO*\n\n" +
        "Entendido! Sua solicitação será direcionada " +
        "à administração para auxiliar com o acesso " +
        "ao aplicativo *BR Condomínio*.\n\n" +
        "Por gentileza, aguarde o atendimento " +
        "de um funcionário."
      );
    }

    return (
      "Opção inválida.\n\n" +
      "1 - Sim, consegui acessar\n" +
      "2 - Não, preciso de ajuda"
    );
  }

  return null;
}

// API de mensagens
app.post("/mensagem", (req, res) => {
  const { id, mensagem } = req.body;

  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({
      erro: "Identificador de conversa inválido."
    });
  }

  const resposta = responder(id, mensagem);

  res.json({
    resposta,
    etapa: conversas.get(id)?.etapa
  });
});

// Reiniciar conversa de teste
app.post("/reiniciar", (req, res) => {
  const { id } = req.body;

  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({
      erro: "Identificador de conversa inválido."
    });
  }

  conversas.delete(id);

  res.json({
    mensagem: "Conversa reiniciada com sucesso."
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log("==================================");
  console.log("BOT VARANDAS GRAND PARK INICIADO!");
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log("==================================");
});
