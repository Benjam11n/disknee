"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getAvailableFreezesAction,
  activateFreezeAction,
} from "@/lib/actions/streaks";
import { Snowflake, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface FreezeInventoryProps {
  userId: string;
  isFrozen?: boolean;
  frozenUntil?: Date;
  onFreezeActivated?: () => void;
}

interface FreezeItem {
  id: string;
  itemId: string;
  name: string;
  duration: number;
}

export function FreezeInventory({
  userId,
  isFrozen = false,
  frozenUntil,
  onFreezeActivated,
}: FreezeInventoryProps) {
  const [freezes, setFreezes] = useState<FreezeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadFreezes();
  }, [userId]);

  const loadFreezes = async () => {
    try {
      setLoading(true);
      const result = await getAvailableFreezesAction({ userId });
      if (result.success) {
        setFreezes(result.data);
      }
    } catch (error) {
      logger.error(error, "Failed to load freezes:");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateFreeze = async (freezeId: string) => {
    setActivating(freezeId);
    try {
      const result = await activateFreezeAction({ userId, freezeId });
      if (result.success) {
        toast.success(`Streak frozen for ${result.data?.duration} day(s)!`);
        await loadFreezes(); // Reload freezes
        onFreezeActivated?.();
      } else {
        toast.error(result.error || "Failed to activate freeze");
      }
    } catch (error) {
      toast.error("Failed to activate freeze");
      console.error(error);
    } finally {
      setActivating(null);
    }
  };

  const totalFreezeDays = freezes.reduce(
    (sum, freeze) => sum + freeze.duration,
    0
  );

  if (freezes.length === 0 && !isFrozen) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Freeze Status */}
      {isFrozen && frozenUntil && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Snowflake className="h-4 w-4 text-blue-600 animate-pulse" />
          <span className="text-sm text-blue-800">
            Streak protected until {frozenUntil.toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Available Freezes */}
      {freezes.length > 0 && (
        <Dialog open={showAll} onOpenChange={setShowAll}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>
                  {totalFreezeDays} Freeze Day{totalFreezeDays !== 1 ? "s" : ""}{" "}
                  Available
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({freezes.length} item{freezes.length !== 1 ? "s" : ""})
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-blue-600" />
                Streak Freezes
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Use these to protect your streak when you can't check in!
              </p>

              {isFrozen && frozenUntil && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Currently Active
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Protected until {frozenUntil.toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {freezes.map((freeze) => (
                  <div
                    key={freeze.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {freeze.duration === 1
                          ? "❄️"
                          : freeze.duration <= 3
                          ? "🧊"
                          : "🌨️"}
                      </div>
                      <div>
                        <p className="font-medium">{freeze.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Protects streak for {freeze.duration} day
                          {freeze.duration !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleActivateFreeze(freeze.id)}
                      disabled={activating === freeze.id || isFrozen}
                    >
                      {activating === freeze.id ? (
                        <span className="animate-pulse">Activating...</span>
                      ) : isFrozen ? (
                        "Active"
                      ) : (
                        "Use"
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {freezes.length === 0 && !isFrozen && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No freezes available. Visit the shop to buy some!
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
