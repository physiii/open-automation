Set WshShell = WScript.CreateObject("WScript.Shell")
Return = WshShell.Run("node c:\node\media-server\media-server.js", 0, true)
Wscript.echo "node started"
