import { ModeToggle } from "./toggle-dark-mode";
import { Button } from "./ui/button";
import { DialogFooter } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { useFolder } from "../context/folder-context";
import { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

function formatPath(path: string | null, maxLen = 28) {
    if (!path) return 'No folder selected';
    if (path.length <= maxLen) return path;
    const start = path.slice(0, 16);
    const end = path.slice(-16);
    return `${start}...${end}`;
}

export function DialogSettings() {
    const { folderPath, setFolderPath } = useFolder();
    const [loading, setLoading] = useState(false);

    const handleSelectFolder = async () => {
        setLoading(true);
        try {
            if (window.api) {
                const selected = await window.api.selectFolder();
                if (selected) setFolderPath(selected);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                    <span>Interface theme</span>
                    <span className="text-muted-foreground text-sm">Customize your application theme</span>
                </div>
                <ModeToggle />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                    <span>Change course folder</span>
                    <span className="truncate text-xs text-muted-foreground max-w-[250px]">{formatPath(folderPath)}</span>
                </div>
                <Button variant="outline" onClick={handleSelectFolder} disabled={loading}>
                    {loading ? 'Selecting...' : 'Select folder'}
                </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
                <Label htmlFor="auto-update" className="text-md font-base">Auto Update</Label>
                <Switch id="auto-update" />
            </div>
            <DialogFooter className="border-t pt-6">
                <Button variant="secondary">Cancel</Button>
                <Button>Save preferences</Button>
            </DialogFooter>
        </div>
    )
}