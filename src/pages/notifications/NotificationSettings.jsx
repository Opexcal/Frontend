import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationContext";

/**
 * NotificationSettings - Configure notification preferences
 * Manage how user receives notifications
 */
const NotificationSettings = () => {
  const navigate = useNavigate();
  const { updateSettings, getSettings } = useNotifications();

  const defaultSettings = {
    email: {
      enabled: true,
      frequency: "daily",
      dailyTime: "09:00",
      weeklyDay: "monday",
      types: {
        taskAssignments: true,
        eventInvites: true,
        deadlineReminders: true,
        mentions: false,
        taskCompletions: false,
        systemUpdates: false,
      },
    },
    inApp: {
      taskAssignments: {
        enabled: true,
        showBadge: true,
        playSound: false,
      },
      eventInvites: {
        enabled: true,
        showBadge: true,
        playSound: true,
      },
      deadlineReminders: {
        enabled: true,
        showBadge: true,
        playSound: true,
        reminderTime: "1day",
      },
      mentions: {
        enabled: true,
        showBadge: true,
        playSound: false,
      },
      taskCompletions: {
        enabled: true,
        onlyAssignedByMe: true,
      },
      systemUpdates: {
        enabled: false,
      },
    },
    reminders: {
      defaultTime: "30min",
      allowOverride: true,
    },
    doNotDisturb: {
      enabled: true,
      startTime: "22:00",
      endTime: "08:00",
      applyWeekdays: true,
      applyWeekends: true,
      mode: "high_priority",
    },
    advanced: {
      showPreview: true,
      autoMarkRead: false,
      groupSimilar: true,
      retention: "90days",
    },
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    const saved = getSettings();
    if (saved) {
      setSettings(saved);
    }
  }, []);

  const handleSettingChange = (path, value) => {
    const newSettings = JSON.parse(JSON.stringify(settings));
    const keys = path.split(".");
    let current = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      setHasChanges(false);
      toast.success("Success", {
        description: "Notification settings saved successfully",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save settings",
      });
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    setShowResetDialog(false);
  };

  const handleTestNotification = () => {
    toast.success("Test Notification", {
      description: "This is a test notification to verify your settings",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Notification Settings</h1>
              <p className="text-muted-foreground">
                Manage how you receive notifications
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-sm text-amber-600">
                ⚠ You have unsaved changes
              </span>
            )}
            <div className="flex-1" />
            <Button
              variant="outline"
              onClick={handleTestNotification}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Test Notification
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(true)}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="gap-2"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Email Notifications Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled">Enable email notifications</Label>
              <Switch
                id="email-enabled"
                checked={settings.email.enabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("email.enabled", checked)
                }
              />
            </div>

            {settings.email.enabled && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-frequency" className="mb-2 block">
                      Email frequency
                    </Label>
                    <Select
                      value={settings.email.frequency}
                      onValueChange={(value) =>
                        handleSettingChange("email.frequency", value)
                      }
                    >
                      <SelectTrigger id="email-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">
                          Immediate (for each notification)
                        </SelectItem>
                        <SelectItem value="hourly">Hourly digest</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-3 block font-medium">
                      Include in email digest
                    </Label>
                    <div className="space-y-2">
                      {[
                        { id: "taskAssignments", label: "Task assignments" },
                        { id: "eventInvites", label: "Event invites" },
                        {
                          id: "deadlineReminders",
                          label: "Deadline reminders",
                        },
                        { id: "mentions", label: "Mentions" },
                        {
                          id: "taskCompletions",
                          label: "Task completions",
                        },
                        { id: "systemUpdates", label: "System updates" },
                      ].map((type) => (
                        <div
                          key={type.id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`email-${type.id}`}
                            checked={
                              settings.email.types[type.id]
                            }
                            onCheckedChange={(checked) =>
                              handleSettingChange(
                                `email.types.${type.id}`,
                                checked
                              )
                            }
                          />
                          <Label
                            htmlFor={`email-${type.id}`}
                            className="cursor-pointer"
                          >
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* In-App Notifications Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">In-App Notifications</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Customize how in-app notifications are delivered
          </p>

          <div className="space-y-4">
            {/* Task Assignments */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">
                  Task Assignments
                </Label>
                <Switch
                  checked={settings.inApp.taskAssignments.enabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange(
                      "inApp.taskAssignments.enabled",
                      checked
                    )
                  }
                />
              </div>
              {settings.inApp.taskAssignments.enabled && (
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="task-badge"
                      checked={
                        settings.inApp.taskAssignments.showBadge
                      }
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "inApp.taskAssignments.showBadge",
                          checked
                        )
                      }
                    />
                    <Label htmlFor="task-badge" className="cursor-pointer">
                      Show badge
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="task-sound"
                      checked={
                        settings.inApp.taskAssignments.playSound
                      }
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "inApp.taskAssignments.playSound",
                          checked
                        )
                      }
                    />
                    <Label htmlFor="task-sound" className="cursor-pointer">
                      Play sound
                    </Label>
                  </div>
                </div>
              )}
            </div>

            {/* Event Invites */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">Event Invites</Label>
                <Switch
                  checked={settings.inApp.eventInvites.enabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange("inApp.eventInvites.enabled", checked)
                  }
                />
              </div>
              {settings.inApp.eventInvites.enabled && (
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="event-badge"
                      checked={
                        settings.inApp.eventInvites.showBadge
                      }
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "inApp.eventInvites.showBadge",
                          checked
                        )
                      }
                    />
                    <Label htmlFor="event-badge" className="cursor-pointer">
                      Show badge
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="event-sound"
                      checked={
                        settings.inApp.eventInvites.playSound
                      }
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "inApp.eventInvites.playSound",
                          checked
                        )
                      }
                    />
                    <Label htmlFor="event-sound" className="cursor-pointer">
                      Play sound
                    </Label>
                  </div>
                </div>
              )}
            </div>

            {/* Deadline Reminders */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">
                  Deadline Reminders
                </Label>
                <Switch
                  checked={settings.inApp.deadlineReminders.enabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange(
                      "inApp.deadlineReminders.enabled",
                      checked
                    )
                  }
                />
              </div>
              {settings.inApp.deadlineReminders.enabled && (
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="deadline-badge"
                      checked={
                        settings.inApp.deadlineReminders.showBadge
                      }
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "inApp.deadlineReminders.showBadge",
                          checked
                        )
                      }
                    />
                    <Label htmlFor="deadline-badge" className="cursor-pointer">
                      Show badge
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="deadline-sound"
                      checked={
                        settings.inApp.deadlineReminders.playSound
                      }
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "inApp.deadlineReminders.playSound",
                          checked
                        )
                      }
                    />
                    <Label htmlFor="deadline-sound" className="cursor-pointer">
                      Play sound
                    </Label>
                  </div>
                  <div>
                    <Label
                      htmlFor="deadline-time"
                      className="text-sm mb-1 block"
                    >
                      Reminder time
                    </Label>
                    <Select
                      value={settings.inApp.deadlineReminders.reminderTime}
                      onValueChange={(value) =>
                        handleSettingChange(
                          "inApp.deadlineReminders.reminderTime",
                          value
                        )
                      }
                    >
                      <SelectTrigger id="deadline-time" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15min">15 minutes before</SelectItem>
                        <SelectItem value="30min">30 minutes before</SelectItem>
                        <SelectItem value="1hour">1 hour before</SelectItem>
                        <SelectItem value="1day">1 day before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Mentions */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">Mentions</Label>
                <Switch
                  checked={settings.inApp.mentions.enabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange("inApp.mentions.enabled", checked)
                  }
                />
              </div>
              {settings.inApp.mentions.enabled && (
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mention-badge"
                      checked={
                        settings.inApp.mentions.showBadge
                      }
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "inApp.mentions.showBadge",
                          checked
                        )
                      }
                    />
                    <Label htmlFor="mention-badge" className="cursor-pointer">
                      Show badge
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mention-sound"
                      checked={
                        settings.inApp.mentions.playSound
                      }
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "inApp.mentions.playSound",
                          checked
                        )
                      }
                    />
                    <Label htmlFor="mention-sound" className="cursor-pointer">
                      Play sound
                    </Label>
                  </div>
                </div>
              )}
            </div>

            {/* Task Completions */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">
                  Task Completions
                </Label>
                <Switch
                  checked={settings.inApp.taskCompletions.enabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange(
                      "inApp.taskCompletions.enabled",
                      checked
                    )
                  }
                />
              </div>
              {settings.inApp.taskCompletions.enabled && (
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="completion-assigned"
                      checked={
                        settings.inApp.taskCompletions
                          .onlyAssignedByMe
                      }
                      onCheckedChange={(checked) =>
                        handleSettingChange(
                          "inApp.taskCompletions.onlyAssignedByMe",
                          checked
                        )
                      }
                    />
                    <Label
                      htmlFor="completion-assigned"
                      className="cursor-pointer"
                    >
                      Only for tasks I assigned
                    </Label>
                  </div>
                </div>
              )}
            </div>

            {/* System Updates */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  System Updates
                </Label>
                <Switch
                  checked={settings.inApp.systemUpdates.enabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange(
                      "inApp.systemUpdates.enabled",
                      checked
                    )
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Reminders Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Reminder Preferences</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-reminder" className="mb-2 block">
                Default reminder time before events
              </Label>
              <Select
                value={settings.reminders.defaultTime}
                onValueChange={(value) =>
                  handleSettingChange("reminders.defaultTime", value)
                }
              >
                <SelectTrigger id="default-reminder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15min">15 minutes before</SelectItem>
                  <SelectItem value="30min">30 minutes before</SelectItem>
                  <SelectItem value="1hour">1 hour before</SelectItem>
                  <SelectItem value="1day">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="allow-override"
                checked={settings.reminders.allowOverride}
                onCheckedChange={(checked) =>
                  handleSettingChange("reminders.allowOverride", checked)
                }
              />
              <Label htmlFor="allow-override" className="cursor-pointer">
                Allow event creators to override my reminder preference
              </Label>
            </div>
          </div>
        </Card>

        {/* Do Not Disturb Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Do Not Disturb</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dnd-enabled">Enable Do Not Disturb mode</Label>
              <Switch
                id="dnd-enabled"
                checked={settings.doNotDisturb.enabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("doNotDisturb.enabled", checked)
                }
              />
            </div>

            {settings.doNotDisturb.enabled && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dnd-start" className="text-sm mb-1 block">
                        From (start time)
                      </Label>
                      <input
                        id="dnd-start"
                        type="time"
                        value={settings.doNotDisturb.startTime}
                        onChange={(e) =>
                          handleSettingChange(
                            "doNotDisturb.startTime",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dnd-end" className="text-sm mb-1 block">
                        To (end time)
                      </Label>
                      <input
                        id="dnd-end"
                        type="time"
                        value={settings.doNotDisturb.endTime}
                        onChange={(e) =>
                          handleSettingChange(
                            "doNotDisturb.endTime",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="dnd-weekdays"
                        checked={settings.doNotDisturb.applyWeekdays}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "doNotDisturb.applyWeekdays",
                            checked
                          )
                        }
                      />
                      <Label htmlFor="dnd-weekdays" className="cursor-pointer">
                        Apply on weekdays
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="dnd-weekends"
                        checked={settings.doNotDisturb.applyWeekends}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "doNotDisturb.applyWeekends",
                            checked
                          )
                        }
                      />
                      <Label htmlFor="dnd-weekends" className="cursor-pointer">
                        Apply on weekends
                      </Label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium block mb-2">
                      During quiet hours
                    </Label>
                    <div className="space-y-2">
                      {[
                        { value: "none", label: "Pause all notifications" },
                        {
                          value: "high_priority",
                          label: "Show only high priority",
                        },
                        {
                          value: "urgent_only",
                          label: "Show only urgent (deadlines < 1 hour)",
                        },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`dnd-mode-${option.value}`}
                            name="dnd-mode"
                            value={option.value}
                            checked={
                              settings.doNotDisturb.mode ===
                              option.value
                            }
                            onChange={(e) =>
                              handleSettingChange(
                                "doNotDisturb.mode",
                                e.target.value
                              )
                            }
                            className="cursor-pointer"
                          />
                          <Label
                            htmlFor={`dnd-mode-${option.value}`}
                            className="cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Advanced Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Advanced</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-preview"
                checked={settings.advanced.showPreview}
                onCheckedChange={(checked) =>
                  handleSettingChange("advanced.showPreview", checked)
                }
              />
              <Label htmlFor="show-preview" className="cursor-pointer">
                Show notification preview in alerts
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-mark-read"
                checked={settings.advanced.autoMarkRead}
                onCheckedChange={(checked) =>
                  handleSettingChange("advanced.autoMarkRead", checked)
                }
              />
              <Label htmlFor="auto-mark-read" className="cursor-pointer">
                Auto-mark notifications as read after viewing
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="group-similar"
                checked={settings.advanced.groupSimilar}
                onCheckedChange={(checked) =>
                  handleSettingChange("advanced.groupSimilar", checked)
                }
              />
              <Label htmlFor="group-similar" className="cursor-pointer">
                Group similar notifications
              </Label>
            </div>

            <div>
              <Label htmlFor="retention" className="mb-2 block">
                Notification retention
              </Label>
              <Select
                value={settings.advanced.retention}
                onValueChange={(value) =>
                  handleSettingChange("advanced.retention", value)
                }
              >
                <SelectTrigger id="retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Keep for 7 days</SelectItem>
                  <SelectItem value="30days">Keep for 30 days</SelectItem>
                  <SelectItem value="90days">Keep for 90 days</SelectItem>
                  <SelectItem value="forever">Keep forever</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button variant="outline" className="w-full">
                Clear all read notifications
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all notification settings to their default values.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reset
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationSettings;
