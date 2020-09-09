@echo off
title GeeBot discord bot
:l
node\node.exe index.js
echo crash%date% %time%> log.txt
goto :l