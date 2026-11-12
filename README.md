When you want to run RescueTrack on another computer, you don't need to create the project files again. You only need to download your GitHub project, install dependencies, and create your private .env file.

Here is the complete process.
1. Install the required software
On the new computer, install:
1. Node.js (LTS): https://nodejs.org/
2. Git: https://git-scm.com/
3. VS Code: https://code.visualstudio.com/
Open Git Bash and check:
node -v
npm -v
git --version


2. Download your RescueTrack project
Open Git Bash and run:
cd Downloads
git clone https://github.com/harshini-200627/RescueTrack.git
cd RescueTrack


Your project will be downloaded with this structure:
RescueTrack/
│
├── frontend/
│
├── rescuetrack-backend-stage1/
│   └── rescuetrack-backend/
│
├── .gitignore
└── README.md


3. Create files that are NOT in GitHub
You only need to create your actual .env file.

Go to:
RescueTrack/
└── rescuetrack-backend-stage1/
    └── rescuetrack-backend/


Inside rescuetrack-backend, create a new file named exactly:

.env

Put your actual credentials in it:
PORT=5000
MONGODB_URI=your_actual_mongodb_uri
JWT_SECRET=your_saved_jwt_secret



Important
 This file is intentionally not uploaded to GitHub.
You can retrieve your credentials from your encrypted private backup.
4. Install frontend dependencies
Open Git Bash in the main RescueTrack folder:
cd ~/Downloads/RescueTrack/frontend
npm install
npm run dev


Wait until installation finishes.
5. Install backend dependencies
Open another Git Bash terminal:
cd ~/Downloads/RescueTrack/rescuetrack-backend-stage1/rescuetrack-backend
npm install
npm run dev

If your project was cloned somewhere else, adjust the path accordingly.
6. Configure MongoDB Atlas
Before starting the backend:
1. Open MongoDB Atlas.
2. Go to Network Access.
3. Add the new computer's public IP address.
4. Make sure your database user and password are still valid.
You can reuse your existing MongoDB database and connection string.
7. Run RescueTrack
Terminal 1 – Backend
cd ~/Downloads/RescueTrack/rescuetrack-backend-stage1/rescuetrack-backend
npm start



Terminal 2 – Frontend
cd ~/Downloads/RescueTrack/frontend
npm run dev


If npm start is not defined in your backend package.json, run npm run to see the available scripts and choose the appropriate start command.

Open the frontend URL shown in the terminal, usually:

http://localhost:5173
8. Files you need to create on another computer
File	Create?
.env	Yes
.env.example	Already in GitHub
.gitignore	Already in GitHub
package.json	Already in GitHub
package-lock.json	Already in GitHub
node_modules	Created by npm install
React source files	Already in GitHub
Backend source files	Already in GitHub


Your complete checklist
Setup progress
0/9



[ ] Install Node.js, Git and VS Code
[ ] Clone RescueTrack from GitHub
[ ] Retrieve encrypted .env backup
[ ] Create backend .env file
[ ] Run npm install in frontend
[ ] Run npm install in backend
[ ] Add new computer IP in MongoDB Atlas
[ ] Start backend
[ ] Start frontend

One important note: Your current RescueTrack frontend may still use simulated development data in some areas. Running it on another computer does not automatically make those features live.

You can follow these same steps whenever you download RescueTrack onto a new computer.
