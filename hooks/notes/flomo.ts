import { useState } from "react";
import { useToast } from "~/hooks/use-toast";

export function useSaveToFlomo(note: string, webhook: string) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const save = async () => {
    setLoading(true);
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: note + "#BibiGpt",
      }),
    });
    const json = await response.json();
    console.log("========response========", json);
    if (!response.ok || json.code === -1) {
      console.log("error", response);
      toast({
        variant: "destructive",
        title: response.status.toString(),
        description: json.message,
      });
    } else {
      toast({
        title: response.status.toString(),
        description: "保存成功！快去 Flomo 查看吧。",
      });
    }
    setLoading(false);
  };
  return { save, loading };
}
