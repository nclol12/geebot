@echo off
title GeeBot discord bot
:l
node index.js
echo crash%date% %time%> log.txt
goto :l