@echo off
echo SMSAサイト起動中...

start "http-server" cmd /k "cd C:\recruit-mock && npx http-server -p 8080"

timeout /t 3 /nobreak > nul

start "ngrok" cmd /k "ngrok http 8080"

echo 起動しました。ngrokのウィンドウに表示されたURLを共有してください。
