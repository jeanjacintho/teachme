import { ModeToggle } from "./toggle-dark-mode";
import { Button } from "./ui/button";
import { DialogFooter } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { useFolder } from "../context/folder-context";
import { useState } from "react";

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
                if (selected) {
                    // Salvar o novo path no banco de dados
                    await window.api.saveRootFolderPath(selected);
                    console.log('💾 New folder path saved to database:', selected);
                    
                    // Atualizar o contexto local
                    setFolderPath(selected);
                }
            }
        } catch (error) {
            console.error('❌ Error selecting folder in settings:', error);
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
            <div className="flex flex-col gap-2">
                <div className="flex flex-col min-w-0">
                    <span>Course folder</span>
                    <span className="truncate text-xs text-muted-foreground max-w-[250px]">{formatPath(folderPath)}</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSelectFolder} disabled={loading} className="flex-1">
                        {loading ? 'Selecting...' : 'Change folder'}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            if (confirm('Are you sure you want to reset the course folder? You will need to select a new folder on the next app launch.')) {
                                // Limpar o path salvo no banco
                                if (window.api) {
                                    window.api.saveRootFolderPath('').then(() => {
                                        console.log('🗑️ Folder path cleared from database');
                                        setFolderPath(null);
                                    }).catch(console.error);
                                }
                            }
                        }}
                        disabled={!folderPath}
                        className="px-3"
                    >
                        Reset
                    </Button>
                </div>
            </div>
            <DialogFooter className="border-t pt-6">
                <Button variant="secondary">Cancel</Button>
                <Button>Save preferences</Button>
            </DialogFooter>
        </div>
    )
}