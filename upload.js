document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileElem');
    const fileName = document.getElementById('file-name');
    const uploadBtn = document.getElementById('upload-btn');
    const progressBar = document.getElementById('progress-bar');
    const messageDiv = document.getElementById('message');
    
    // Variables para almacenar el archivo
    let selectedFile = null;
    
    // Prevenir comportamiento por defecto de arrastrar y soltar
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Añadir o quitar la clase highlight
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Manejar archivos soltados
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Manejar archivos desde el input
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // Procesar los archivos seleccionados
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            
            // Verificar que sea un archivo MP3
            if (file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')) {
                selectedFile = file;
                fileName.textContent = file.name;
                uploadBtn.disabled = false;
                messageDiv.className = 'message';
                messageDiv.textContent = '';
                messageDiv.style.display = 'none';
            } else {
                selectedFile = null;
                fileName.textContent = 'Error: Solo se permiten archivos MP3';
                uploadBtn.disabled = true;
                showMessage('Solo se permiten archivos MP3', 'error');
            }
        }
    }
    
    // Evento de clic en el botón de subida
    uploadBtn.addEventListener('click', uploadFile);
    
    // Función para subir el archivo
    function uploadFile() {
        if (!selectedFile) {
            return;
        }
        
        uploadBtn.disabled = true;
        let progress = 0;
        
        // Simulación de progreso
        const interval = setInterval(() => {
            progress += 5;
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                
                setTimeout(() => {
                    // Crear una URL para el archivo seleccionado
                    const objectURL = URL.createObjectURL(selectedFile);
                    
                    // Guardar información en localStorage
                    const songTitle = selectedFile.name.replace('.mp3', '');
                    localStorage.setItem('newSong', JSON.stringify({
                        title: songTitle,
                        filename: selectedFile.name,
                        objectURL: objectURL
                    }));
                    
                    showMessage('¡Archivo cargado con éxito! El reproductor ha sido actualizado.', 'success');
                    
                    // Después de 2 segundos, redirigir a la página principal
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                }, 500);
            }
        }, 100);
    }
    
    // Mostrar mensajes al usuario
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = 'message ' + type;
        messageDiv.style.display = 'block';
    }
});