import React from "react";
import { SwitchTimestamp } from "~/components/SwitchTimestamp";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { PROMPT_LANGUAGE_MAP } from "~/utils/constants/language";
import { Slider } from "./ui/slider";

export function PromptOptions(props: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-4 items-center gap-4 ">
      <SwitchTimestamp
        checked={props.checked}
        onCheckedChange={props.onCheckedChange}
      />
      <div>
        <Switch
          id="emoji-mode"
          checked={true}
          // onCheckedChange={props.onCheckedChange}
        />
        <Label htmlFor="emoji-mode">
          是否显示Emoji <span className="text-gray-500">(beta)</span>
        </Label>
      </div>
      <div>
        <Slider id="detail-slider" defaultValue={[400]} max={1000} step={10} />
        <Label htmlFor="detail-slider">
          详细程度 <span className="text-gray-500">(beta)</span>
        </Label>
      </div>
      <div>
        <Slider id="sentence-slider" defaultValue={[5]} max={10} step={1} />
        <Label htmlFor="sentence-slider">
          要点个数 <span className="text-gray-500">(beta)</span>
        </Label>
      </div>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="总结语言" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(PROMPT_LANGUAGE_MAP).map((k: string) => (
            <SelectItem value={PROMPT_LANGUAGE_MAP[k]}>{k}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
