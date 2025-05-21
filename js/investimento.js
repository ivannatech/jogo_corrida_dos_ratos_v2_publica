document.addEventListener('DOMContentLoaded', () => {
    const confirmInvestmentsButton = document.getElementById('confirmInvestmentsButton');
    const closeInvestmentsButton = document.getElementById('closeInvestmentsButton');
    const savingsAmountInput = document.getElementById('savingsAmount');
    const stocksAmountInput = document.getElementById('stocksAmount');
    const realEstateAmountInput = document.getElementById('realEstateAmount');

    let currentBalance = parseFloat(localStorage.getItem('currentBalance')) || 0;
    let investments = JSON.parse(localStorage.getItem('playerInvestments')) || [];

    confirmInvestmentsButton.addEventListener('click', () => {
        const savingsInvestment = parseFloat(savingsAmountInput.value) || 0;
        const stocksInvestment = parseFloat(stocksAmountInput.value) || 0;
        const realEstateInvestment = parseFloat(realEstateAmountInput.value) || 0;
        const totalInvestment = savingsInvestment + stocksInvestment + realEstateInvestment;

        if (totalInvestment > currentBalance) {
            alert('Saldo insuficiente!');
            return;
        }

        if (totalInvestment > 0) {
            currentBalance -= totalInvestment;
            localStorage.setItem('currentBalance', currentBalance.toFixed(2));

            // Função auxiliar para adicionar ou somar investimento
            const addOrUpdateInvestment = (type, amount) => {
                let existingInvestment = investments.find(inv => inv.type === type);
                if (existingInvestment) {
                    existingInvestment.amount += amount;
                } else {
                    investments.push({ type: type, amount: amount });
                }
            };

            if (savingsInvestment > 0) addOrUpdateInvestment('Poupança', savingsInvestment);
            if (stocksInvestment > 0) addOrUpdateInvestment('Ações', stocksInvestment);
            if (realEstateInvestment > 0) addOrUpdateInvestment('Imóveis', realEstateInvestment);

            localStorage.setItem('playerInvestments', JSON.stringify(investments));

            alert('Investimentos realizados!');
            window.location.href = '/jogo_corrida_dos_ratos_v2_publica/screens/principal.html';
        } else {
            alert('Insira um valor para investir.');
        }
    });

    closeInvestmentsButton.addEventListener('click', () => {
        window.location.href = '/jogo_corrida_dos_ratos_v2_publica/screens/principal.html';
    });
});