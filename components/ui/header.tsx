import { AuthButton } from "@/components/session/buttons/auth-button";
import Link from "next/link";

export default function Header() {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto min-w-[340px] max-w-[500px]">
            <nav className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="flex items-center justify-between p-3 px-4 gap-6">
                    <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap">
                        GenericMap
                    </Link>
                    <AuthButton />
                </div>
            </nav>
        </div>
    );
}
