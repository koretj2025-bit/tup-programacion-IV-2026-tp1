const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Arreglo interno para guardar las tareas
let tareas = [];

function validarTarea(nombre, completada) {
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') return false;
  if (typeof completada !== 'boolean') return false;
  return true;
}

//Endpoints 

// 1. Obtener tareas
app.get('/api/tareas', (req, res) => {
  const { completada } = req.query;


  if (completada === undefined) {
    return res.json(tareas);
  }


  const esCompletada = completada === 'true';
  const tareasFiltradas = tareas.filter(t => t.completada === esCompletada);
  
  res.json(tareasFiltradas);
});

// 2. Obtener una tarea en particular por su nombre
app.get('/api/tareas/:nombre', (req, res) => {
  const nombreBuscado = req.params.nombre.toLowerCase();
  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombreBuscado);

  if (!tarea) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  res.json(tarea);
});

// 3. Crear una nueva tarea
app.post('/api/tareas', (req, res) => {
  const { nombre, completada } = req.body;

  if (!validarTarea(nombre, completada)) {
    return res.status(400).json({ 
      error: 'Datos inválidos. Se requiere un nombre (texto) y completada (booleano).' 
    });
  }

  const existe = tareas.some(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    return res.status(409).json({ error: 'Ya existe una tarea con ese nombre' });
  }

  const nuevaTarea = { nombre: nombre.trim(), completada };
  tareas.push(nuevaTarea);

  res.status(201).json(nuevaTarea);
});

// 4. Modificar una tarea existente
app.put('/api/tareas/:nombre', (req, res) => {
  const nombreBuscado = req.params.nombre.toLowerCase();
  const { nombre: nuevoNombre, completada: nuevaCompletada } = req.body;

  if (!validarTarea(nuevoNombre, nuevaCompletada)) {
    return res.status(400).json({ error: 'Datos inválidos para la actualización.' });
  }

  const index = tareas.findIndex(t => t.nombre.toLowerCase() === nombreBuscado);
  if (index === -1) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  // Verificar colisión de nombres si se intenta cambiar el nombre
  if (nuevoNombre.toLowerCase() !== nombreBuscado) {
    const existeNuevo = tareas.some(t => t.nombre.toLowerCase() === nuevoNombre.toLowerCase());
    if (existeNuevo) {
      return res.status(409).json({ error: 'El nuevo nombre ya pertenece a otra tarea' });
    }
  }

  tareas[index] = { nombre: nuevoNombre.trim(), completada: nuevaCompletada };
  res.json(tareas[index]);
});

// 5. Eliminar una tarea
app.delete('/api/tareas/:nombre', (req, res) => {
  const nombreBuscado = req.params.nombre.toLowerCase();
  const index = tareas.findIndex(t => t.nombre.toLowerCase() === nombreBuscado);

  if (index === -1) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  tareas.splice(index, 1);
  res.json({ mensaje: 'Tarea eliminada correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});