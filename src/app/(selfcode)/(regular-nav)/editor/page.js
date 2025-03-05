import { Separator } from "@/components/ui/separator"
import { UserRepositories } from "@/components/user-repositories"

export default function EditorPage() {
    return (
        <div className="flex flex-col p-4">
            <h1 className="text-2xl font-bold mb-4">Your Repositories</h1>
            <Separator className="mb-4" />
            <UserRepositories />
        </div>
    )
}