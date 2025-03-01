document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const songTitleElement = document.getElementById('song-title');
    const audioPlayer = document.getElementById('reproductor');
    const infoDiv = document.querySelector('.info');
    
    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        infoDiv.innerHTML = '';
        infoDiv.appendChild(notification);
        
        // Eliminar notificación después de 5 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode === infoDiv) {
                    infoDiv.removeChild(notification);
                }
            }, 500);
        }, 5000);
    }
    
    // Función para cargar la información de la canción actual
    function loadCurrentSong() {
        fetch('/current-song')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener la información de la canción');
                }
                return response.json();
            })
            .then(data => {
                // Actualizar el título
                songTitleElement.textContent = data.title;
                
                // Actualizar la fuente del reproductor
                audioPlayer.src = data.path;
                
                // Verificar si la canción cambió recientemente (usando sessionStorage)
                const lastSong = sessionStorage.getItem('lastSong');
                const currentSong = data.title;
                
                if (lastSong && lastSong !== currentSong) {
                    showNotification(`¡Canción actualizada! ${data.title}`);
                }
                
                // Guardar la canción actual en sessionStorage
                sessionStorage.setItem('lastSong', data.title);
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al cargar la información de la canción', 'error');
            });
    }
    
    // Cargar la canción actual al iniciar la página
    loadCurrentSong();
});