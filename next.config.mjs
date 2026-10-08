/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    const backendOrigin = process.env.CRM_API_URL || (
      process.env.NODE_ENV === 'production'
        ? 'https://digiwebclub-crm-backend.onrender.com'
        : 'http://localhost:5000'
    );

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
