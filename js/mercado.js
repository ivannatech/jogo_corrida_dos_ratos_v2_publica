document.addEventListener("DOMContentLoaded", () => {
  const availableAssetsDiv = document.getElementById("availableAssets");
  const playerAssetsForSaleDiv = document.getElementById("playerAssetsForSale");
  const noAssetsMessage = document.getElementById("noAssetsMessage");
  const availableLiabilitiesToContractDiv = document.getElementById(
    "availableLiabilitiesToContract"
  );
  const playerLiabilitiesToPayOffDiv = document.getElementById(
    "playerLiabilitiesToPayOff"
  );
  const noLiabilitiesMessage = document.getElementById("noLiabilitiesMessage");
  const backToMainButton = document.getElementById("backToMainButton");

  // Ativos pré-definidos para venda no mercado (mantido como estava)
  const marketAssets = [
    {
      id: "carro-popular",
      name: "Carro Popular",
      type: "veiculo",
      value: 25000,
      expenses: 300,
      description: "Um carro básico para o dia a dia.",
      quantity: 1,
      sellValueMultiplier: 0.7,
    },
    {
      id: "apartamento-pequeno",
      name: "Apartamento Pequeno",
      type: "imovel",
      value: 150000,
      income: 800,
      expenses: 150,
      description: "Um imóvel para morar ou alugar.",
      quantity: 1,
      sellValueMultiplier: 0.9,
    },
    {
      id: "acao-empresa-x",
      name: "Ação da Empresa X",
      type: "investimento-direto",
      value: 1000,
      income: 10,
      description: "Uma ação de uma empresa promissora.",
      quantity: 1,
      sellValueMultiplier: 0.85,
    },
  ];

  // --- Passivos pré-definidos para serem contraídos ---
  const marketLiabilities = [
    {
      id: "emprestimo-pessoal",
      name: "Empréstimo Pessoal",
      type: "emprestimo",
      amount: 10000, // Valor que o jogador recebe
      monthlyPayment: 500, // Pagamento mensal da dívida
      totalToPay: 12000, // Total a ser pago (com juros)
      description: "Um empréstimo para te ajudar no início.",
    },
    {
      id: "financiamento-veiculo",
      name: "Financiamento de Veículo",
      type: "financiamento",
      amount: 30000,
      monthlyPayment: 800,
      totalToPay: 40000,
      description: "Financiamento para comprar um carro.",
    },
    // Adicione mais passivos aqui
  ];

  // --- Funções Auxiliares para Manipulação de Ativos (mantidas) ---
  const addOrUpdatePlayerAsset = (newAsset) => {
    let playerAssets = JSON.parse(localStorage.getItem("playerAssets")) || [];
    let existingAssetIndex = playerAssets.findIndex(
      (asset) => asset.id === newAsset.id
    );

    if (existingAssetIndex !== -1) {
      playerAssets[existingAssetIndex].value += newAsset.value;
      if (newAsset.income) {
        playerAssets[existingAssetIndex].income =
          (playerAssets[existingAssetIndex].income || 0) + newAsset.income;
      }
      if (newAsset.expenses) {
        playerAssets[existingAssetIndex].expenses =
          (playerAssets[existingAssetIndex].expenses || 0) + newAsset.expenses;
      }
      if (playerAssets[existingAssetIndex].quantity) {
        playerAssets[existingAssetIndex].quantity += newAsset.quantity || 1;
      } else {
        playerAssets[existingAssetIndex].quantity = newAsset.quantity || 1;
      }
    } else {
      playerAssets.push({ ...newAsset, quantity: newAsset.quantity || 1 });
    }
    localStorage.setItem("playerAssets", JSON.stringify(playerAssets));
  };

  const removePlayerAsset = (assetIdToRemove) => {
    let playerAssets = JSON.parse(localStorage.getItem("playerAssets")) || [];
    const assetIndex = playerAssets.findIndex(
      (asset) => asset.id === assetIdToRemove
    );

    if (assetIndex !== -1) {
      const assetBeingSold = playerAssets[assetIndex];
      const marketAssetInfo = marketAssets.find(
        (ma) => ma.id === assetIdToRemove
      );
      const sellMultiplier =
        marketAssetInfo && marketAssetInfo.sellValueMultiplier !== undefined
          ? marketAssetInfo.sellValueMultiplier
          : 0.5;

      const sellValuePerUnit =
        (marketAssetInfo
          ? marketAssetInfo.value
          : assetBeingSold.value / assetBeingSold.quantity) * sellMultiplier;

      if (assetBeingSold.quantity && assetBeingSold.quantity > 1) {
        assetBeingSold.quantity--;
        // Reduz o valor total do ativo e as despesas/renda proporcionais à unidade vendida
        assetBeingSold.value -= marketAssetInfo
          ? marketAssetInfo.value
          : assetBeingSold.value / (assetBeingSold.quantity + 1);

        if (marketAssetInfo && marketAssetInfo.income) {
          assetBeingSold.income =
            (assetBeingSold.income || 0) - marketAssetInfo.income;
        }
        if (marketAssetInfo && marketAssetInfo.expenses) {
          assetBeingSold.expenses =
            (assetBeingSold.expenses || 0) - marketAssetInfo.expenses;
        }

        localStorage.setItem("playerAssets", JSON.stringify(playerAssets));
        return sellValuePerUnit;
      } else {
        playerAssets.splice(assetIndex, 1);
        localStorage.setItem("playerAssets", JSON.stringify(playerAssets));
        return assetBeingSold.value * sellMultiplier;
      }
    }
    return 0;
  };

  // --- Funções Auxiliares para Manipulação de Passivos ---

  const addOrUpdatePlayerLiability = (newLiability) => {
    let playerLiabilities =
      JSON.parse(localStorage.getItem("playerLiabilities")) || [];

    // Encontra um passivo existente com o mesmo ID
    let existingLiabilityIndex = playerLiabilities.findIndex(
      (lib) => lib.id === newLiability.id
    );

    if (existingLiabilityIndex !== -1) {
      // Se o passivo já existe, somamos o montante (se houver mais parcelas ou outro empréstimo igual)
      // Aqui, para simplicidade, vamos apenas adicionar se for um novo contrato do mesmo tipo,
      // mas geralmente empréstimos são únicos ou com IDs diferentes.
      // Para este caso, vamos adicionar como um novo item se já tiver um (simulando um novo empréstimo do mesmo tipo)
      playerLiabilities.push({
        ...newLiability,
        currentAmountDue: newLiability.totalToPay,
      });
    } else {
      // Se o passivo não existe, adicionamos ele.
      // currentAmountDue é o quanto ainda falta pagar do passivo
      playerLiabilities.push({
        ...newLiability,
        currentAmountDue: newLiability.totalToPay,
      });
    }
    localStorage.setItem(
      "playerLiabilities",
      JSON.stringify(playerLiabilities)
    );
  };

  const payOffPlayerLiability = (liabilityIndexToPay) => {
    let playerLiabilities =
      JSON.parse(localStorage.getItem("playerLiabilities")) || [];

    if (
      liabilityIndexToPay >= 0 &&
      liabilityIndexToPay < playerLiabilities.length
    ) {
      const liability = playerLiabilities[liabilityIndexToPay];
      let currentBalance =
        parseFloat(localStorage.getItem("currentBalance")) || 0;

      if (currentBalance >= liability.currentAmountDue) {
        // Quita a dívida por completo
        currentBalance -= liability.currentAmountDue;
        playerLiabilities.splice(liabilityIndexToPay, 1); // Remove o passivo
        localStorage.setItem("currentBalance", currentBalance.toFixed(2));
        localStorage.setItem(
          "playerLiabilities",
          JSON.stringify(playerLiabilities)
        );
        alert(`Você quitou o passivo: ${liability.name}!`);
        return true;
      } else {
        alert(
          `Saldo insuficiente para quitar este passivo! Faltam R$ ${(
            liability.currentAmountDue - currentBalance
          ).toFixed(2)}.`
        );
        return false;
      }
    }
    return false;
  };

  // --- Funções de Exibição ---

  // Exibir ativos disponíveis para compra (mantida)
  function displayAvailableAssets() {
    availableAssetsDiv.innerHTML = "";
    marketAssets.forEach((asset) => {
      const assetItem = document.createElement("div");
      assetItem.classList.add("asset-item");
      assetItem.innerHTML = `
                <div class="asset-info">
                    <h3>${asset.name} (${asset.type})</h3>
                    <p>Valor de Compra: R$ ${asset.value.toFixed(2)}</p>
                    <p>Renda Mensal: R$ ${
                      asset.income ? asset.income.toFixed(2) : "0.00"
                    }</p>
                    <p>Despesas Mensais: R$ ${
                      asset.expenses ? asset.expenses.toFixed(2) : "0.00"
                    }</p>
                    <p>${asset.description}</p>
                </div>
                <button class="buy-button" data-asset-id="${
                  asset.id
                }">Comprar</button>
            `;
      availableAssetsDiv.appendChild(assetItem);
    });
    addBuyButtonListeners();
  }

  // Exibir ativos do jogador para venda (mantida)
  function displayPlayerAssetsForSale() {
    let playerAssets = JSON.parse(localStorage.getItem("playerAssets")) || [];
    playerAssetsForSaleDiv.innerHTML = "";

    if (playerAssets.length === 0) {
      noAssetsMessage.style.display = "block";
      return;
    } else {
      noAssetsMessage.style.display = "none";
    }

    playerAssets.forEach((asset) => {
      const marketAssetInfo = marketAssets.find((ma) => ma.id === asset.id);

      if (marketAssetInfo) {
        const sellValuePerUnit =
          marketAssetInfo.value * (marketAssetInfo.sellValueMultiplier || 0.5);

        const assetItem = document.createElement("div");
        assetItem.classList.add("asset-item");
        assetItem.innerHTML = `
                    <div class="asset-info">
                        <h3>${asset.name} ${
          asset.quantity > 1 ? `(x${asset.quantity})` : ""
        }</h3>
                        <p>Valor Total (Compra): R$ ${asset.value.toFixed(
                          2
                        )}</p>
                        <p>Renda Mensal: R$ ${
                          asset.income ? asset.income.toFixed(2) : "0.00"
                        }</p>
                        <p>Despesas Mensais: R$ ${
                          asset.expenses
                            ? parseFloat(asset.expenses).toFixed(2)
                            : "0.00"
                        }</p>
                        <p style="color: green;">Valor de Venda (1 unid.): R$ ${sellValuePerUnit.toFixed(
                          2
                        )}</p>
                    </div>
                    <button class="sell-button" data-asset-id="${
                      asset.id
                    }">Vender ${
          asset.quantity > 1 ? "(1 unidade)" : ""
        }</button>
                `;
        playerAssetsForSaleDiv.appendChild(assetItem);
      }
    });
    addSellButtonListeners();
  }

  // --- Função para exibir os passivos disponíveis para contrair ---
  function displayAvailableLiabilitiesToContract() {
    availableLiabilitiesToContractDiv.innerHTML = "";
    marketLiabilities.forEach((liability) => {
      const liabilityItem = document.createElement("div");
      liabilityItem.classList.add("liability-item"); // Reutiliza estilo, ou crie 'contract-item'
      liabilityItem.innerHTML = `
                <div class="liability-info">
                    <h3>${liability.name} (${liability.type})</h3>
                    <p>Você recebe: R$ ${liability.amount.toFixed(2)}</p>
                    <p>Pagamento Mensal: R$ ${liability.monthlyPayment.toFixed(
                      2
                    )}</p>
                    <p>Total a Pagar: R$ ${liability.totalToPay.toFixed(2)}</p>
                    <p>${liability.description}</p>
                </div>
                <button class="contract-button" data-liability-id="${
                  liability.id
                }">Contrair</button>
            `;
      availableLiabilitiesToContractDiv.appendChild(liabilityItem);
    });
    addContractButtonListeners();
  }

  // --- Função para exibir os passivos do jogador que podem ser quitados ---
  function displayPlayerLiabilitiesToPayOff() {
    let playerLiabilities =
      JSON.parse(localStorage.getItem("playerLiabilities")) || [];
    playerLiabilitiesToPayOffDiv.innerHTML = "";

    if (playerLiabilities.length === 0) {
      noLiabilitiesMessage.style.display = "block";
      return;
    } else {
      noLiabilitiesMessage.style.display = "none";
    }

    playerLiabilities.forEach((liability, index) => {
      const liabilityItem = document.createElement("div");
      liabilityItem.classList.add("liability-item");
      liabilityItem.innerHTML = `
                <div class="liability-info">
                    <h3>${liability.name}</h3>
                    <p>Valor Original: R$ ${liability.amount.toFixed(2)}</p>
                    <p>Pagamento Mensal: R$ ${liability.monthlyPayment.toFixed(
                      2
                    )}</p>
                    <p style="color: red;">Restante a Quitar: R$ ${liability.currentAmountDue.toFixed(
                      2
                    )}</p>
                </div>
                <button class="payoff-button" data-liability-index="${index}">Quitar</button>
            `;
      playerLiabilitiesToPayOffDiv.appendChild(liabilityItem);
    });
    addPayOffButtonListeners();
  }

  // --- Event Listeners ---

  // Listeners para os botões de compra (mantido)
  function addBuyButtonListeners() {
    document.querySelectorAll(".buy-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const assetId = event.target.dataset.assetId;
        const assetToBuy = marketAssets.find((asset) => asset.id === assetId);

        if (assetToBuy) {
          let currentBalance =
            parseFloat(localStorage.getItem("currentBalance")) || 0;

          if (currentBalance >= assetToBuy.value) {
            currentBalance -= assetToBuy.value;
            localStorage.setItem("currentBalance", currentBalance.toFixed(2));

            addOrUpdatePlayerAsset(assetToBuy);
            alert(
              `Você comprou ${
                assetToBuy.name
              } por R$ ${assetToBuy.value.toFixed(2)}!`
            );

            displayPlayerAssetsForSale(); // Atualiza a exibição de ativos do jogador
          } else {
            alert("Saldo insuficiente para comprar este ativo!");
          }
        }
      });
    });
  }

  // Listeners para os botões de venda (mantido)
  function addSellButtonListeners() {
    document.querySelectorAll(".sell-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const assetId = event.target.dataset.assetId;

        if (
          !confirm(
            `Tem certeza que deseja vender 1 unidade de ${
              marketAssets.find((ma) => ma.id === assetId)?.name
            }?`
          )
        ) {
          return;
        }

        const soldValue = removePlayerAsset(assetId);

        if (soldValue > 0) {
          let currentBalance =
            parseFloat(localStorage.getItem("currentBalance")) || 0;
          currentBalance += soldValue;
          localStorage.setItem("currentBalance", currentBalance.toFixed(2));

          alert(
            `Você vendeu ${
              marketAssets.find((ma) => ma.id === assetId)?.name
            } por R$ ${soldValue.toFixed(2)}!`
          );

          displayPlayerAssetsForSale();
        } else {
          alert("Erro ao vender ativo.");
        }
      });
    });
  }

  // --- Listener para os botões de contrair passivo ---
  function addContractButtonListeners() {
    document.querySelectorAll(".contract-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const liabilityId = event.target.dataset.liabilityId;
        const liabilityToContract = marketLiabilities.find(
          (lib) => lib.id === liabilityId
        );

        if (liabilityToContract) {
          let currentBalance =
            parseFloat(localStorage.getItem("currentBalance")) || 0;

          // Adiciona o valor do empréstimo/financiamento ao saldo do jogador
          currentBalance += liabilityToContract.amount;
          localStorage.setItem("currentBalance", currentBalance.toFixed(2));

          addOrUpdatePlayerLiability(liabilityToContract); // Adiciona o passivo ao jogador
          alert(
            `Você contraiu ${
              liabilityToContract.name
            }! Seu saldo aumentou em R$ ${liabilityToContract.amount.toFixed(
              2
            )}.`
          );

          // Atualiza a exibição de passivos do jogador imediatamente
          displayPlayerLiabilitiesToPayOff();
        }
      });
    });
  }

  // --- Listener para os botões de quitar passivo ---
  function addPayOffButtonListeners() {
    document.querySelectorAll(".payoff-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const liabilityIndex = parseInt(event.target.dataset.liabilityIndex); // Pegamos o índice do array

        if (
          confirm("Tem certeza que deseja quitar este passivo por completo?")
        ) {
          const successfullyPaidOff = payOffPlayerLiability(liabilityIndex);
          if (successfullyPaidOff) {
            displayPlayerLiabilitiesToPayOff(); // Atualiza a lista de passivos na tela de mercado
          }
        }
      });
    });
  }

  // Event listener para o botão de voltar (mantido)
  backToMainButton.addEventListener("click", () => {
    window.location.href = "/screens/principal.html";
  });

  // --- Inicialização ---
  displayAvailableAssets();
  displayPlayerAssetsForSale();
  displayAvailableLiabilitiesToContract(); // Exibe passivos para contrair
  displayPlayerLiabilitiesToPayOff(); // Exibe passivos do jogador
});
