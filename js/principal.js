document.addEventListener("DOMContentLoaded", () => {
  const playerNameElement = document.getElementById("playerName");
  const playerJobElement = document.getElementById("playerJob");
  const monthlySalaryElement = document.getElementById("monthlySalary");
  const monthlyExpensesElement = document.getElementById("monthlyExpenses");
  const currentBalanceElement = document.getElementById("currentBalance");
  const nextMonthButton = document.getElementById("nextMonthButton");
  const investButton = document.getElementById("investButton");
  const assetListBody = document.getElementById("assetList");
  const liabilityListBody = document.getElementById("liabilityList");
  const passiveIncomeElement = document.getElementById("passiveIncome");
  const totalExpensesElement = document.getElementById("totalExpenses");
  const exitStatusElement = document.getElementById("exitStatus");
  const marketButton = document.getElementById("marketButton");
  const opportunityLog = document.getElementById("opportunityLog");
  const eventChoicesDiv = document.getElementById("eventChoices");

  let player;
  let job;
  let currentBalance = 0;
  let investments = [];
  let assets = []; // Ativos do mercado (ações, imóveis, etc.)
  let liabilities = [];

  let choiceEventActive = false; // Variável para controlar eventos com escolha

  // --- Definição dos Eventos do Jogo ---
  const gameEvents = [
    {
      id: "bonus-salario",
      type: "positive",
      message: "Bônus de fim de mês! Você recebeu um extra de R$ ",
      effect: () => {
        const bonus = Math.floor(Math.random() * 300) + 100;
        currentBalance += bonus;
        return bonus.toFixed(2);
      },
      appliesTo: "balance",
      hasChoices: false,
    },
    {
      id: "despesa-inesperada",
      type: "negative",
      message: "Despesa inesperada! Você gastou R$ ",
      effect: () => {
        const expense = Math.floor(Math.random() * 200) + 50;
        currentBalance -= expense;
        return expense.toFixed(2);
      },
      appliesTo: "balance",
      hasChoices: false,
    },
    {
      id: "oportunidade-investimento-geral",
      type: "positive",
      message:
        "Oportunidade de investimento! Seus investimentos cresceram um extra de ",
      effect: () => {
        const extraReturn = Math.random() * 0.02 + 0.005;
        let totalInvested = 0;
        investments.forEach((inv) => (totalInvested += inv.amount));
        assets.forEach((asset) => {
          if (
            asset.type === "investimento-direto" ||
            asset.type === "imovel" ||
            asset.type === "acao-mercado"
          ) {
            totalInvested += parseFloat(asset.value);
          }
        });
        const gained = totalInvested * extraReturn;
        currentBalance += gained;
        return (extraReturn * 100).toFixed(2) + "%";
      },
      appliesTo: "investments",
      hasChoices: false,
    },
    {
      id: "mercado-em-baixa-geral",
      type: "negative",
      message: "Mercado em baixa! Seus investimentos caíram ",
      effect: () => {
        const lossRate = Math.random() * 0.01 + 0.005;
        let totalInvested = 0;
        investments.forEach((inv) => (totalInvested += inv.amount));
        assets.forEach((asset) => {
          if (
            asset.type === "investimento-direto" ||
            asset.type === "imovel" ||
            asset.type === "acao-mercado"
          ) {
            totalInvested += parseFloat(asset.value);
          }
        });
        const lost = totalInvested * lossRate;
        currentBalance -= lost;
        return (lossRate * 100).toFixed(2) + "%";
      },
      appliesTo: "investments",
      hasChoices: false,
    },
    {
      id: "presente-familiar",
      type: "positive",
      message: "Presente inesperado de um familiar! Você recebeu R$ ",
      effect: () => {
        const gift = Math.floor(Math.random() * 500) + 150;
        currentBalance += gift;
        return gift.toFixed(2);
      },
      appliesTo: "balance",
      hasChoices: false,
    },

    // --- NOVOS EVENTOS COM ESCOLHAS ---
    {
      id: "oferta-negocio",
      type: "neutral",
      message: "Um amigo oferece uma oportunidade de negócio, mas é arriscada.",
      hasChoices: true,
      choices: [
        {
          text: "Investir R$ 500 (50% de chance de ganhar R$ 1500, 50% de perder R$ 500)",
          effect: () => {
            if (currentBalance < 500) {
              return {
                message: "Você não tem saldo suficiente para esta escolha.",
                type: "negative",
              };
            }
            currentBalance -= 500;
            if (Math.random() < 0.5) {
              currentBalance += 1500;
              return {
                message: "Você arriscou e lucrou R$ 1500! Ótimo negócio!",
                type: "positive",
              };
            } else {
              return {
                message:
                  "A aposta não deu certo e você perdeu R$ 500. Que pena!",
                type: "negative",
              };
            }
          },
          canAfford: () => currentBalance >= 500,
        },
        {
          text: "Recusar a oferta (sem efeito)",
          effect: () => {
            return {
              message:
                "Você recusou a oferta, mantendo sua segurança financeira.",
              type: "neutral",
            };
          },
          canAfford: () => true,
        },
      ],
    },
    {
      id: "problema-saude",
      type: "negative",
      message: "Você sente um desconforto e precisa ir ao médico.",
      hasChoices: true,
      choices: [
        {
          text: "Pagar R$ 100 para uma consulta particular (resultado rápido)",
          effect: () => {
            if (currentBalance < 100) {
              return {
                message: "Você não tem saldo suficiente para esta escolha.",
                type: "negative",
              };
            }
            currentBalance -= 100;
            return {
              message:
                "Você pagou pela consulta particular e se recuperou rapidamente. Menos R$ 100.",
              type: "neutral",
            };
          },
          canAfford: () => currentBalance >= 100,
        },
        {
          text: "Esperar pelo sistema público (sem custo, mas pode piorar)",
          effect: () => {
            if (Math.random() < 0.3) {
              currentBalance -= 300;
              return {
                message:
                  "Você esperou e a situação piorou, custando R$ 300 em medicamentos. Lição aprendida!",
                type: "negative",
              };
            } else {
              return {
                message:
                  "Você esperou e, felizmente, a situação não piorou. Ufa!",
                type: "positive",
              };
            }
          },
          canAfford: () => true,
        },
      ],
    },
    {
      id: "oportunidade-imovel",
      type: "neutral",
      message:
        "Um imóvel com grande potencial de valorização está à venda por R$ 30.000.",
      hasChoices: true,
      choices: [
        {
          text: "Comprar o imóvel (se tiver dinheiro)",
          effect: () => {
            const imovelCusto = 30000;
            if (currentBalance >= imovelCusto) {
              currentBalance -= imovelCusto;
              assets.push({
                id: "imovel-" + Date.now(), // ID único
                name: "Imóvel Oportunidade",
                type: "imovel",
                value: imovelCusto,
                income: 150,
                expenses: 50,
              });
              return {
                message: `Você comprou o imóvel por R$ ${imovelCusto.toFixed(
                  2
                )}! Renda passiva mensal de R$ 150!`,
                type: "positive",
              };
            } else {
              return {
                message:
                  "Você não tem dinheiro suficiente para comprar o imóvel agora.",
                type: "negative",
              };
            }
          },
          canAfford: () => currentBalance >= 30000,
        },
        {
          text: "Deixar passar a oportunidade",
          effect: () => {
            return {
              message: "Você deixou a oportunidade passar. Talvez na próxima!",
              type: "neutral",
            };
          },
          canAfford: () => true,
        },
      ],
    },
    {
      id: "promocao-emprego",
      type: "positive",
      message: "Você recebeu uma oferta de promoção no trabalho!",
      hasChoices: true,
      choices: [
        {
          text: "Aceitar a promoção (+R$ 1000 salário, +R$ 200 despesas)",
          effect: () => {
            if (job) {
              job.salary += 1000;
              job.expenses += 200;
              localStorage.setItem("playerJob", JSON.stringify(job));
              updateMonthlyExpensesDisplay();
              monthlySalaryElement.textContent = parseFloat(job.salary).toFixed(
                2
              );
              return {
                message:
                  "Parabéns! Você foi promovido! Salário e despesas ajustados.",
                type: "positive",
              };
            }
            return {
              message: "Não foi possível aceitar a promoção.",
              type: "neutral",
            };
          },
          canAfford: () => true,
        },
        {
          text: "Recusar a promoção (manter status atual)",
          effect: () => {
            return {
              message: "Você preferiu manter seu cargo atual. Sem alterações.",
              type: "neutral",
            };
          },
          canAfford: () => true,
        },
      ],
    },
    {
      id: "desvalorizacao-acao-especifica",
      type: "negative",
      message: "Uma das suas ações sofreu uma queda inesperada de valor.",
      hasChoices: false,
      effect: () => {
        const affectedStocks = assets.filter(
          (a) => a.type === "acao-mercado" || a.type === "Ações"
        );
        if (affectedStocks.length > 0) {
          const stockToAffect =
            affectedStocks[Math.floor(Math.random() * affectedStocks.length)];
          const lossPercentage = Math.random() * 0.1 + 0.05;
          const lossAmount = stockToAffect.value * lossPercentage;
          stockToAffect.value = Math.max(0, stockToAffect.value - lossAmount);

          if (stockToAffect.type === "Ações") {
            const invIndex = investments.findIndex(
              (inv) => inv.type === "Ações"
            );
            if (invIndex !== -1) {
              investments[invIndex].amount = Math.max(
                0,
                investments[invIndex].amount - lossAmount
              );
            }
          }

          return `Sua ação "${
            stockToAffect.name || stockToAffect.type
          }" perdeu R$ ${lossAmount.toFixed(2)} (${(
            lossPercentage * 100
          ).toFixed(2)}%).`;
        }
        return "Nenhuma ação foi afetada por não possuir nenhuma.";
      },
      appliesTo: "assets",
    },
    {
      id: "valorizacao-imovel-especifica",
      type: "positive",
      message: "Seu imóvel valorizou no mercado!",
      hasChoices: false,
      effect: () => {
        const affectedProperties = assets.filter(
          (a) => a.type === "imovel" || a.type === "Imóveis"
        );
        if (affectedProperties.length > 0) {
          const propertyToAffect =
            affectedProperties[
              Math.floor(Math.random() * affectedProperties.length)
            ];
          const gainPercentage = Math.random() * 0.1 + 0.03;
          const gainAmount = propertyToAffect.value * gainPercentage;
          propertyToAffect.value += gainAmount;

          if (propertyToAffect.type === "Imóveis") {
            const invIndex = investments.findIndex(
              (inv) => inv.type === "Imóveis"
            );
            if (invIndex !== -1) {
              investments[invIndex].amount += gainAmount;
            }
          }

          return `Seu imóvel "${
            propertyToAffect.name || propertyToAffect.type
          }" valorizou R$ ${gainAmount.toFixed(2)} (${(
            gainPercentage * 100
          ).toFixed(2)}%).`;
        }
        return "Nenhum imóvel valorizou por não possuir nenhum.";
      },
      appliesTo: "assets",
    },
  ];

  // --- Funções para atualizar a interface ---

  // Função única para exibir TODOS os ativos (investimentos + outros ativos)
  function updateAllAssetsDisplay() {
    assetListBody.innerHTML = "";

    // Exibir investimentos da tela de investimento
    investments.forEach((investment) => {
      if (investment.amount > 0) {
        // Só mostra se tiver valor
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${investment.type} (Investimento)</td>
                    <td>Investimento</td>
                    <td>R$ ${parseFloat(investment.amount).toFixed(2)}</td>
                    <td>R$ 0.00</td>
                    <td>R$ 0.00</td>
                    <td></td> `;
        assetListBody.appendChild(row);
      }
    });

    // Exibir outros ativos (comprados no mercado ou por eventos)
    assets.forEach((asset) => {
      const row = document.createElement("tr");
      const assetNameDisplay =
        asset.quantity && asset.quantity > 1
          ? `${asset.name} (x${asset.quantity})`
          : asset.name;

      row.innerHTML = `
                <td>${assetNameDisplay}</td>
                <td>${asset.type}</td>
                <td>R$ ${parseFloat(asset.value).toFixed(2)}</td>
                <td>R$ ${
                  asset.income ? parseFloat(asset.income).toFixed(2) : "0.00"
                }</td>
                <td>R$ ${
                  asset.expenses
                    ? parseFloat(asset.expenses).toFixed(2)
                    : "0.00"
                }</td>
                <td><button class="sell-asset-button" data-asset-id="${
                  asset.id
                }">Vender</button></td>
            `;
      assetListBody.appendChild(row);
    });

    // Adicionar event listeners aos botões de venda
    document.querySelectorAll(".sell-asset-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const assetIdToSell = event.target.dataset.assetId;
        sellAsset(assetIdToSell);
      });
    });
  }

  function updateLiabilitiesDisplay() {
    liabilityListBody.innerHTML = "";
    liabilities.forEach((liability) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${liability.name}</td>
                <td>${liability.type}</td>
                <td>R$ ${parseFloat(liability.amount).toFixed(2)}</td>
                <td>R$ ${parseFloat(liability.monthlyPayment).toFixed(2)}</td>
                <td>R$ ${parseFloat(liability.currentAmountDue).toFixed(
                  2
                )}</td> `;
      liabilityListBody.appendChild(row);
    });
  }

  // --- Funções de Cálculo ---

  function calculateTotalExpenses() {
    let total = job ? parseFloat(job.expenses) : 0;
    liabilities.forEach((liability) => {
      total += parseFloat(liability.monthlyPayment);
    });
    assets.forEach((asset) => {
      if (asset.expenses) {
        total += parseFloat(asset.expenses);
      }
    });
    return total;
  }

  function updateMonthlyExpensesDisplay() {
    const totalExpenses = calculateTotalExpenses();
    monthlyExpensesElement.textContent = totalExpenses.toFixed(2);
    totalExpensesElement.textContent = totalExpenses.toFixed(2);
  }

  function calculatePassiveIncome() {
    let totalPassiveIncome = 0;
    assets.forEach((asset) => {
      if (asset.income) {
        totalPassiveIncome += parseFloat(asset.income);
      }
    });
    const savingsReturnRate = 0.001;
    const stocksReturnRate = 0.005;
    const realEstateReturnRate = 0.003;

    investments.forEach((inv) => {
      if (inv.type === "Poupança") {
        totalPassiveIncome += inv.amount * savingsReturnRate;
      } else if (inv.type === "Ações") {
        totalPassiveIncome += inv.amount * stocksReturnRate;
      } else if (inv.type === "Imóveis") {
        totalPassiveIncome += inv.amount * realEstateReturnRate;
      }
    });

    passiveIncomeElement.textContent = totalPassiveIncome.toFixed(2);
    return totalPassiveIncome;
  }

  function checkExitCondition() {
    const passiveIncome = calculatePassiveIncome();
    const totalExpenses = calculateTotalExpenses();

    if (passiveIncome >= totalExpenses) {
      exitStatusElement.textContent =
        "Parabéns! Você saiu da Corrida dos Ratos!";
      exitStatusElement.style.color = "green";
    } else {
      exitStatusElement.textContent =
        "Continue trabalhando para aumentar sua renda passiva!";
      exitStatusElement.style.color = "orange";
    }
  }

  // --- NOVO: Função para Vender Ativo ---
  function sellAsset(assetId) {
    const assetIndex = assets.findIndex((asset) => asset.id === assetId);

    if (assetIndex !== -1) {
      const assetToSell = assets[assetIndex];

      // Simular uma pequena variação no preço de venda (ex: 90% a 110% do valor atual)
      const saleMultiplier = Math.random() * 0.2 + 0.9; // Entre 0.9 e 1.1
      const saleValue = assetToSell.value * saleMultiplier;

      // Opcional: Adicionar uma taxa de venda (ex: 5%)
      const saleFee = saleValue * 0.05;
      const netSaleValue = saleValue - saleFee;

      currentBalance += netSaleValue; // Adiciona o valor líquido da venda ao saldo

      assets.splice(assetIndex, 1); // Remove o ativo da lista

      opportunityLog.innerHTML = ""; // Limpa o log
      const sellMessage = document.createElement("p");
      sellMessage.classList.add("event-positive"); // Mensagem positiva
      sellMessage.textContent = `Você vendeu seu(sua) ${
        assetToSell.name
      } por R$ ${netSaleValue.toFixed(
        2
      )} (valor original: R$ ${assetToSell.value.toFixed(2)}).`;
      opportunityLog.appendChild(sellMessage);

      saveGameState();
      updateAllAssetsDisplay();
      updateMonthlyExpensesDisplay(); // Pode mudar as despesas se o ativo tinha
      checkExitCondition(); // Pode mudar a renda passiva
      currentBalanceElement.textContent = currentBalance.toFixed(2); // Atualiza o saldo na UI
      console.log(
        `Ativo vendido: ${
          assetToSell.name
        }. Saldo atual: R$ ${currentBalance.toFixed(2)}`
      );
    } else {
      console.warn(
        `Tentativa de vender ativo com ID ${assetId} não encontrado.`
      );
    }
  }

  // --- Funções de Salvar/Carregar Estado do Jogo ---

  function saveGameState() {
    localStorage.setItem("playerData", JSON.stringify(player));
    localStorage.setItem("playerJob", JSON.stringify(job));
    localStorage.setItem("currentBalance", currentBalance.toFixed(2));
    localStorage.setItem("playerInvestments", JSON.stringify(investments));
    localStorage.setItem("playerAssets", JSON.stringify(assets));
    localStorage.setItem("playerLiabilities", JSON.stringify(liabilities));
  }

  function loadGameState() {
    const savedPlayerData = localStorage.getItem("playerData");
    if (savedPlayerData) player = JSON.parse(savedPlayerData);

    const savedPlayerJob = localStorage.getItem("playerJob");
    if (savedPlayerJob) job = JSON.parse(savedPlayerJob);
    else {
      window.location.href = "/screens/emprego.html";
      return;
    }

    const savedBalance = localStorage.getItem("currentBalance");
    if (savedBalance) currentBalance = parseFloat(savedBalance);
    else currentBalance = 1000;

    const savedInvestments = localStorage.getItem("playerInvestments");
    if (savedInvestments) investments = JSON.parse(savedInvestments);

    const savedAssets = localStorage.getItem("playerAssets");
    if (savedAssets) assets = JSON.parse(savedAssets);

    const savedLiabilities = localStorage.getItem("playerLiabilities");
    if (savedLiabilities) liabilities = JSON.parse(savedLiabilities);

    if (player) playerNameElement.textContent = player.name;
    if (job) {
      playerJobElement.textContent = job.name;
      monthlySalaryElement.textContent = parseFloat(job.salary).toFixed(2);
    }
    currentBalanceElement.textContent = currentBalance.toFixed(2);

    updateAllAssetsDisplay();
    updateLiabilitiesDisplay();
    updateMonthlyExpensesDisplay();
    checkExitCondition();
  }

  // --- NOVO: Função para Disparar Eventos Aleatórios (com suporte a escolhas) ---
  function triggerRandomEvent() {
    if (choiceEventActive) {
      return;
    }

    const eventChance = 0.5;
    if (Math.random() < eventChance) {
      const randomIndex = Math.floor(Math.random() * gameEvents.length);
      const event = gameEvents[randomIndex];

      opportunityLog.innerHTML = "";
      eventChoicesDiv.innerHTML = "";
      eventChoicesDiv.style.display = "none";

      const eventMessageP = document.createElement("p");
      eventMessageP.textContent = event.message;
      opportunityLog.appendChild(eventMessageP);

      if (event.hasChoices) {
        choiceEventActive = true;
        nextMonthButton.disabled = true;

        event.choices.forEach((choice, index) => {
          const choiceButton = document.createElement("button");
          choiceButton.textContent = choice.text;
          choiceButton.classList.add("event-choice-button");

          if (!choice.canAfford()) {
            choiceButton.disabled = true;
            choiceButton.title =
              "Você não tem dinheiro suficiente para esta opção.";
          }

          choiceButton.addEventListener("click", () => {
            const result = choice.effect();

            opportunityLog.innerHTML = "";
            const resultP = document.createElement("p");
            resultP.textContent = result.message;
            resultP.classList.add(
              result.type === "positive"
                ? "event-positive"
                : result.type === "negative"
                ? "event-negative"
                : "event-neutral"
            );
            opportunityLog.appendChild(resultP);

            eventChoicesDiv.innerHTML = "";
            eventChoicesDiv.style.display = "none";
            choiceEventActive = false;
            nextMonthButton.disabled = false;

            currentBalanceElement.textContent = currentBalance.toFixed(2);
            saveGameState();
            updateAllAssetsDisplay();
            updateLiabilitiesDisplay();
            updateMonthlyExpensesDisplay();
            checkExitCondition();
          });
          eventChoicesDiv.appendChild(choiceButton);
        });
        eventChoicesDiv.style.display = "flex";
      } else {
        const effectValue = event.effect();
        eventMessageP.textContent += ` ${effectValue}.`;
        eventMessageP.classList.add(
          event.type === "positive" ? "event-positive" : "event-negative"
        );

        console.log(
          `Evento do mês: ${
            event.message
          } ${effectValue}. Novo Saldo: ${currentBalance.toFixed(2)}`
        );
      }
    } else {
      opportunityLog.innerHTML = "";
      const noEventMessage = document.createElement("p");
      noEventMessage.textContent =
        "Este mês não houve eventos significativos, apenas a rotina.";
      opportunityLog.appendChild(noEventMessage);
      eventChoicesDiv.innerHTML = "";
      eventChoicesDiv.style.display = "none";
      choiceEventActive = false;
      nextMonthButton.disabled = false;
    }
  }

  // --- Inicialização e Event Listeners ---

  loadGameState();

  marketButton.addEventListener("click", () => {
    window.location.href = "/screens/mercado.html";
  });

  nextMonthButton.addEventListener("click", () => {
    if (!job) {
      alert("Por favor, selecione um emprego antes de avançar o mês.");
      return;
    }
    if (choiceEventActive) {
      alert(
        "Por favor, faça sua escolha no evento atual antes de avançar o mês."
      );
      return;
    }

    currentBalance += parseFloat(job.salary);

    investments.forEach((investment) => {
      let returnRate = 0;
      switch (investment.type) {
        case "Poupança":
          returnRate = 0.001;
          break;
        case "Ações":
          returnRate = 0.005;
          break;
        case "Imóveis":
          returnRate = 0.003;
          break;
      }
      investment.amount += parseFloat(investment.amount) * returnRate;
    });

    triggerRandomEvent();

    if (!choiceEventActive) {
      currentBalance -= calculateTotalExpenses();

      liabilities.forEach((liability) => {
        liability.currentAmountDue = Math.max(
          0,
          liability.currentAmountDue - liability.monthlyPayment
        );
      });

      liabilities = liabilities.filter(
        (liability) => liability.currentAmountDue > 0
      );

      currentBalanceElement.textContent = currentBalance.toFixed(2);
      saveGameState();
      updateAllAssetsDisplay();
      updateLiabilitiesDisplay();
      updateMonthlyExpensesDisplay();
      checkExitCondition();
    }
  });

  investButton.addEventListener("click", () => {
    window.location.href = "/screens/investimento.html";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const pixDonationLink = document.getElementById("pixDonationLink");
  const yourPixKey = "ivannatech@gmail.com"; // <-- Substitua pela sua chave Pix real

  if (pixDonationLink) {
    pixDonationLink.addEventListener("click", (event) => {
      event.preventDefault(); // Impede o link de navegar para outra página
      alert(
        `Fico feliz que tenha gostado e queira me ajudar! \n\n Minha chave Pix é: ivannatech@gmail.com\n\nCopie e cole para fazer a doação.`
      );
    });
  }
});

const pixDonationLink = document.getElementById("pixDonationLink");
const pixModal = document.getElementById("pixModal");
const closeButton = document.querySelector(".close-button");
const displayedPixKey = document.getElementById("displayedPixKey");
const copyPixKeyButton = document.getElementById("copyPixKey");
const floatingPixButton = document.getElementById("floatingPixButton");

const yourPixKey = "ivannatech@gmail.com"; // <-- Substitua pela sua chave Pix real

// Evento para o link "cafezinho" no footer
if (pixDonationLink) {
  pixDonationLink.addEventListener("click", (event) => {
    event.preventDefault();
    displayedPixKey.textContent = yourPixKey;
    pixModal.style.display = "flex"; // Exibe o modal
  });
}

// Evento para o NOVO botão flutuante
if (floatingPixButton) {
  // <--- Novo
  floatingPixButton.addEventListener("click", () => {
    // <--- Novo
    displayedPixKey.textContent = yourPixKey; // Garante que a chave correta seja exibida
    pixModal.style.display = "flex"; // Exibe o modal
  });
}

if (closeButton) {
  closeButton.addEventListener("click", () => {
    pixModal.style.display = "none"; // Esconde o modal ao clicar no 'x'
  });
}

// Fecha o modal se clicar fora do conteúdo do modal
window.addEventListener("click", (event) => {
  if (event.target === pixModal) {
    pixModal.style.display = "none";
  }
});

if (copyPixKeyButton) {
  copyPixKeyButton.addEventListener("click", () => {
    navigator.clipboard
      .writeText(yourPixKey)
      .then(() => {
        alert("Chave Pix copiada para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar a chave Pix:", err);
        alert(
          "Não foi possível copiar a chave Pix automaticamente. Por favor, copie manualmente: " +
            yourPixKey
        );
      });
  });
}
