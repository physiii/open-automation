Set WshShell = WScript.CreateObject("WScript.Shell")
Return = WshShell.Run("node C:\Users\Andy\home-gateway\gateway.js > C:\Users\Andy\gateway.log", 0, true)
Wscript.echo "node started"