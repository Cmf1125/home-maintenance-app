// Vercel serverless function to handle Apple Sign In POST callback

export default async function handler(req, res) {
    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Get Apple's POST data
        const { code, state, error, id_token, user } = req.body;
        
        console.log('Apple Sign In callback received:', { code, state, error, user });
        
        // Handle error case
        if (error) {
            const errorUrl = `https://thehomekeeper.com/?apple_error=${encodeURIComponent(error)}`;
            return res.redirect(302, errorUrl);
        }
        
        // Handle success case
        if (code) {
            let redirectUrl = `https://thehomekeeper.com/?apple_success=true&code=${encodeURIComponent(code)}`;
            
            // Add user info if provided
            if (user) {
                redirectUrl += `&user=${encodeURIComponent(JSON.stringify(user))}`;
            }
            
            if (state) {
                redirectUrl += `&state=${encodeURIComponent(state)}`;
            }
            
            return res.redirect(302, redirectUrl);
        }
        
        // No valid data received
        return res.redirect(302, 'https://thehomekeeper.com/?apple_error=no_data');
        
    } catch (error) {
        console.error('Apple Sign In callback error:', error);
        return res.redirect(302, `https://thehomekeeper.com/?apple_error=${encodeURIComponent(error.message)}`);
    }
}