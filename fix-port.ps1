# PowerShell script to kill process using port 5000
$port = 5000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Found process $process using port $port"
    Stop-Process -Id $process -Force
    Write-Host "Process killed successfully"
} else {
    Write-Host "No process found using port $port"
}

