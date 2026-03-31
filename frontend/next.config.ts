import type { NextConfig } from "next";

 const NextConfig = {
        webpack: (config: { externals: string[]; }) => {
          config.externals.push('pino-pretty', 'lokijs', 'encoding')
          return config
        }
      }

export default NextConfig;
