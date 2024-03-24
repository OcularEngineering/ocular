/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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