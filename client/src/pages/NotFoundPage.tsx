import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/common/Button.js';
import { Compass, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 max-w-md mx-auto space-y-6 text-[var(--theme-dirty-white)]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] flex items-center justify-center border border-[var(--theme-gray-border)] shadow-sm">
        <Compass className="w-8 h-8 stroke-[2]" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--theme-dirty-white)]">Page Not Found</h1>
        <p className="text-sm font-normal text-[var(--theme-gray-muted)]">
          The requested tool or page does not exist or has been relocated.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link to="/">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4 mr-2 stroke-[2.5]" />
            Go to Homepage
          </Button>
        </Link>
        <Link to="/tools">
          <Button variant="secondary" size="md">
            <Search className="w-4 h-4 mr-2 stroke-[2.5]" />
            Browse All Tools
          </Button>
        </Link>
      </div>
    </div>
  );
};
