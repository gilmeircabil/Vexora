import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/common/Button.js';
import { Compass, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 max-w-md mx-auto space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          Page Not Found
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          The requested tool or page does not exist or has been relocated.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link to="/">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </Link>
        <Link to="/tools">
          <Button variant="secondary" size="md">
            <Search className="w-4 h-4 mr-2" />
            Browse All Tools
          </Button>
        </Link>
      </div>
    </div>
  );
};
