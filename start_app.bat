@echo off
start cmd /k "cd backend && python main.py"
start cmd /k "cd frontend && npm run dev"
echo ETHIX AI is starting. Please wait 10 seconds and visit http://localhost:5173
pause
