#!/bin/bash

echo "🧬 Starting SongDNA Search..."
echo

echo "📡 Starting Python backend..."
cd python
python app.py &
PYTHON_PID=$!
cd ..

echo "⏳ Waiting for backend to initialize..."
sleep 3

echo "🖥️ Starting Electron frontend..."
npm start

echo
echo "🛑 Shutting down..."
kill $PYTHON_PID 2>/dev/null
echo "Done!"

