'use client'
import { Button } from "@/components/ui/button";
import { ChartNoAxesCombined, GraduationCap, Heart, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState();
    return (
        <div className="flex gap-4 p-4 md:gap-6 md:p-6">
            <Button className="w-50 h-50" variant="outline" loading={loading} onClick={() => { setLoading(true); router.push('/home') }} disabled={loading}><GraduationCap />Courses</Button>
            <Button className="w-50 h-50" variant="outline" loading={loading} onClick={() => { setLoading(true); router.push('/home') }} disabled={loading}><HomeIcon />Home</Button>
            <Button className="w-50 h-50" variant="outline" loading={loading} onClick={() => { setLoading(true); router.push('/favorites') }} disabled={loading}><Heart />Favorites</Button>
            <Button className="w-50 h-50" variant="outline" loading={loading} onClick={() => { setLoading(true); router.push('/statistics') }} disabled={loading}><ChartNoAxesCombined />Statistics</Button>
        </div>
    )
}