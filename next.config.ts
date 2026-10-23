import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

const projectRoot = typeof fs.realpathSync.native === "function"
  ? fs.realpathSync.native(process.cwd())
  : fs.realpathSync(process.cwd());

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/resume",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/auth?mode=signin",
        permanent: true,
      },
      {
        source: "/signin",
        destination: "/auth?mode=signin",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth?mode=signup",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth?mode=signup",
        permanent: true,
      },
      {
        source: "/recruiter",
        destination: "/recruiter/dashboard",
        permanent: false,
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
      {
        source: "/startup",
        destination: "/recruiter/startup/fundraising-pipeline",
        permanent: false,
      },
      {
        source: "/startup/fundraising",
        destination: "/recruiter/startup/fundraising-pipeline",
        permanent: false,
      },
      {
        source: "/startup/fundraising-pipeline",
        destination: "/recruiter/startup/fundraising-pipeline",
        permanent: false,
      },
      {
        source: "/startup/investors-connect",
        destination: "/recruiter/startup/investors-connect",
        permanent: false,
      },
      {
        source: "/recruiter/fundraising",
        destination: "/recruiter/startup/fundraising-pipeline",
        permanent: false,
      },
      {
        source: "/recruiter/fundraising-pipeline",
        destination: "/recruiter/startup/fundraising-pipeline",
        permanent: false,
      },
      {
        source: "/recruiter/investors-connect",
        destination: "/recruiter/startup/investors-connect",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
