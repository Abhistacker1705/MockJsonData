const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = 'db.json';

app.use(cors());
app.use(express.json());

// GET all doctors
app.get('/doctors', async (req, res) => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const doctors = JSON.parse(data).doctors;
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// POST a new doctor
app.post('/doctors', async (req, res) => {
  const newDoctor = req.body;
  const data = await fs.readFile(DB_FILE, 'utf8');
  const doctors = JSON.parse(data).doctors;
  doctors = doctors.map((doctor) => {
    if (doctor.name === newDoctor.name) {
      res.status(402).json({message: 'Doctor Already Exist '});
      return;
    }
  });
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const doctors = JSON.parse(data).doctors;
    newDoctor.id = String(doctors.length + 1);
    doctors.push(newDoctor);
    await fs.writeFile(DB_FILE, JSON.stringify({doctors}));
    res.status(201).json({message: 'Doctor created successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// book doctor appointment
app.put('/doctors/:id/availability', async (req, res) => {
  const doctorId = req.params.id;
  const updatedAvailability = req.body.availability;
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    let {doctors} = JSON.parse(data);
    doctors = doctors.map((doctor) => {
      if (doctor.id === doctorId) {
        doctor.availability = updatedAvailability;
      }
      console.log('updatedDoc', doctor);
      return doctor;
    });
    await fs.writeFile(DB_FILE, JSON.stringify({doctors}));
    res.json({message: 'Doctor availability updated successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
