// Logger setup
export function createLogDiv() {
    const div = document.createElement('div')
    div.id = 'debug-log'
    div.style.position = 'fixed'
    div.style.bottom = '0'
    div.style.left = '0'
    div.style.width = '100%'
    div.style.maxHeight = '200px'
    div.style.overflowY = 'auto'
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    div.style.color = 'white'
    div.style.fontFamily = 'monospace'
    div.style.fontSize = '12px'
    div.style.padding = '10px'
    div.style.zIndex = '9999'

    // Add download button
    const downloadBtn = document.createElement('button')
    downloadBtn.textContent = 'Download Logs'
    downloadBtn.style.position = 'fixed'
    downloadBtn.style.bottom = '210px'
    downloadBtn.style.left = '10px'
    downloadBtn.style.zIndex = '9999'
    downloadBtn.onclick = () => {
        const logContent = Array.from(div.childNodes)
            .map(node => (node as HTMLDivElement).textContent)
            .join('')
        const blob = new Blob([logContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'wyscout-debug.log'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }
    document.body.appendChild(downloadBtn)
    document.body.appendChild(div)
    return div
}

export function writeLog(message: string) {
    const timestamp = new Date().toISOString()
    const logMessage = `${timestamp} ${message}\n`

    // Append to log div
    const logDiv = document.getElementById('debug-log') || createLogDiv()
    const logEntry = document.createElement('div')
    logEntry.textContent = logMessage
    logDiv.appendChild(logEntry)

    // Keep only last 100 entries
    while (logDiv.childNodes.length > 100) {
        logDiv.removeChild(logDiv.firstChild!)
    }

    console.log(message)
} 