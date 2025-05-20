document.addEventListener('DOMContentLoaded', () => {
    const playerForm = document.getElementById('playerForm');

    playerForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const playerName = document.getElementById('name').value.trim();
        const playerAge = document.getElementById('age').value;
        const playerEducation = document.getElementById('education').value;
        const playerMaritalStatus = document.getElementById('maritalStatus').value;
        const playerChildren = document.getElementById('children').value;

        if (playerName) {
            // Salvar os dados do jogador no Local Storage
            const playerData = {
                name: playerName,
                age: playerAge,
                education: playerEducation,
                maritalStatus: playerMaritalStatus,
                children: playerChildren
            };
            localStorage.setItem('playerData', JSON.stringify(playerData));

            // Redirecionar para a próxima tela do jogo (escolha de emprego)
            window.location.href = '../screens/emprego.html'; // Próxima tela a ser criada
        } else {
            alert('Por favor, insira o seu nome.');
        }
    });
});