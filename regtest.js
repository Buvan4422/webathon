const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/StudentRegistration', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const studentSchema = new mongoose.Schema({
  name: String,
  id: String,
  dob: Date,
  email: String,
  password: String,
});

const Student = mongoose.model('student', studentSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('StudentLogin');
});

app.get('/register', (req, res) => {
  res.render('Student_registration');
});

app.get('/Student', async (req, res) => {
  try {
    // Fetch data from the database (e.g., all student records)
    const students = await Student.find();
    console.log(students);
    // Render the 'Studentdet.ejs' template and pass the fetched student data
    res.render('Studentdet', { students });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/registerStudent', async (req, res) => {
  const studentData = req.body;

  try {
    const student = new Student(studentData);

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(studentData.password, 10);
    student.password = hashedPassword;

    const savedStudent = await student.save();

    if (savedStudent) {
      console.log('Student added:', savedStudent);
      res.redirect('/login');
    } else {
      console.log('No student data added.');
      res.status(500).send('Internal Server Error');
    }
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Student.findOne({ email });

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Redirect to the '/Student' route upon successful login
      res.redirect('/Student');
    } else {
      res.status(401).send('Incorrect password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
