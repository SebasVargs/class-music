const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Configurar middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/') // Guardar archivos en la carpeta src/
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Mantener el nombre original del archivo
  }
});

// Filtro para asegurar que solo se suban archivos MP3
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'audio/mpeg' || path.extname(file.originalname).toLowerCase() === '.mp3') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos MP3'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  }
});

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para la página de subida
app.get('/screen2.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'screen2.html'));
});

// Ruta para subir archivos
app.post('/upload', upload.single('audiofile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }

    // Obtener información de la canción actual
    const currentSongInfo = {
      title: req.file.originalname.replace('.mp3', ''),
      path: `/src/${req.file.filename}`
    };

    // Actualizar el archivo config.json con la información de la nueva canción
    fs.writeFileSync(
      path.join(__dirname, 'src', 'config.json'),
      JSON.stringify(currentSongInfo, null, 2)
    );

    res.json({
      success: true,
      message: 'Archivo subido con éxito',
      song: currentSongInfo
    });
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el archivo: ' + error.message
    });
  }
});

// Ruta para obtener la canción actual
app.get('/current-song', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'src', 'config.json');
    
    // Verificar si el archivo de configuración existe
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const songInfo = JSON.parse(configData);
      res.json(songInfo);
    } else {
      // Configuración predeterminada si el archivo no existe
      const defaultSong = {
        title: "El señor de la noche",
        path: "/src/El Señor de la Noche.mp3"
      };
      
      // Crear el archivo de configuración con datos predeterminados
      fs.writeFileSync(configPath, JSON.stringify(defaultSong, null, 2));
      
      res.json(defaultSong);
    }
  } catch (error) {
    console.error('Error al obtener la canción actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de la canción'
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
  
  // Asegurarse de que exista el archivo config.json cuando se inicia el servidor
  const configPath = path.join(__dirname, 'src', 'config.json');
  if (!fs.existsSync(configPath)) {
    const defaultSong = {
      title: "El señor de la noche",
      path: "/src/El Señor de la Noche.mp3"
    };
    
    try {
      fs.writeFileSync(configPath, JSON.stringify(defaultSong, null, 2));
      console.log('Archivo de configuración creado con éxito');
    } catch (error) {
      console.error('Error al crear el archivo de configuración:', error);
    }
  }
});