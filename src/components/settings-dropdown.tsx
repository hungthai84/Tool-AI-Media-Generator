"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { KeyIcon, SettingsIcon, Globe, Moon, Sun } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function SettingsDropdown() {
  const { t, language, setLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem("ai-media-template-dark-mode");
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === "true";
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("ai-media-template-dark-mode", checked.toString());
    
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLinkApiKey = async () => {
    const aistudio = (window as unknown as { aistudio?: { openSelectKey?: () => Promise<void> } })?.aistudio;
    if (aistudio && typeof aistudio.openSelectKey === "function") {
      try {
        await aistudio.openSelectKey();
      } catch (error) {
        console.error("Failed to open API key selector:", error);
      }
    } else {
      console.info("Gemini API key is configured server-side via process.env.GEMINI_API_KEY.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-4 space-y-4">
        {/* Language Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              {t.language}
            </Label>
            <span className="text-xs text-muted-foreground font-mono">
              {language === "vi" ? "VI" : "EN"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant={language === "vi" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("vi")}
              className="h-8 text-xs font-medium justify-center gap-1.5"
            >
              <span>🇻🇳</span>
              <span>{t.vietnamese}</span>
            </Button>
            <Button
              type="button"
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
              className="h-8 text-xs font-medium justify-center gap-1.5"
            >
              <span>🇬🇧</span>
              <span>{t.english}</span>
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Dark Mode Section */}
        <div className="flex items-center justify-between py-1">
          <Label htmlFor="dark-mode" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
            {darkMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            {darkMode ? t.darkMode : t.lightMode}
          </Label>
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={handleDarkModeToggle}
          />
        </div>

        <DropdownMenuSeparator />

        {/* API Key Section */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <KeyIcon className="w-4 h-4 text-primary" />
            {t.apiConfiguration}
          </Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLinkApiKey}
            className="w-full justify-start text-xs h-9"
          >
            <KeyIcon className="w-3.5 h-3.5 mr-2" />
            {t.linkGcp}
          </Button>
          <p className="text-xs text-muted-foreground leading-normal">
            {t.apiKeyHelp}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}