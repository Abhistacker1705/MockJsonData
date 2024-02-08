const jsonServer = require('json-server'); // importing json-server library
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080; //  chose port from here like 8080, 3001

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post('/book-appointment', (req, res) => {
  const {doctorId, day, startTime} = req.body;

  // Access the db object
  const db = router.db;

  // Find the doctor by ID
  const doctor = db.get('doctors').find({id: doctorId}).value();

  if (!doctor) {
    return res.status(404).json({error: 'Doctor not found'});
  }

  // Find the availability slot to update
  const availabilitySlot = doctor.availability[day].find(
    (slot) => slot.start === startTime
  );
  if (!availabilitySlot) {
    return res.status(404).json({error: 'Appointment slot not found'});
  }

  // Update the booked status
  availabilitySlot.booked = true;

  // Save the changes
  db.get('bookAppointment').push({doctorId, day, startTime}).write();

  // Return success response
  res.json({message: 'Appointment booked successfully'});
});

// Use custom render function to handle responses
server.use((req, res, next) => {
  if (req.originalUrl === '/book-appointment') {
    res.status(200).jsonp(res.locals.data);
  } else {
    next();
  }
});

server.use(router);

server.listen(port);
