import { defineEventHandler, readBody, getRequestIP, createError } from 'h3'

interface TurnstileVerifyResponse {
    success: boolean
    'error-codes'?: string[]
    challenge_ts?: string
    hostname?: string
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    
    let body
    try {
        body = await readBody(event)
    } catch (e) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request body'
        })
    }

    const token = body?.token

    if (!token) {
        return {
            success: false,
            error: 'Missing token'
        }
    }

    const secretKey = config.turnstileSecretKey as string

    if (!secretKey) {
        console.error('Turnstile secret key not configured')
        return {
            success: false,
            error: 'Server configuration error'
        }
    }

    try {
        // Get client IP for verification
        const clientIP = getRequestIP(event, { xForwardedFor: true }) || ''

        // Verify the token with Cloudflare
        const formData = new URLSearchParams()
        formData.append('secret', secretKey)
        formData.append('response', token)
        if (clientIP) {
            formData.append('remoteip', clientIP)
        }

        const response = await $fetch<TurnstileVerifyResponse>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        })

        if (response.success) {
            return {
                success: true
            }
        } else {
            console.warn('Turnstile verification failed:', response['error-codes'])
            return {
                success: false,
                error: 'Verification failed',
                codes: response['error-codes']
            }
        }
    } catch (error) {
        console.error('Turnstile verification error:', error)
        return {
            success: false,
            error: 'Verification request failed'
        }
    }
})
