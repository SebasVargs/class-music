document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileElem');
    const fileName = document.getElementById('file-name');
    const uploadBtn = document.getElementById('upload-btn');
    const progressBar = document.getElementById('progress-bar');
    const messageDiv = document.getElementById('message');
    const uploadForm = document.getElementById('upload-form');
    
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
    
    // Manejar el envío del formulario
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (selectedFile) {
            uploadFile();
        }
    });
    
    // Función para subir el archivo
    function uploadFile() {
        if (!selectedFile) {
            return;
        }
        
        uploadBtn.disabled = true;
        
        // Crear FormData para enviar el archivo
        const formData = new FormData();
        formData.append('audiofile', selectedFile);
        
        // Crear un objeto XMLHttpRequest para poder mostrar el progreso
        const xhr = new XMLHttpRequest();
        
        // Manejar el progreso de la subida
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = percentComplete + '%';
            }
        });
        
        // Cuando la subida se complete
        xhr.addEventListener('load', function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                showMessage('¡Archivo subido con éxito! El reproductor ha sido actualizado.', 'success');
                
                // Después de 2 segundos, redirigir a la página principal
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                let errorMsg = 'Error al subir el archivo';
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.message) {
                        errorMsg = response.message;
                    }
                } catch (e) {
                    console.error('Error al parsear respuesta:', e);
                }
                showMessage(errorMsg, 'error');
                uploadBtn.disabled = false;
            }
        });
        
        // Manejar errores de red
        xhr.addEventListener('error', function() {
            showMessage('Error de conexión. Inténtalo de nuevo.', 'error');
            uploadBtn.disabled = false;
        });
        
        // Configurar la solicitud
        xhr.open('POST', '/upload', true);
        
        // Enviar la solicitud con el FormData que contiene el archivo
        xhr.send(formData);
    }
    
    // Mostrar mensajes al usuario
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = 'message ' + type;
        messageDiv.style.display = 'block';
    }
});