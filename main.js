document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay una nueva canción guardada en localStorage
    const newSongData = localStorage.getItem('newSong');
    
    if (newSongData) {
        const songInfo = JSON.parse(newSongData);
        
        // Actualizar el título de la canción
        const songTitleElement = document.getElementById('song-title');
        if (songTitleElement) {
            songTitleElement.textContent = songInfo.title;
        }
        
        // Actualizar la fuente del reproductor de audio
        const audioPlayer = document.getElementById('reproductor');
        if (audioPlayer && songInfo.objectURL) {
            audioPlayer.src = songInfo.objectURL;
            
            // Actualizar el nombre del artista (opcional)
            const nombreElement = document.querySelector('.nombre');
            if (nombreElement) {
                nombreElement.textContent = "Canción subida por el usuario";
            }
        }
        
        // Mostrar una notificación
        const infoDiv = document.querySelector('.info');
        if (infoDiv) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = '¡Canción actualizada! ' + songInfo.title;
            infoDiv.appendChild(notification);
            
            // Eliminar la notificación después de 5 segundos
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    infoDiv.removeChild(notification);
                }, 500);
            }, 5000);
        }
    }
    
    // Cuando se recarga la página, la objectURL ya no es válida
    // Este es un problema inherente a las URL de objetos
    // Si el usuario actualiza la página, necesitaremos restablecer a la canción original
    window.addEventListener('beforeunload', function() {
        // No borramos el localStorage aquí para mantener el título,
        // pero la URL del objeto no será válida después de recargar
    });
});