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

// GET a doctor's availability data
app.get('/doctors/:name/availability', async (req, res) => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const doctors = JSON.parse(data).doctors;
    const existingDoctor = doctors.find(
      (doctor) => doctor.name === req.params.name
    );
    if (existingDoctor) {
      return res.status(200).json(existingDoctor);
    } else return res.status(402).json({message: 'No user found'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// POST a new doctor
app.post('/doctors', async (req, res) => {
  const newDoctor = req.body;
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const doctors = JSON.parse(data).doctors;
    const existingDoctor = doctors.find(
      (doctor) => doctor.name === req.body.name
    );
    if (existingDoctor) {
      doctors = doctors.map((doctor) => {
        if (doctor.name === existingDoctor.name) {
          doctor.availability = newDoctor.availability;
        }
        return doctor;
      });
      await fs.writeFile(DB_FILE, JSON.stringify({doctors}));
      res.json({message: 'Availability updated successfully'});
    }
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
