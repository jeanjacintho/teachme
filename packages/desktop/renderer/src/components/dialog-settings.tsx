import { ModeToggle } from "./toggle-dark-mode";
import { Separator } from "./ui/separator";

export function DialogSettings() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <span>Interface theme</span>
                    <span className="text-muted-foreground text-sm">Customize your application theme</span>
                </div>
                <ModeToggle />
            </div>
        </div>
    )
}