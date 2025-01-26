// Script to capture Wyscout token
(function () {
    console.log('Token capture script started')

    // Function to get token from cookies
    function getWyscoutToken() {
        const cookies = document.cookie.split(';')
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=')
            if (name === 'aengine_dtk') {
                console.log('Found token in cookies')
                return value
            }
        }
        return null
    }

    // Function to check network requests for token
    function setupNetworkMonitoring() {
        console.log('Setting up network monitoring')
        const originalFetch = window.fetch
        window.fetch = async function (...args) {
            const response = await originalFetch.apply(this, args)
            const clonedResponse = response.clone()
            const token = clonedResponse.headers.get('x-wyscout-access-token')
            if (token) {
                console.log('Found token in fetch response')
                window.opener.postMessage({ type: 'WYSCOUT_TOKEN', token }, '*')
            }
            return response
        }

        const originalXHROpen = XMLHttpRequest.prototype.open
        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener('load', function () {
                const token = this.getResponseHeader('x-wyscout-access-token')
                if (token) {
                    console.log('Found token in XHR response')
                    window.opener.postMessage({ type: 'WYSCOUT_TOKEN', token }, '*')
                }
            })
            return originalXHROpen.apply(this, args)
        }
    }

    // Check for token immediately and periodically
    function checkAndSendToken() {
        console.log('Checking for token...')
        const token = getWyscoutToken()
        if (token) {
            console.log('Sending token to parent window')
            window.opener.postMessage({ type: 'WYSCOUT_TOKEN', token }, '*')
            console.log('Token sent, closing window')
            window.close()
        }
    }

    // Check immediately
    checkAndSendToken()

    // Check periodically
    const tokenCheckInterval = setInterval(checkAndSendToken, 1000)

    // Also check when receiving a message
    window.addEventListener('message', function (event) {
        console.log('Received message:', event.data)
        if (event.data?.type === 'CHECK_WYSCOUT_AUTH') {
            checkAndSendToken()
        }
    })

    // Cleanup interval if window is about to unload
    window.addEventListener('beforeunload', () => {
        clearInterval(tokenCheckInterval)
    })

    // Set up network monitoring
    setupNetworkMonitoring()

    console.log('Token capture script initialization complete')
})(); 