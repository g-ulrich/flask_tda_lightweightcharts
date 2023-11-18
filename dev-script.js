const { exec } = require('child_process');
const path = require('path');

// Start the Flask server
const flaskServer = exec('cd server && python app.py');

// Set the working directory for the ReactJS app
// const frontendDir = path.join(__dirname, 'frontend');

// Start the ReactJS app
const reactApp = exec('cd frontend && npm start');

// Start the Tailwind CSS watcher
const tailwindWatcher = exec('npx tailwindcss watch frontend/src/css/main.css -o frontend/dist/main.css');

// Log any errors from the child processes
flaskServer.stderr.on('data', (data) => {
  console.log(`-----------------[FLASK]-----------------\n${data}`);
});

reactApp.stderr.on('data', (data) => {
  console.log(`-----------------[REACTJS]-----------------\n${data}`);
});

tailwindWatcher.stderr.on('data', (data) => {
  console.log(`-----------------[TAILWINDCSS]-----------------\n${data}`);
});
