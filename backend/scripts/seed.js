#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const moment = require('moment');
require('dotenv').config();

// Set locale for Greek data
faker.locale = 'el';

// Models
const User = require('../models/User');
const Client = require('../models/Client');
const Court = require('../models/Court');
const Deadline = require('../models/Deadline');
const Appointment = require('../models/Appointment');
const Financial = require('../models/Financial');
const Document = require('../models/Document');
const Pending = require('../models/Pending');
const Contact = require('../models/Contact');
const Communication = require('../models/Communication');
const Settings = require('../models/Settings');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const CommunicationTemplate = require('../models/CommunicationTemplate');

// Greek data
const greekFirstNames = ['Γιώργος', 'Μαρία', 'Κώστας', 'Ελένη', 'Νίκος', 'Κατερίνα', 'Δημήτρης', 'Σοφία', 'Παναγιώτης', 'Αννα'];
const greekLastNames = ['Παπαδόπουλος', 'Παπαδάκης', 'Γεωργίου', 'Νικολάου', 'Αντωνίου', 'Κωνσταντίνου', 'Δημητρίου', 'Ιωάννου'];
const greekCities = ['Αθήνα', 'Θεσσαλονίκη', 'Πάτρα', 'Ηράκλειο', 'Λάρισα', 'Βόλος', 'Ιωάννινα', 'Κόρινθος', 'Χαλκίδα', 'Ρόδος'];
const greekStreets = ['Ερμού', 'Πανεπιστημίου', 'Σταδίου', 'Ακαδημίας', 'Πατησίων', 'Κηφισίας', 'Μεσογείων', 'Συγγρού', 'Αμαλίας', 'Βασιλίσσης Σοφίας'];

const courtTypes = [
  'ανακοπή 632 ΚΠολΔ',
  'ανακοπή 933 ΚΠολΔ',
  'ανακοπή 954 ΚΠολΔ',
  'αγωγή',
  'έφεση',
  'αίτηση αναστολής'
];

const courtLevels = ['Ειρηνοδικείο', 'Πρωτοδικείο', 'Εφετείο', 'Άρειος Πάγος'];
const courtCompositions = ['Μονομελές', 'Πολυμελές', 'Τριμελές'];

// Command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';
const options = {
  users: parseInt(args.find(arg => arg.startsWith('--users='))?.split('=')[1]) || 3,
  clients: parseInt(args.find(arg => arg.startsWith('--clients='))?.split('=')[1]) || 20,
  courts: parseInt(args.find(arg => arg.startsWith('--courts='))?.split('=')[1]) || 30,
  clear: args.includes('--clear'),
  verbose: args.includes('--verbose')
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Helper functions
const randomGreekName = () => ({
  firstName: faker.random.arrayElement(greekFirstNames),
  lastName: faker.random.arrayElement(greekLastNames)
});

const randomGreekAddress = () => ({
  street: faker.random.arrayElement(greekStreets),
  number: faker.datatype.number({ min: 1, max: 200 }).toString(),
  city: faker.random.arrayElement(greekCities),
  postalCode: faker.datatype.number({ min: 10000, max: 99999 }).toString()
});

const randomGreekPhone = () => {
  const prefix = faker.random.arrayElement(['210', '211', '212', '213', '214', '215']);
  return `${prefix}${faker.datatype.number({ min: 1000000, max: 9999999 })}`;
};

const randomGreekMobile = () => {
  const prefix = faker.random.arrayElement(['69', '693', '694', '695', '697', '698']);
  return `${prefix}${faker.datatype.number({ min: 10000000, max: 99999999 })}`;
};

const randomVAT = () => {
  return faker.datatype.number({ min: 100000000, max: 999999999 }).toString();
};

// Clear database
const clearDatabase = async () => {
  console.log('Clearing database...');
  
  const collections = [
    User, Client, Court, Deadline, Appointment, Financial,
    Document, Pending, Contact, Communication, Settings,
    AvailabilitySlot, CommunicationTemplate
  ];
  
  for (const Model of collections) {
    await Model.deleteMany({});
    if (options.verbose) {
      console.log(`  ✓ Cleared ${Model.collection.name}`);
    }
  }
  
  console.log('✓ Database cleared');
};

// Seed functions
const seedUsers = async () => {
  console.log(`Creating ${options.users} users...`);
  const users = [];
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    firstName: 'Διαχειριστής',
    lastName: 'Συστήματος',
    email: 'admin@legalcrm.gr',
    password: adminPassword,
    role: 'admin',
    isActive: true,
    phone: randomGreekPhone(),
    mobile: randomGreekMobile(),
    address: randomGreekAddress(),
    vatNumber: randomVAT(),
    barAssociation: 'Δικηγορικός Σύλλογος Αθηνών',
    barNumber: 'ΑΜ12345',
    lawFirmName: 'Νομικό Γραφείο Demo',
    twoFactorEnabled: false
  });
  users.push(admin);
  console.log('  ✓ Admin user created (admin@legalcrm.gr / admin123)');
  
  // Create supervisor
  const supervisorPassword = await bcrypt.hash('supervisor123', 10);
  const supervisor = await User.create({
    firstName: 'Επόπτης',
    lastName: 'Δοκιμών',
    email: 'supervisor@legalcrm.gr',
    password: supervisorPassword,
    role: 'supervisor',
    isActive: true,
    phone: randomGreekPhone(),
    mobile: randomGreekMobile(),
    address: randomGreekAddress()
  });
  users.push(supervisor);
  console.log('  ✓ Supervisor user created (supervisor@legalcrm.gr / supervisor123)');
  
  // Create secretary
  const secretaryPassword = await bcrypt.hash('secretary123', 10);
  const secretary = await User.create({
    firstName: 'Γραμματέας',
    lastName: 'Δοκιμών',
    email: 'secretary@legalcrm.gr',
    password: secretaryPassword,
    role: 'secretary',
    isActive: true,
    phone: randomGreekPhone(),
    mobile: randomGreekMobile(),
    address: randomGreekAddress()
  });
  users.push(secretary);
  console.log('  ✓ Secretary user created (secretary@legalcrm.gr / secretary123)');
  
  return users;
};

const seedClients = async (users) => {
  console.log(`Creating ${options.clients} clients...`);
  const clients = [];
  
  for (let i = 0; i < options.clients; i++) {
    const user = faker.random.arrayElement(users);
    const name = randomGreekName();
    const isCompany = faker.datatype.boolean();
    
    const client = await Client.create({
      user: user._id,
      firstName: isCompany ? '' : name.firstName,
      lastName: isCompany ? '' : name.lastName,
      companyName: isCompany ? `${name.lastName} ΑΕ` : undefined,
      fatherName: isCompany ? '' : faker.random.arrayElement(greekFirstNames),
      email: faker.internet.email(name.firstName, name.lastName).toLowerCase(),
      phone: randomGreekPhone(),
      mobile: randomGreekMobile(),
      address: randomGreekAddress(),
      vatNumber: randomVAT(),
      folderNumber: `${1000 + i}`,
      type: isCompany ? 'company' : 'individual',
      registrationDate: faker.date.past(2),
      notes: faker.lorem.sentence(),
      balance: faker.datatype.float({ min: -5000, max: 10000, precision: 0.01 })
    });
    
    clients.push(client);
    
    // Create contact for client
    await Contact.create({
      user: user._id,
      client: client._id,
      type: 'client',
      firstName: client.firstName || client.companyName,
      lastName: client.lastName || '',
      email: client.email,
      phone: client.phone,
      mobile: client.mobile,
      address: client.address,
      vatNumber: client.vatNumber,
      nameDay: faker.datatype.boolean() ? {
        day: faker.datatype.number({ min: 1, max: 28 }),
        month: faker.datatype.number({ min: 1, max: 12 })
      } : undefined
    });
    
    // Create client user account
    if (faker.datatype.boolean()) {
      const clientPassword = await bcrypt.hash('client123', 10);
      await User.create({
        firstName: client.firstName || client.companyName,
        lastName: client.lastName || '',
        email: client.email,
        password: clientPassword,
        role: 'client',
        isActive: true,
        relatedClient: client._id
      });
    }
  }
  
  console.log(`  ✓ Created ${clients.length} clients`);
  return clients;
};

const seedCourts = async (users, clients) => {
  console.log(`Creating ${options.courts} courts...`);
  const courts = [];
  
  for (let i = 0; i < options.courts; i++) {
    const user = faker.random.arrayElement(users);
    const client = faker.random.arrayElement(clients.filter(c => c.user.equals(user._id)));
    
    if (!client) continue;
    
    const date = faker.date.between(
      moment().subtract(6, 'months').toDate(),
      moment().add(6, 'months').toDate()
    );
    
    const court = await Court.create({
      user: user._id,
      client: client._id,
      court: `${faker.random.arrayElement(courtLevels)} ${faker.random.arrayElement(greekCities)}`,
      level: faker.random.arrayElement(['first', 'appeal', 'supreme']),
      composition: faker.random.arrayElement(courtCompositions),
      type: faker.random.arrayElement(courtTypes),
      date: date,
      time: `${faker.datatype.number({ min: 9, max: 14 })}:${faker.random.arrayElement(['00', '30'])}`,
      hearing: faker.random.arrayElement(['α\' συζήτηση', 'β\' συζήτηση']),
      opponent: `${randomGreekName().firstName} ${randomGreekName().lastName}`,
      status: date < new Date() ? 
        faker.random.arrayElement(['completed', 'postponed', 'canceled']) : 
        'scheduled',
      autoDeadlines: true,
      notes: faker.lorem.sentence()
    });
    
    courts.push(court);
    
    // Create automatic deadlines
    if (court.autoDeadlines && court.status === 'scheduled') {
      await Deadline.create({
        user: user._id,
        client: client._id,
        court: court._id,
        name: 'Κατάθεση προτάσεων',
        dueDate: moment(court.date).subtract(20, 'days').toDate(),
        priority: 'high',
        status: 'pending',
        category: 'court'
      });
    }
  }
  
  console.log(`  ✓ Created ${courts.length} courts`);
  return courts;
};

const seedDeadlines = async (users, clients, courts) => {
  console.log('Creating deadlines...');
  const deadlines = [];
  
  for (const user of users) {
    const userClients = clients.filter(c => c.user.equals(user._id));
    
    for (let i = 0; i < 10; i++) {
      const client = faker.random.arrayElement(userClients);
      if (!client) continue;
      
      const deadline = await Deadline.create({
        user: user._id,
        client: client._id,
        name: faker.random.arrayElement([
          'Κατάθεση ανακοπής',
          'Προσκόμιση εγγράφων',
          'Υποβολή προτάσεων',
          'Προθεσμία προσθήκης',
          'Καταβολή δικαστικού ενσήμου'
        ]),
        dueDate: faker.date.between(
          moment().subtract(1, 'month').toDate(),
          moment().add(3, 'months').toDate()
        ),
        priority: faker.random.arrayElement(['low', 'medium', 'high', 'urgent']),
        status: faker.random.arrayElement(['pending', 'completed', 'overdue']),
        category: faker.random.arrayElement(['court', 'administrative', 'financial', 'other']),
        notes: faker.lorem.sentence()
      });
      
      deadlines.push(deadline);
    }
  }
  
  console.log(`  ✓ Created ${deadlines.length} deadlines`);
  return deadlines;
};

const seedAppointments = async (users, clients) => {
  console.log('Creating appointments...');
  const appointments = [];
  
  for (const user of users) {
    const userClients = clients.filter(c => c.user.equals(user._id));
    
    // Create availability slots
    for (let day = 1; day <= 5; day++) { // Monday to Friday
      await AvailabilitySlot.create({
        user: user._id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        duration: 60,
        appointmentTypes: ['in-person', 'online'],
        isActive: true
      });
    }
    
    // Create appointments
    for (let i = 0; i < 15; i++) {
      const client = faker.random.arrayElement(userClients);
      if (!client) continue;
      
      const date = faker.date.between(
        moment().subtract(1, 'month').toDate(),
        moment().add(1, 'month').toDate()
      );
      
      const appointment = await Appointment.create({
        user: user._id,
        client: client._id,
        date: date,
        duration: faker.random.arrayElement([30, 60, 90]),
        type: faker.random.arrayElement(['in-person', 'online']),
        status: date < new Date() ? 
          faker.random.arrayElement(['completed', 'canceled', 'no-show']) : 
          'scheduled',
        purpose: faker.random.arrayElement([
          'Αρχική συνάντηση',
          'Συζήτηση υπόθεσης',
          'Υπογραφή εγγράφων',
          'Ενημέρωση πορείας',
          'Νομική συμβουλή'
        ]),
        notes: faker.lorem.sentence(),
        location: faker.datatype.boolean() ? 'Γραφείο' : undefined,
        meetingLink: faker.datatype.boolean() ? 'https://meet.google.com/abc-defg-hij' : undefined,
        paid: faker.datatype.boolean(),
        amount: faker.datatype.boolean() ? faker.datatype.number({ min: 50, max: 200 }) : 0
      });
      
      appointments.push(appointment);
    }
  }
  
  console.log(`  ✓ Created ${appointments.length} appointments`);
  return appointments;
};

const seedFinancials = async (users, clients) => {
  console.log('Creating financial records...');
  const financials = [];
  
  for (const user of users.filter(u => u.role !== 'secretary')) {
    const userClients = clients.filter(c => c.user.equals(user._id));
    
    for (const client of userClients) {
      // Create some transactions
      const transactionCount = faker.datatype.number({ min: 3, max: 10 });
      
      for (let i = 0; i < transactionCount; i++) {
        const type = faker.random.arrayElement(['income', 'expense']);
        const category = type === 'income' ? 
          faker.random.arrayElement(['fee', 'retainer', 'consultation', 'court-fee']) :
          faker.random.arrayElement(['court-costs', 'office', 'travel', 'other']);
        
        const financial = await Financial.create({
          user: user._id,
          client: client._id,
          type: type,
          category: category,
          amount: faker.datatype.float({ min: 50, max: 5000, precision: 0.01 }),
          vatRate: 24,
          description: faker.lorem.sentence(),
          date: faker.date.past(1),
          paymentMethod: faker.random.arrayElement(['cash', 'bank-transfer', 'card', 'check']),
          invoiceNumber: type === 'income' ? `INV-${faker.datatype.number({ min: 1000, max: 9999 })}` : undefined,
          status: faker.random.arrayElement(['pending', 'completed', 'canceled'])
        });
        
        financials.push(financial);
      }
    }
  }
  
  console.log(`  ✓ Created ${financials.length} financial records`);
  return financials;
};

const seedDocuments = async (users, clients) => {
  console.log('Creating documents...');
  const documents = [];
  
  const documentTypes = [
    { name: 'Αγωγή', category: 'court-document' },
    { name: 'Ανακοπή', category: 'court-document' },
    { name: 'Προτάσεις', category: 'court-document' },
    { name: 'Εξουσιοδότηση', category: 'authorization' },
    { name: 'Συμβόλαιο', category: 'contract' },
    { name: 'Τιμολόγιο', category: 'invoice' }
  ];
  
  for (const user of users) {
    const userClients = clients.filter(c => c.user.equals(user._id));
    
    for (let i = 0; i < 20; i++) {
      const client = faker.random.arrayElement(userClients);
      if (!client) continue;
      
      const docType = faker.random.arrayElement(documentTypes);
      
      const document = await Document.create({
        user: user._id,
        client: client._id,
        title: `${docType.name} - ${client.lastName || client.companyName}`,
        category: docType.category,
        filename: `${docType.name.toLowerCase()}_${Date.now()}.pdf`,
        mimeType: 'application/pdf',
        size: faker.datatype.number({ min: 100000, max: 5000000 }),
        uploadedBy: user._id,
        uploadDate: faker.date.past(1),
        description: faker.lorem.sentence(),
        tags: faker.random.arrayElements(['σημαντικό', 'επείγον', 'εκκρεμές', 'ολοκληρωμένο'], 2),
        version: 1,
        isWatermarked: docType.category === 'court-document'
      });
      
      documents.push(document);
    }
  }
  
  console.log(`  ✓ Created ${documents.length} documents`);
  return documents;
};

const seedPendings = async (users, clients) => {
  console.log('Creating pending tasks...');
  const pendings = [];
  
  const taskNames = [
    'Τηλεφωνική επικοινωνία με εντολέα',
    'Σύνταξη εγγράφου',
    'Έρευνα νομολογίας',
    'Επίσκεψη σε δημόσια υπηρεσία',
    'Προετοιμασία φακέλου',
    'Μελέτη δικογραφίας'
  ];
  
  for (const user of users) {
    const userClients = clients.filter(c => c.user.equals(user._id));
    
    for (let i = 0; i < 8; i++) {
      const client = faker.random.arrayElement(userClients);
      
      const pending = await Pending.create({
        user: user._id,
        client: client ? client._id : undefined,
        name: faker.random.arrayElement(taskNames),
        description: faker.lorem.sentence(),
        dueDate: faker.date.between(
          moment().subtract(1, 'week').toDate(),
          moment().add(2, 'weeks').toDate()
        ),
        priority: faker.random.arrayElement(['low', 'medium', 'high']),
        status: faker.random.arrayElement(['pending', 'in-progress', 'completed']),
        category: faker.random.arrayElement(['communication', 'documentation', 'research', 'administrative'])
      });
      
      pendings.push(pending);
    }
  }
  
  console.log(`  ✓ Created ${pendings.length} pending tasks`);
  return pendings;
};

const seedCommunications = async (users, clients) => {
  console.log('Creating communications...');
  const communications = [];
  
  for (const user of users) {
    const userClients = clients.filter(c => c.user.equals(user._id));
    
    for (const client of userClients.slice(0, 10)) {
      const commCount = faker.datatype.number({ min: 2, max: 8 });
      
      for (let i = 0; i < commCount; i++) {
        const communication = await Communication.create({
          user: user._id,
          client: client._id,
          type: faker.random.arrayElement(['phone', 'email', 'sms', 'meeting']),
          direction: faker.random.arrayElement(['incoming', 'outgoing']),
          date: faker.date.past(1),
          duration: faker.datatype.number({ min: 5, max: 60 }),
          subject: faker.lorem.sentence(),
          content: faker.lorem.paragraph(),
          attachments: []
        });
        
        communications.push(communication);
      }
    }
  }
  
  console.log(`  ✓ Created ${communications.length} communications`);
  return communications;
};

const seedSettings = async (users) => {
  console.log('Creating settings...');
  
  for (const user of users.filter(u => u.role === 'admin')) {
    const settings = await Settings.create({
      user: user._id,
      notifications: {
        email: {
          enabled: true,
          provider: 'smtp',
          smtp: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: 'noreply@legalcrm.gr',
              pass: 'demo-password'
            }
          }
        },
        sms: {
          enabled: false,
          provider: 'twilio'
        },
        deadlineReminders: {
          enabled: true,
          daysBefore: [30, 15, 7, 3, 1],
          email: true,
          sms: false
        },
        courtReminders: {
          enabled: true,
          daysBefore: [7, 3, 1],
          email: true,
          sms: true,
          notifyClient: true
        }
      },
      appointments: {
        duration: 60,
        bufferTime: 15,
        allowOnlineBooking: true,
        requirePayment: true,
        paymentAmount: 80,
        cancellationHours: 24
      },
      financial: {
        currency: 'EUR',
        vatRate: 24,
        invoicePrefix: 'INV',
        paymentTerms: 30
      },
      system: {
        language: 'el',
        timezone: 'Europe/Athens',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      }
    });
    
    console.log(`  ✓ Created settings for ${user.email}`);
  }
};

const seedTemplates = async (users) => {
  console.log('Creating communication templates...');
  
  const defaultTemplates = CommunicationTemplate.getDefaultTemplates();
  
  for (const user of users.filter(u => u.role !== 'client')) {
    for (const template of defaultTemplates) {
      await CommunicationTemplate.create({
        ...template,
        user: user._id,
        isDefault: true
      });
    }
    
    console.log(`  ✓ Created ${defaultTemplates.length} templates for ${user.email}`);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    
    if (options.clear) {
      await clearDatabase();
    }
    
    console.log('\n🌱 Starting seed process...\n');
    
    // Seed in order
    const users = await seedUsers();
    const clients = await seedClients(users);
    const courts = await seedCourts(users, clients);
    const deadlines = await seedDeadlines(users, clients, courts);
    const appointments = await seedAppointments(users, clients);
    const financials = await seedFinancials(users, clients);
    const documents = await seedDocuments(users, clients);
    const pendings = await seedPendings(users, clients);
    const communications = await seedCommunications(users, clients);
    await seedSettings(users);
    await seedTemplates(users);
    
    console.log('\n✅ Seed completed successfully!\n');
    
    // Summary
    console.log('📊 Summary:');
    console.log(`  • Users: ${users.length}`);
    console.log(`  • Clients: ${clients.length}`);
    console.log(`  • Courts: ${courts.length}`);
    console.log(`  • Deadlines: ${deadlines.length}`);
    console.log(`  • Appointments: ${appointments.length}`);
    console.log(`  • Financial records: ${financials.length}`);
    console.log(`  • Documents: ${documents.length}`);
    console.log(`  • Pending tasks: ${pendings.length}`);
    console.log(`  • Communications: ${communications.length}`);
    
    console.log('\n🔐 Test Accounts:');
    console.log('  • Admin: admin@legalcrm.gr / admin123');
    console.log('  • Supervisor: supervisor@legalcrm.gr / supervisor123');
    console.log('  • Secretary: secretary@legalcrm.gr / secretary123');
    console.log('  • Clients: any client email / client123');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  if (command === 'help') {
    console.log('Legal CRM Seed Tool\n');
    console.log('Usage:');
    console.log('  node seed.js [options]\n');
    console.log('Options:');
    console.log('  --clear           Clear database before seeding');
    console.log('  --users=<n>       Number of users to create (default: 3)');
    console.log('  --clients=<n>     Number of clients to create (default: 20)');
    console.log('  --courts=<n>      Number of courts to create (default: 30)');
    console.log('  --verbose         Show detailed output\n');
    console.log('Examples:');
    console.log('  node seed.js --clear');
    console.log('  node seed.js --users=5 --clients=50 --verbose');
  } else {
    main();
  }
}

module.exports = { seedUsers, seedClients, seedCourts };
