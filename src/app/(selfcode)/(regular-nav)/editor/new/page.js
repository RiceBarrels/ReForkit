"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronsUpDown, Globe, Lock, X, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import codeKinds from '@/app/values/codeKinds.json';
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { CreateRepo, getGitHubUserInfo } from "@/app/actions/github"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "@tanstack/react-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
export default function EditorNewPage() {
    const genWords = async () => {
        const response = await fetch("https://random-word-api.herokuapp.com/word?number=2&length=7");
        const data = await response.json();
        return data.join("-");
    }
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [isClosed, setIsClosed] = useState(false);
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("vanilla")
    const [owner, setOwner] = useState("Loading...")

    const form = useForm({
        defaultValues: {
            codeKind: "vanilla",
            // repo have a max length of 40 characters
            repo: "",
            description: "",
            visibility: "private",
            readme: false,
            autoSaveBranch: "reforkit-auto-save",
        },
        
        onSubmit: async ({ value }) => {
            try {
                const result = await CreateRepo(
                    value.codeKind,
                    value.repo,
                    value.description,
                    value.visibility,
                    value.readme,
                    value.owner,
                    value.autoSaveBranch
                );
                if (result.success) {
                    router.push(`/editor/${result.repo.owner.login}/${result.repo.name}`)
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                toast.error(`Failed to create repository: ${error.message}`);
            }
        },
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            const userInfo = await getGitHubUserInfo();
            setOwner(userInfo.user.login);
            form.setFieldValue("owner", userInfo.user.login);
        }
        fetchUserInfo();
        const fetchRandomWords = async () => {
            const words = await genWords();
            form.setFieldValue("repo", words);
        }
        fetchRandomWords();
    }, []);

    useEffect(() => {
        form.setFieldValue("codeKind", value);
    }, [value]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isClosed ? 0 : 1, display: isClosed ? "none" : "flex"}}
            transition={{ duration: 0.2 }}
            className="flex flex-col p-4 top-0 right-0 fixed w-[100vw] h-screen backdrop-blur-sm bg-background/30 border-1 items-end"
            onClick={() => {setTimeout(() => router.push("/editor"), 200); setIsClosed(true)}}
        >
            {isSignedIn ? (
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: isClosed ? 0.9 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-[calc(100vw-16rem)] h-full flex justify-center items-center"
                >
                    <Card className="w-[calc(100%-10rem)] h-[calc(100vh-10rem)] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="pb-0">
                            <div className="flex flex-row justify-between items-start">
                                <div className="flex flex-col gap-y-1 my-3">
                                    <CardTitle className="">Create New Repository</CardTitle>
                                    <CardDescription className="ml-1">Create a new repository to store your code.</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="size-6" onClick={() => {setTimeout(() => router.push("/editor"), 200); setIsClosed(true)}}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <Separator />
                        </CardHeader>
                        <CardContent className="pl-6 pt-6 pb-12 flex flex-col flex-1 gap-y-3 overflow-y-scroll">
                            <div className="flex flex-col gap-y-1.5 px-2">
                                <form.Field
                                    name="codeKind"
                                    validators={{
                                        onChange: ({ value }) => 
                                            !value ? 'Please select a code environment' : undefined,
                                    }}
                                >
                                    {(field) => (
                                        <>
                                            <Label className="font-bold">Code Environment <span className="text-red-500">*</span></Label>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className="justify-between h-32"
                                                    >
                                                        {value ? <img src={"../../"+codeKinds.find((codeKind) => codeKind.value === value)?.icon} alt={codeKinds.find((codeKind) => codeKind.value === value)?.name} className="w-16 h-16" /> : <div className="w-16 h-16 bg-foreground/10 rounded-md" />}
                                                        <div className="flex flex-col items-center gap-y-2">
                                                            {value
                                                                ? codeKinds.find((codeKind) => codeKind.value === value)?.name || "Select code environment..."
                                                                : <span className="text-foreground/50">Select code environment...</span>}
                                                        </div>
                                                        <ChevronsUpDown className="opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[28rem]">
                                                    <Command>
                                                        <CommandInput placeholder="Search code environment..." className="h-9" />
                                                        <CommandList>
                                                            <CommandEmpty>No code environment found.</CommandEmpty>
                                                            <CommandGroup className="grid grid-cols-2 gap-4 justify-items-center">
                                                            {codeKinds.map((codeKind) => (
                                                                <CommandItem
                                                                key={codeKind.value}
                                                                value={codeKind.value}
                                                                onSelect={(currentValue) => {
                                                                    const newValue = currentValue === value ? value : currentValue;
                                                                    setValue(newValue);
                                                                    form.setFieldValue("codeKind", newValue);
                                                                    setOpen(false);
                                                                }}
                                                                className="h-48 w-48"
                                                                >
                                                                    <div className="flex flex-col h-full items-center gap-y-2 flex-1 justify-center">
                                                                        <img src={"../../"+codeKind.icon} alt={codeKind.name} className="w-16 h-16" />
                                                                        <span className="text-sm font-bold">{codeKind.name}</span>
                                                                        <Check
                                                                            className={cn(
                                                                            "",
                                                                            value === codeKind.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {field.state.meta.errors && (
                                                <span className="text-red-500 text-xs mt-1">{field.state.meta.errors.join(', ')}</span>
                                            )}
                                        </>
                                    )}
                                </form.Field>
                            </div>
                            <Separator className="mb-2" />
                            <div className="flex flex-col gap-y-1 mt-2 px-2 min-h-18">
                                <Label className="font-bold">Auto Save Branch <span className="text-red-500 text-xs">*</span></Label>
                                <form.Field
                                    name="autoSaveBranch"
                                    validators={{
                                        onChange: ({ value }) =>
                                            !value ? 'Please enter a auto save branch' : 
                                                value.length > 60
                                                    ? 'Auto save branch cannot exceed 60 characters'
                                                    : undefined,
                                    }}
                                >
                                    {(field) => (
                                        <div className="flex flex-col gap-y-1">
                                            <Input type="text" 
                                                placeholder="Auto Save Branch" 
                                                value={field.state.value} 
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                                maxLength={60}
                                                onFocus={(e) => {
                                                    // select all text when the input is focused
                                                    e.target.select();
                                                }}
                                            />
                                        {field.state.meta.errors && (
                                            <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
                                        )}
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                            <div className="flex items-start gap-y-1.5 px-2 min-h-18">
                                <div className="flex flex-col gap-y-1">
                                    <Label className="font-bold">Owner <span className="text-red-500">*</span></Label>
                                    <Input type="text" placeholder="Owner" value={owner} disabled />
                                </div>
                                <span className="text-foreground/50 text-xl px-2 flex h-full items-center justify-center">/</span>
                                <div className="flex flex-col gap-y-1 flex-1">
                                    <Label className="font-bold">Repository Name <span className="text-red-500">*</span></Label>
                                    <form.Field
                                        name="repo"
                                        validators={{
                                            onChange: ({ value }) => 
                                                !value 
                                                    ? 'Repository name is required' 
                                                    : /\s/.test(value) 
                                                        ? 'Repository name cannot contain spaces'
                                                        : value.length > 100
                                                            ? 'Repository name cannot exceed 100 characters'
                                                            : undefined,
                                        }}
                                    >
                                        {(field) => (
                                            <div className="flex flex-col gap-y-1">
                                                <Input 
                                                    id={field.name}
                                                    type="text" 
                                                    placeholder="Repository Name"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    onFocus={(e) => {
                                                        // select all text when the input is focused
                                                        e.target.select();
                                                    }}
                                                    onBlur={field.handleBlur}
                                                    maxLength={100}
                                                />
                                                {field.state.meta.errors && (
                                                    <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
                                                )}
                                            </div>
                                        )}
                                    </form.Field>
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-1 mt-2 px-2">
                                <Label className="font-bold">Repository Description <span className="text-foreground/50 text-xs">Optional</span></Label>
                                <form.Field
                                    name="description"
                                >
                                    {(field) => (
                                        <Textarea 
                                            id={field.name}
                                            placeholder="Repository Description"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                        />
                                    )}
                                </form.Field>
                            </div>
                            <Separator className="mb-2" />
                            <form.Field
                                name="visibility"
                            >
                                {(field) => (
                                    <>
                                        <Label className="font-bold mb-2">Repository Visibility <span className="text-red-500">*</span></Label>
                                        <RadioGroup 
                                            defaultValue="private" 
                                            className="flex flex-col gap-y-4 px-2"
                                            value={field.state.value}
                                            onValueChange={field.handleChange}
                                        >
                                            <div className="flex flex-row gap-x-4">
                                                <RadioGroupItem value="public" id="public" />
                                                <Label htmlFor="public"><Globe className="w-4 h-4" /></Label>
                                                <div className="flex flex-col gap-y-1">
                                                    <Label htmlFor="public">Public</Label>
                                                    <Label htmlFor="public" className="text-foreground/50 text-xs">Anyone can view this repository</Label>
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-x-4">
                                                <RadioGroupItem value="private" id="private" />
                                                <Label htmlFor="private"><Lock className="w-4 h-4" /></Label>
                                                <div className="flex flex-col gap-y-1">
                                                    <Label htmlFor="private">Private</Label>
                                                    <Label htmlFor="private" className="text-foreground/50 text-xs">Only you can view this repository</Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </>
                                )}
                            </form.Field>
                            <Separator className="mb-2" />
                            <div className="flex flex-col gap-y-4 px-2">
                                <Label className="font-bold">Initialize this Repository with <span className="text-foreground/50 text-xs">All Optional</span></Label>
                                <form.Field
                                    name="readme"
                                >
                                    {(field) => (
                                        <div className="flex flex-row gap-x-4">
                                            <Checkbox 
                                                id="readme" 
                                                checked={field.state.value}
                                                onCheckedChange={field.handleChange}
                                            />
                                            <Label htmlFor="readme"><BookOpen className="w-4 h-4" /></Label>
                                            <div className="flex flex-col gap-y-1">
                                                <Label htmlFor="readme">Add a README file</Label>
                                                <Label htmlFor="readme" className="text-foreground/50 text-xs">Add a README file to the repository</Label>
                                            </div>
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                        </CardContent>
                        <CardFooter className="px-6 pb-6">
                            <form.Subscribe
                                selector={(state) => [state.isSubmitting]}
                            >
                                {([isSubmitting]) => (
                                    <Button 
                                        className="w-full" 
                                        disabled={isSubmitting}
                                        onClick={() => form.handleSubmit()}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Repository'}
                                    </Button>
                                )}
                            </form.Subscribe>
                        </CardFooter>
                    </Card>
                </motion.div>
            ) : isLoaded ? (
                <></>
            ) : (
                <></>
            )}
        </motion.div>
    )
}