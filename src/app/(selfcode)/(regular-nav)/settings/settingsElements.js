import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SettingsContainer({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

export function SettingsHeader({ title }) {
  return (
    <motion.h1 
      className="text-2xl font-bold mb-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      {title}
    </motion.h1>
  );
}

export function SettingsPanel({ title, children }) {
  return (
    <SettingsContainer>
      <SettingsHeader title={title} />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Separator />
      </motion.div>
      {children}
    </SettingsContainer>
  );
}

export function SettingsSwitch({ id, checked, onChange, label }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-md font-semibold">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
