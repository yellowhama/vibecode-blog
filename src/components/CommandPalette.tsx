import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Search, MonitorPlay, FileText, ChevronRight } from "lucide-react";
import "./command.css"; // We will add custom styles here

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    // Custom event triggered by search button in Header
    document.addEventListener("open-command-palette", () => setOpen(true));
    
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-command-palette", () => setOpen(true));
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-sm px-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setOpen(false)} />
      
      <div className="relative w-full max-w-2xl bg-bg-secondary border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command label="Global Command Menu" shouldFilter={true} className="w-full">
          <div className="flex items-center px-4 border-b border-border" cmdk-input-wrapper="">
            <Search className="w-5 h-5 text-text-muted mr-2" />
            <Command.Input 
              autoFocus
              placeholder="Search field notes, workshops, or commands..." 
              value={searchValue}
              onValueChange={setSearchValue}
              className="w-full h-14 bg-transparent text-foreground placeholder:text-text-muted border-none focus:ring-0 outline-none text-base"
            />
            <div className="flex gap-1">
               <kbd className="font-mono text-[10px] bg-background border border-border px-1.5 py-0.5 rounded text-text-muted">ESC</kbd>
            </div>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="py-6 text-center text-sm text-text-muted">
              No results found for "{searchValue}".
            </Command.Empty>

            <Command.Group heading="Workshop (Founding Cohort)">
              <Command.Item 
                onSelect={() => window.location.href = "/learn"}
                className="flex items-center px-3 py-3 rounded-md cursor-pointer hover:bg-accent/10 aria-selected:bg-accent/10 text-text-secondary hover:text-accent aria-selected:text-accent group"
              >
                <MonitorPlay className="w-4 h-4 mr-3" />
                <span className="flex-1 font-medium">Join the Workshop Waitlist</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-aria-selected:opacity-100 transition-opacity" />
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation">
              <Command.Item 
                onSelect={() => window.location.href = "/posts"}
                className="flex items-center px-3 py-3 rounded-md cursor-pointer hover:bg-accent/10 aria-selected:bg-accent/10 text-text-secondary hover:text-accent aria-selected:text-accent group"
              >
                <FileText className="w-4 h-4 mr-3" />
                <span className="flex-1">Browse all Field Notes</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => window.location.href = "/trends"}
                className="flex items-center px-3 py-3 rounded-md cursor-pointer hover:bg-accent/10 aria-selected:bg-accent/10 text-text-secondary hover:text-accent aria-selected:text-accent group"
              >
                <Search className="w-4 h-4 mr-3" />
                <span className="flex-1">Developer Demand Trends (AEO)</span>
              </Command.Item>
            </Command.Group>
            
            <Command.Group heading="Featured Modules">
               <Command.Item 
                onSelect={() => window.location.href = "/posts/1-person-unicorn-tech-stack-2026"}
                className="flex items-center px-3 py-3 rounded-md cursor-pointer hover:bg-accent/10 aria-selected:bg-accent/10 text-text-secondary hover:text-accent aria-selected:text-accent group"
              >
                <span className="font-mono text-xs text-accent mr-3">MOD 01</span>
                <span className="flex-1 text-sm">The Agentic Stack for 1-Person Unicorns</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}