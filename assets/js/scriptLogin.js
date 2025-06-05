document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const senhaInput = document.getElementById('senha');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
        senhaInput.setAttribute('type', type);
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        // Simulação de autenticação (em um sistema real, isso seria feito no backend)
        if (email === 'admin@admin.com' && senha === 'adm123adm') {
            const usuarioAtual = { email, nome: 'Administrador' };
            localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual));
            window.location.href = 'index.html';
        } else {
            alert('Email ou senha inválidos!');
        }
    });
});