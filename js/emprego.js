document.addEventListener('DOMContentLoaded', () => {
    const jobListDiv = document.getElementById('jobList');
    const confirmJobButton = document.getElementById('confirmJobButton');
    let selectedJob = null;

    const jobs = [
        { id: 'vendedor', name: 'Vendedor', salary: 2000, expenses: 800 },
        { id: 'programador-junior', name: 'Programador Júnior', salary: 3500, expenses: 1200 },
        { id: 'professor', name: 'Professor', salary: 3000, expenses: 1000 },
        { id: 'analista-financeiro', name: 'Analista Financeiro', salary: 5000, expenses: 1500 }
    ];

    function displayJobs() {
        jobs.forEach(job => {
            const jobOption = document.createElement('div');
            jobOption.classList.add('job-option');
            jobOption.dataset.jobId = job.id;

            jobOption.innerHTML = `
                <h3>${job.name}</h3>
                <p class="salary">Salário: R$ ${job.salary.toFixed(2)}</p>
                <p>Despesas Base: R$ ${job.expenses.toFixed(2)}</p>
            `;

            jobOption.addEventListener('click', () => {
                document.querySelectorAll('.job-option.selected').forEach(el => el.classList.remove('selected'));
                jobOption.classList.add('selected');
                selectedJob = job.id;
                confirmJobButton.disabled = false;
            });

            jobListDiv.appendChild(jobOption);
        });
    }

    displayJobs();

    confirmJobButton.addEventListener('click', () => {
        if (selectedJob) {
            const chosenJob = jobs.find(job => job.id === selectedJob);
            localStorage.setItem('playerJob', JSON.stringify(chosenJob));
            window.location.href = '/screens/principal.html';
        } else {
            alert('Por favor, selecione um emprego.');
        }
    });
});