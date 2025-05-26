@echo off
echo Starting YumyFly Services...

echo Starting Backend 
cd backend
start cmd /k "npm run dev"

echo Starting recommandation Service...
cd .\model_ia
start cmd /k "python api_reco_hybrid.py"

echo Starting Frontend...
cd ..\..\frontend
start cmd /k "npm run dev"

echo All services started!