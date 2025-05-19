@echo off
echo Setting up Brain Tumor Detection Application...

echo Installing Frontend Dependencies...
call npm install

echo Creating Python Virtual Environment...
cd backend
python -m venv venv
call venv\Scripts\activate

echo Installing Backend Dependencies...
pip install -r requirements.txt

echo Setup Complete!
echo To start the application, run start.bat
cd ..
