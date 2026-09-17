const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let alumnos = [];


function validarAlumno(nombre, notas) {
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') return false;
  if (!Array.isArray(notas) || notas.length !== 3) return false;
  
  // Validar que las notas sean números válidos (entre 1 y 10)
  for (let nota of notas) {
    if (typeof nota !== 'number' || nota < 1 || nota > 10) return false;
  }
  return true;
}

function calcularDatosDerivados(notas) {
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  const promedio = parseFloat((suma / notas.length).toFixed(2));
  
  let condicion = '';
  if (promedio < 6) {
    condicion = 'reprobado';
  } else if (promedio >= 6 && promedio < 8) {
    condicion = 'aprobado';
  } else {
    condicion = 'promocionado';
  }

  return { promedio, condicion };
}


// 1. Obtener todos los alumnos
app.get('/api/alumnos', (req, res) => {
  res.json(alumnos);
});

// 2. Obtener un alumno en particular (con datos derivados)
app.get('/api/alumnos/:nombre', (req, res) => {
  const nombreBuscado = req.params.nombre.toLowerCase();
  const alumno = alumnos.find(a => a.nombre.toLowerCase() === nombreBuscado);

  if (!alumno) {
    return res.status(404).json({ error: 'Alumno no encontrado' });
  }

  const { promedio, condicion } = calcularDatosDerivados(alumno.notas);

  // Retornamos los datos almacenados + los derivados
  res.json({
    nombre: alumno.nombre,
    notas: alumno.notas,
    promedio,
    condicion
  });
});

// 3. Crear un nuevo alumno
app.post('/api/alumnos', (req, res) => {
  const { nombre, notas } = req.body;

  if (!validarAlumno(nombre, notas)) {
    return res.status(400).json({ error: 'Datos inválidos. Se requiere un nombre y un arreglo de 3 notas.' });
  }

  const existe = alumnos.some(a => a.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    return res.status(409).json({ error: 'Ya existe un alumno con ese nombre' });
  }

  const nuevoAlumno = { nombre, notas };
  alumnos.push(nuevoAlumno);

  res.status(201).json(nuevoAlumno);
});

// 4. Modificar un alumno existente
app.put('/api/alumnos/:nombre', (req, res) => {
  const nombreBuscado = req.params.nombre.toLowerCase();
  const { nombre: nuevoNombre, notas: nuevasNotas } = req.body;

  if (!validarAlumno(nuevoNombre, nuevasNotas)) {
    return res.status(400).json({ error: 'Datos inválidos para la actualización.' });
  }

  const index = alumnos.findIndex(a => a.nombre.toLowerCase() === nombreBuscado);
  if (index === -1) {
    return res.status(404).json({ error: 'Alumno no encontrado' });
  }

  // Si le cambiaron el nombre, hay que verificar que el nuevo no colisione con otro existente
  if (nuevoNombre.toLowerCase() !== nombreBuscado) {
    const existeNuevo = alumnos.some(a => a.nombre.toLowerCase() === nuevoNombre.toLowerCase());
    if (existeNuevo) {
      return res.status(409).json({ error: 'El nuevo nombre ya está registrado por otro alumno' });
    }
  }

  alumnos[index] = { nombre: nuevoNombre, notas: nuevasNotas };
  res.json(alumnos[index]);
});

// 5. Eliminar un alumno
app.delete('/api/alumnos/:nombre', (req, res) => {
  const nombreBuscado = req.params.nombre.toLowerCase();
  const index = alumnos.findIndex(a => a.nombre.toLowerCase() === nombreBuscado);

  if (index === -1) {
    return res.status(404).json({ error: 'Alumno no encontrado' });
  }

  alumnos.splice(index, 1); 
  res.json({ mensaje: 'Alumno eliminado correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});