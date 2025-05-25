```typescript
import Link from 'next/link';
import { Briefcase, Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-20 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Briefcase className="h-6 w-6 text-brand-blue hidden md:inline" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {currentYear}{' '}
            <Link
              href="/"
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              ConstructCRM
            </Link>
            . All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Twitter size={18} />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="#" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github size={18} />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="#" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Linkedin size={18} />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
```