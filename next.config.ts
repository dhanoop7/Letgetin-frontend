import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth",
        permanent: true,
      },
      {
        source: "/recruiter/create-job",
        destination: "/recruiter/jobs/create",
        permanent: false,
      },
      {
        source: "/create-job",
        destination: "/recruiter/jobs/create",
        permanent: false,
      },
      {
        source: "/recruiter/jobs/new",
        destination: "/recruiter/jobs/create",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
