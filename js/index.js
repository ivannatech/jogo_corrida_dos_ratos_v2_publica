document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('startGameButton');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');

    startGameButton.addEventListener('click', () => {
        const player1Name = player1Input.value.trim();
        const player2Name = player2Input.value.trim();

        if (player1Name && player2Name) {
            // Salvar os nomes dos jogadores no Local Storage
            localStorage.setItem('player1Name', player1Name);
            localStorage.setItem('player2Name', player2Name);

            // Redirecionar para a próxima tela do jogo (ainda não criada)
            window.location.href = '/jogo_corrida_dos_ratos_v2_publica/screens/cadastro.html'; // Você criará o arquivo game.html posteriormente
        } else {
            alert('Por favor, insira o nome de ambos os jogadores.');
        }
    });
});