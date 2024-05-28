/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: 'standalone',
    async redirects() {
        return [
            {
                source: '/',
                destination: '/sign-in',
                permanent: false,
            },
        ]
    },
}

export default nextConfig